import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { Order } from "../../../shared/models/Order.js";
import Product from "../../../shared/models/Product.js";
import Transaction from "../../../shared/models/Transaction.js";
import { Cart } from "../../../shared/models/Cart.js";
import { createError } from "../middleware/errorHandler.js";
import { reduceStockForOrder } from "../services/stockService.js";
import { isCODEnabled } from "../services/paymentSettingsService.js";
import { shiprocketService } from "../services/shiprocketService.js";

type ShopperType = "business" | "individual";

/**
 * If order has Shiprocket ids but no awbCode, fetch AWB from Shiprocket API and update the order.
 * Prefers GET /shipments/{id} (returns data.awb), then orders/show/{orderId}.
 */
async function ensureOrderAwbFromShiprocket(order: any): Promise<any> {
  if (order.awbCode) return order;
  if (!order?.shiprocketShipmentId && !order?.shiprocketOrderId) return order;
  try {
    let awbCode: string | null = null;
    if (order.shiprocketShipmentId) {
      const shipment = await shiprocketService.getShipmentByShipmentId(order.shiprocketShipmentId);
      awbCode = shipment?.awb_code ?? null;
    }
    if (!awbCode && order.shiprocketOrderId) {
      const result = await shiprocketService.getOrderByShiprocketId(order.shiprocketOrderId);
      awbCode = result?.awb_code ?? null;
    }
    if (awbCode) {
      await Order.updateOne(
        { _id: order._id },
        { $set: { awbCode } }
      );
      return { ...order, awbCode };
    }
  } catch (e) {
    console.warn(`[Order] Could not fetch AWB from Shiprocket for order ${order.orderNumber}:`, (e as Error).message);
  }
  return order;
}

const getEffectiveUnitPrice = (product: any, userType: ShopperType): number => {
  const isBusiness = userType === "business";
  const regularPrice = isBusiness
    ? product.businessRegularPrice ?? product.regularPrice ?? product.price ?? 0
    : product.regularPrice ?? product.price ?? 0;

  // Treat <=0 sale prices as "unset" to match transformProduct logic
  const getValidSalePrice = (salePrice: any): number | undefined => {
    if (typeof salePrice === "number" && salePrice > 0) return salePrice;
    return undefined;
  };

  const salePrice = isBusiness
    ? getValidSalePrice(product.businessSalePrice) ??
      getValidSalePrice(product.salePrice)
    : getValidSalePrice(product.salePrice);

  const price = isBusiness
    ? product.businessPrice ?? salePrice ?? product.price ?? regularPrice
    : salePrice ?? product.price ?? regularPrice;
  return Number(price) || 0;
};

const parsePriceToNumber = (value: any): number => {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "string") {
    const cleaned = value.replace(/[^\d.]/g, "");
    const parsed = parseFloat(cleaned);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  const parsed = parseFloat(String(value ?? "").replace(/[^\d.]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
};

export const createOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    const userType: ShopperType =
      req.user?.userType === "business" ? "business" : "individual";
    if (!userId) {
      return next(createError("User not authenticated", 401));
    }

    const {
      items,
      shippingInfo,
      paymentMethod,
      subtotal,
      shippingCost,
      total,
      couponCode,
      couponDiscount,
    } = req.body;

    // Validate required fields
    if (
      !items ||
      !Array.isArray(items) ||
      items.length === 0 ||
      !shippingInfo ||
      !paymentMethod ||
      !total
    ) {
      return next(createError("Missing required fields", 400));
    }

    // Validate shipping info fields
    const requiredShippingFields = [
      "firstName",
      "lastName",
      "email",
      "phone",
      "address",
      "city",
      "state",
      "pincode",
      "country",
    ];
    const missingFields = requiredShippingFields.filter(
      (field) => !shippingInfo[field as keyof typeof shippingInfo]?.trim()
    );
    if (missingFields.length > 0) {
      return next(
        createError(
          `Missing shipping information: ${missingFields.join(", ")}`,
          400
        )
      );
    }

    // Check if COD is enabled when COD payment method is selected
    if (paymentMethod === "cod") {
      const codEnabled = await isCODEnabled();
      if (!codEnabled) {
        return next(createError("Cash on Delivery is currently disabled", 400));
      }
    }

    // Server-authoritative pricing: recompute item prices + subtotal from DB
    const safeItems: any[] = Array.isArray(items) ? items : [];
    const productIds = safeItems
      .map((it: any) => String(it?.productId || "").split("_")[0])
      .filter((id) => mongoose.Types.ObjectId.isValid(id));

    const products = await Product.find({ _id: { $in: productIds } }).lean();
    const productMap = new Map<string, any>(
      products.map((p: any) => [p._id.toString(), p])
    );

    const normalizedItems = safeItems.map((it: any) => {
      const rawId = String(it?.productId || "");
      const baseId = rawId.split("_")[0];
      const product = productMap.get(baseId);
      if (!product || product.isDeleted) {
        throw createError("One or more products are not available", 400);
      }

      const unitPrice = getEffectiveUnitPrice(product, userType);
      const qty = Math.max(1, Number(it?.quantity || 1));

      return {
        ...it,
        price: unitPrice,
        quantity: qty,
      };
    });

    const computedSubtotal = normalizedItems.reduce(
      (sum: number, it: any) =>
        sum + (Number(it.price) || 0) * (Number(it.quantity) || 1),
      0
    );

    const computedShipping = Number(shippingCost) || 0;
    const computedCouponDiscount = Math.max(0, Number(couponDiscount) || 0);

    // No COD fee - removed as requested
    const codFee = 0;
    const finalTotal = Math.max(
      0,
      computedSubtotal + computedShipping + codFee - computedCouponDiscount
    );

    // Determine initial status based on payment method
    // COD orders start as ORDER_REQUESTED (waiting for sales call confirmation)
    // Online payment orders start as PENDING_PAYMENT
    const initialStatus =
      paymentMethod === "cod" ? "ORDER_REQUESTED" : "PENDING_PAYMENT";
    const initialPaymentStatus =
      paymentMethod === "cod" ? "PENDING" : "PENDING";

    // Generate order number (same logic as pre-save hook)
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    const orderNumber = `ORD${year}${month}${day}${random}`;

    // Set estimated delivery to 4 days from now
    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 4);

    // Create order
    const order = new Order({
      userId,
      orderNumber,
      items: normalizedItems,
      shippingInfo,
      paymentMethod,
      subtotal: computedSubtotal,
      shippingCost: computedShipping,
      codFee,
      couponCode: couponCode || null,
      couponDiscount: computedCouponDiscount,
      total: finalTotal,
      status: initialStatus,
      paymentStatus: initialPaymentStatus,
      estimatedDelivery, // Set estimatedDelivery explicitly
    });

    await order.save();

    // For COD orders, clear cart immediately (stock is reduced when order is processed)
    if (paymentMethod === "cod") {
      try {
        const cart = await Cart.findOne({ userId });
        if (cart) {
          cart.items.splice(0, cart.items.length); // Clear array in place
          await cart.save();
          console.log(`Cart cleared for user ${userId} (COD order)`);
        }
      } catch (error) {
        console.error("Failed to clear cart for COD order:", error);
        // Don't fail the order if cart clearing fails
      }
    }

    // Note: Coupon usage is NOT marked here - it will be marked when order is confirmed/paid
    // For COD orders, coupon will be marked when order status changes to confirmed
    // For payment orders, coupon will be marked when payment is successful

    // Add items to purchase history for recommendations
    for (const item of normalizedItems) {
      try {
        const { recommendationService } = await import(
          "../services/recommendationService.js"
        );
        const unitPrice = parsePriceToNumber(item.price);
        const qty = Math.max(1, Number(item.quantity) || 1);
        await recommendationService.addPurchaseToHistory(userId, {
          productId: String(item.productId),
          productName: item.name,
          category: item.category,
          series: item.category, // Using category as series for now
          quantity: qty,
          price: unitPrice,
          totalAmount: unitPrice * qty,
        });
      } catch (error) {
        // Don't fail the order if purchase history fails
        console.warn("[purchase-history] Failed to record purchase item", {
          userId,
          productId: item?.productId,
        });
      }
    }

    res.status(201).json({
      message: "Order created successfully",
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        total: order.total,
        status: order.status,
        estimatedDelivery: order.estimatedDelivery,
      },
    });
  } catch (error: any) {
    // Preserve original status code if it's a client error (4xx), otherwise use 500
    const statusCode =
      error?.statusCode && error.statusCode >= 400 && error.statusCode < 500
        ? error.statusCode
        : 500;

    if (statusCode >= 500) {
      // Only log server errors, not client validation errors
      console.error("Error creating order:", error);
      console.error("Error stack:", error.stack);
      console.error("Request body:", JSON.stringify(req.body, null, 2));
    }

    next(createError(error?.message || "Failed to create order", statusCode));
  }
};

export const getOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return next(createError("User not authenticated", 401));
    }

    // Exclude soft-deleted orders from customer history
    let orders = await Order.find({ userId, isDeleted: { $ne: true } })
      .sort({ orderDate: -1 })
      .select("-__v")
      .lean();

    // Ensure AWB is populated from Shiprocket for orders that have shiprocketOrderId but no awbCode
    orders = await Promise.all(
      orders.map((o: any) => ensureOrderAwbFromShiprocket(o))
    );

    // Check which products are deleted and mark them in orders
    const allProductIds = new Set<string>();
    orders.forEach((order) => {
      order.items?.forEach((item: any) => {
        if (item.productId) {
          allProductIds.add(item.productId.toString());
        }
      });
    });

    if (allProductIds.size > 0) {
      // Convert productId strings to ObjectIds for the query
      const objectIds = Array.from(allProductIds)
        .map((id: string) => {
          try {
            return new mongoose.Types.ObjectId(id);
          } catch (error) {
            // If conversion fails, it might be a numeric ID, skip it
            return null;
          }
        })
        .filter(Boolean);

      const products = await Product.find({
        _id: { $in: objectIds },
      }).select("_id isDeleted");

      const deletedProductIds = new Set(
        products.filter((p) => p.isDeleted).map((p) => p._id.toString())
      );

      // Mark items with deleted products; include id for client (e.g. tracking API)
      const ordersWithDeletedInfo = orders.map((order: any) => ({
        ...order,
        id: order._id?.toString?.() ?? order._id,
        items: order.items?.map((item: any) => ({
          ...item,
          isDeleted: deletedProductIds.has(item.productId?.toString()),
          isAvailable: !deletedProductIds.has(item.productId?.toString()),
        })),
      }));

      res.json({ orders: ordersWithDeletedInfo });
    } else {
      const ordersWithId = orders.map((order: any) => ({
        ...order,
        id: order._id?.toString?.() ?? order._id,
      }));
      res.json({ orders: ordersWithId });
    }
  } catch (error) {
    console.error("Error in getOrders:", error);
    next(createError("Failed to fetch orders", 500));
  }
};

export const getOrderById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return next(createError("User not authenticated", 401));
    }

    const { orderId } = req.params;
    const order = await Order.findOne({
      _id: orderId,
      userId,
      isDeleted: { $ne: true },
    })
      .select("-__v")
      .lean();

    if (!order) {
      return next(createError("Order not found", 404));
    }

    // Ensure AWB is populated from Shiprocket if missing
    const orderWithAwb = await ensureOrderAwbFromShiprocket(order);

    // Check which products are deleted
    const productIds =
      orderWithAwb.items?.map((item: any) => item.productId).filter(Boolean) || [];

    if (productIds.length > 0) {
      // Convert productId strings to ObjectIds for the query
      const objectIds = productIds
        .map((id: string) => {
          try {
            return new mongoose.Types.ObjectId(id);
          } catch (error) {
            // If conversion fails, it might be a numeric ID, skip it
            return null;
          }
        })
        .filter(Boolean);

      const products = await Product.find({
        _id: { $in: objectIds },
      }).select("_id isDeleted");

      const deletedProductIds = new Set(
        products.filter((p) => p.isDeleted).map((p) => p._id.toString())
      );

      // Mark items with deleted products
      const orderWithDeletedInfo = {
        ...orderWithAwb,
        items: orderWithAwb.items?.map((item: any) => ({
          ...item,
          isDeleted: deletedProductIds.has(item.productId?.toString()),
          isAvailable: !deletedProductIds.has(item.productId?.toString()),
        })),
      };

      res.json({ order: orderWithDeletedInfo });
    } else {
      res.json({ order: orderWithAwb });
    }
  } catch (error) {
    console.error("Error in getOrderById:", error);
    next(createError("Failed to fetch order", 500));
  }
};

export const updateOrderStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    const userType = req.user?.userType;
    if (!userId) {
      return next(createError("User not authenticated", 401));
    }

    const { orderId } = req.params;
    let { status, trackingNumber, notes } = req.body || {};
    // Some clients send status in query for PATCH /orders/:id/status
    if ((status === undefined || status === null) && typeof req.query?.status === "string") {
      status = req.query.status;
    }

    const isAdmin = (userType || "").toLowerCase() === "admin";
    const orderQuery = isAdmin
      ? { _id: orderId, isDeleted: { $ne: true } }
      : { _id: orderId, userId, isDeleted: { $ne: true } };

    const order = await Order.findOne(orderQuery);

    if (!order) {
      return next(createError("Order not found", 404));
    }

    // Update fields
    const previousStatus = order.status;
    const statusChanged = status && status !== order.status;
    if (status) order.status = status;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (notes) order.notes = notes;

    // Determine whether to reduce stock for COD when moving to PROCESSING
    const shouldReduceStockForCOD =
      order.paymentMethod === "cod" &&
      statusChanged &&
      status === "PROCESSING" &&
      previousStatus !== "PROCESSING";

    // For COD orders, mark coupon as used when order is confirmed/processing
    const isCODOrder = order.paymentMethod === "cod";
    const isMovingToConfirmedState =
      statusChanged &&
      status &&
      ["PROCESSING", "ORDER_SUCCESS", "SHIPPED", "DELIVERED"].includes(status) &&
      previousStatus === "ORDER_REQUESTED";
    const shouldMarkCouponForCOD =
      isCODOrder && isMovingToConfirmedState && order.couponCode;

    // Create Shiprocket order when moving to PROCESSING status
    const shouldCreateShiprocketOrder =
      statusChanged &&
      status === "PROCESSING" &&
      previousStatus !== "PROCESSING" &&
      !order.shiprocketOrderId;

    await order.save();

    // When order is SHIPPED or DELIVERED and has Shiprocket but no AWB, fetch AWB from Shiprocket and save to DB
    // Use body status as fallback so we run when client sends status: "SHIPPED" even if order.status wasn't updated
    const effectiveStatus = status === "SHIPPED" || status === "DELIVERED" ? status : order.status;
    const shouldFetchAwbForShipped =
      (effectiveStatus === "SHIPPED" || effectiveStatus === "DELIVERED") &&
      !!order.shiprocketOrderId &&
      !order.awbCode;

    // Mark coupon as used for COD orders when they are confirmed
    if (shouldMarkCouponForCOD) {
      try {
        const { applyCoupon } = await import(
          "../controllers/couponController.js"
        );
        const mockReq = {
          body: {
            code: order.couponCode,
            userId: order.userId?.toString(),
            orderId: order._id.toString(),
          },
        } as any;
        const mockRes = {
          json: (data: any) => data,
        } as any;
        await applyCoupon(mockReq, mockRes, () => {});
        console.log(
          `Coupon ${order.couponCode} marked as used for COD order ${order._id} (status: ${status})`
        );
      } catch (error) {
        // Don't fail the order update if coupon application fails
        console.error("Failed to apply coupon for COD order:", error);
      }
    }

    if (shouldReduceStockForCOD) {
      try {
        await reduceStockForOrder(order._id);
        console.log(
          `[COD Stock Reduction] Stock reduced when order ${order._id} moved to processing`
        );
      } catch (error: any) {
        console.error(
          `[COD Stock Reduction] Failed to reduce stock for COD order ${order._id}:`,
          error
        );
        // Do not block status updates if stock reduction fails
      }
    }

    // Create Shiprocket order when moving to PROCESSING status
    let shiprocketResult = null;
    if (shouldCreateShiprocketOrder) {
      try {
        console.log(`[Shiprocket] Creating order for ${order.orderNumber}...`);
        shiprocketResult = await shiprocketService.createOrder(order);
        
        if (shiprocketResult.success) {
          // Update order with Shiprocket details
          await Order.updateOne(
            { _id: order._id },
            {
              $set: {
                shiprocketOrderId: shiprocketResult.shiprocketOrderId,
                shiprocketShipmentId: shiprocketResult.shiprocketShipmentId,
                awbCode: shiprocketResult.awbCode,
                courierName: shiprocketResult.courierName,
              },
            }
          );
          console.log(
            `[Shiprocket] Order ${order.orderNumber} created on Shiprocket:`,
            shiprocketResult
          );
        } else {
          console.error(
            `[Shiprocket] Failed to create order ${order.orderNumber}:`,
            shiprocketResult.message
          );
        }
      } catch (error: any) {
        console.error(
          `[Shiprocket] Error creating order ${order.orderNumber}:`,
          error.message
        );
        // Don't block status update if Shiprocket creation fails
      }
    }

    // When status is set to SHIPPED, assign AWB from Shiprocket API to DB
    if (shouldFetchAwbForShipped) {
      try {
        const shiprocketOrder = await shiprocketService.getOrderByShiprocketId(order.shiprocketOrderId!);
        if (shiprocketOrder?.awb_code) {
          await Order.updateOne(
            { _id: order._id },
            { $set: { awbCode: shiprocketOrder.awb_code } }
          );
          console.log(`[Shiprocket] AWB assigned for order ${order.orderNumber}: ${shiprocketOrder.awb_code}`);
        } else {
          console.warn(`[Shiprocket] No AWB yet for order ${order.orderNumber} (shiprocketOrderId: ${order.shiprocketOrderId})`);
        }
      } catch (error: any) {
        console.error(
          `[Shiprocket] Error fetching AWB for order ${order.orderNumber}:`,
          error.message
        );
        // Don't block status update
      }
    }

    // Notifications removed

    res.json({
      message: "Order updated successfully",
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        trackingNumber: order.trackingNumber,
      },
      shiprocket: shiprocketResult ? {
        success: shiprocketResult.success,
        shiprocketOrderId: shiprocketResult.shiprocketOrderId,
        shiprocketShipmentId: shiprocketResult.shiprocketShipmentId,
        awbCode: shiprocketResult.awbCode,
        courierName: shiprocketResult.courierName,
        message: shiprocketResult.message,
      } : undefined,
    });
  } catch (error) {
    next(createError("Failed to update order", 500));
  }
};

// Create order for PhonePe payment
export const createOrderForPhonepe = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    const userType: ShopperType =
      req.user?.userType === "business" ? "business" : "individual";
    if (!userId) {
      return next(createError("User not authenticated", 401));
    }

    const {
      items,
      shippingInfo,
      subtotal,
      shippingCost,
      total,
      merchantTransactionId,
      testMode,
      couponCode,
      couponDiscount,
      paymentMethod,
      cryptoChain,
      cryptoToken,
    } = req.body;

    // Validate required fields
    if (
      !items ||
      !Array.isArray(items) ||
      items.length === 0 ||
      !shippingInfo ||
      !total ||
      !merchantTransactionId
    ) {
      return next(createError("Missing required fields", 400));
    }

    // No processing fee - removed as requested
    const phonepeFee = 0;

    // Server-authoritative pricing: recompute item prices + subtotal from DB
    const safeItems: any[] = Array.isArray(items) ? items : [];
    const productIds = safeItems
      .map((it: any) => String(it?.productId || "").split("_")[0])
      .filter((id) => mongoose.Types.ObjectId.isValid(id));

    const products = await Product.find({ _id: { $in: productIds } }).lean();
    const productMap = new Map<string, any>(
      products.map((p: any) => [p._id.toString(), p])
    );

    const normalizedItems = safeItems.map((it: any) => {
      const rawId = String(it?.productId || "");
      const baseId = rawId.split("_")[0];
      const product = productMap.get(baseId);
      if (!product || product.isDeleted) {
        throw createError("One or more products are not available", 400);
      }

      const unitPrice = getEffectiveUnitPrice(product, userType);
      const qty = Math.max(1, Number(it?.quantity || 1));

      return {
        ...it,
        price: unitPrice,
        quantity: qty,
      };
    });

    const computedSubtotal = normalizedItems.reduce(
      (sum: number, it: any) =>
        sum + (Number(it.price) || 0) * (Number(it.quantity) || 1),
      0
    );
    const computedShipping = Number(shippingCost) || 0;
    const computedCouponDiscount = Math.max(0, Number(couponDiscount) || 0);

    const finalTotal = Math.max(
      0,
      computedSubtotal + computedShipping + phonepeFee - computedCouponDiscount
    );

    // Generate order number
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    const orderNumber = `ORD${year}${month}${day}${random}`;

    // Set estimated delivery to 4 days from now
    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 4);

    // Determine actual payment method
    const actualPaymentMethod =
      paymentMethod === "CONTROPAY"
        ? "CONTROPAY"
        : paymentMethod === "RAZORPAY"
        ? "RAZORPAY"
        : "PHONEPE";

    // Create order with appropriate status based on test mode
    const order = new Order({
      userId,
      orderNumber,
      items: normalizedItems,
      shippingInfo,
      paymentMethod: actualPaymentMethod,
      subtotal: computedSubtotal,
      shippingCost: computedShipping,
      phonepeFee,
      couponCode: couponCode || null,
      couponDiscount: computedCouponDiscount,
      total: finalTotal,
      status: testMode ? "ORDER_SUCCESS" : "PENDING_PAYMENT",
      paymentStatus: testMode ? "COMPLETED" : "PENDING",
      estimatedDelivery,
      testMode: testMode || false,
      // Crypto payment details (for CONTROPAY)
      ...(actualPaymentMethod === "CONTROPAY" && {
        cryptoChain: cryptoChain || null,
        cryptoToken: cryptoToken || null,
      }),
    });

    await order.save();

    // Note: Coupon usage is NOT marked here - it will be marked when payment is successful
    // Coupon will be marked as used in the payment callback when payment status is COMPLETED

    // Add items to purchase history for recommendations (including test orders)
    for (const item of normalizedItems) {
      try {
        const { recommendationService } = await import(
          "../services/recommendationService.js"
        );
        const unitPrice = parsePriceToNumber(item.price);
        const qty = Math.max(1, Number(item.quantity) || 1);
        await recommendationService.addPurchaseToHistory(userId, {
          productId: String(item.productId),
          productName: item.name,
          category: item.category,
          series: item.category, // Using category as series for now
          quantity: qty,
          price: unitPrice,
          totalAmount: unitPrice * qty,
        });
      } catch (error) {
        // Don't fail the order if purchase history fails
        console.warn("[purchase-history] Failed to record purchase item", {
          userId,
          productId: item?.productId,
        });
      }
    }

    res.status(201).json({
      message: "Order created successfully for PhonePe payment",
      order: {
        id: order._id.toString(),
        orderNumber: order.orderNumber,
        total: order.total,
        status: order.status,
        estimatedDelivery: order.estimatedDelivery,
      },
    });
  } catch (error: any) {
    // Preserve original status code if it's a client error (4xx), otherwise use 500
    const statusCode =
      error?.statusCode && error.statusCode >= 400 && error.statusCode < 500
        ? error.statusCode
        : 500;

    if (statusCode >= 500) {
      // Only log server errors, not client validation errors
      console.error("Error creating order for PhonePe payment:", error);
      console.error("Error stack:", error.stack);
    }

    next(
      createError(
        error?.message || "Failed to create order for PhonePe payment",
        statusCode
      )
    );
  }
};

// Get order details for success page validation
export const getOrderForSuccessPage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return next(createError("User not authenticated", 401));
    }

    const { orderId, transactionId } = req.query;

    if (!orderId && !transactionId) {
      return next(createError("Order ID or Transaction ID is required", 400));
    }

    let order;

    if (orderId) {
      // Get order by ID

      // Try to find the order with more flexible query
      order = await Order.findOne({
        _id: orderId,
        userId: userId,
        isDeleted: { $ne: true },
      });

      if (order) {
        const isCODOrder = order.paymentMethod === "cod";
        const validStatuses = [
          "ORDER_SUCCESS",
          "PROCESSING",
          "SHIPPED",
          "DELIVERED",
          ...(isCODOrder ? ["ORDER_REQUESTED"] : []),
        ];
        const hasValidStatus = validStatuses.includes(order.status);
        const hasValidPaymentStatus =
          order.paymentStatus === "COMPLETED" ||
          (isCODOrder && order.paymentStatus === "PENDING") ||
          order.paymentMethod === "RAZORPAY";

        if (!hasValidStatus || !hasValidPaymentStatus) {
          order = null;
        }
      }
    } else if (transactionId) {
      // Get order by transaction ID
      const transaction = await Transaction.findOne({
        phonepeTransactionId: transactionId,
        userId: userId,
        status: "SUCCESS",
      });

      if (transaction && transaction.orderId) {
        order = await Order.findOne({
          _id: transaction.orderId,
          userId: userId,
          status: {
            $in: ["ORDER_SUCCESS", "PROCESSING", "SHIPPED", "DELIVERED"],
          },
          paymentStatus: "COMPLETED",
          isDeleted: { $ne: true },
        });
      }
    }

    if (!order) {
      return next(createError("Order not found or not completed", 404));
    }

    // Check if order was completed recently (within last 30 minutes)
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    if (order.orderDate < thirtyMinutesAgo) {
      return next(createError("Order success page access expired", 403));
    }

    res.json({
      success: true,
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        items: order.items,
        shippingInfo: order.shippingInfo,
        paymentMethod: order.paymentMethod,
        subtotal: order.subtotal,
        shippingCost: order.shippingCost,
        total: order.total,
        status: order.status,
        paymentStatus: order.paymentStatus,
        orderDate: order.orderDate,
        estimatedDelivery: order.estimatedDelivery,
      },
    });
  } catch (error: any) {
    next(createError("Failed to get order details", 500));
  }
};
