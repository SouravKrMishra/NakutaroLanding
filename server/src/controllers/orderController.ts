import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { Order } from "../../../shared/models/Order.js";
import { Product } from "../../../shared/models/Product.js";
import Transaction from "../../../shared/models/Transaction.js";
import { createError } from "../middleware/errorHandler.js";

export const createOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
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
    if (!items || !shippingInfo || !paymentMethod || !total) {
      return next(createError("Missing required fields", 400));
    }

    // Calculate COD fee if applicable
    const codFee = paymentMethod === "cod" ? 50 : 0;
    const finalTotal = total + codFee;

    // Create order
    const order = new Order({
      userId,
      items,
      shippingInfo,
      paymentMethod,
      subtotal,
      shippingCost,
      codFee,
      couponCode: couponCode || null,
      couponDiscount: couponDiscount || 0,
      total: finalTotal,
    });

    await order.save();

    // Apply coupon if one was used (record usage)
    if (couponCode) {
      try {
        const { applyCoupon } = await import("../controllers/couponController.js");
        // Create a mock request/response for applyCoupon
        const mockReq = {
          body: {
            code: couponCode,
            userId: userId.toString(),
            orderId: order._id.toString(),
          },
        } as any;
        const mockRes = {
          json: (data: any) => data,
        } as any;
        await applyCoupon(mockReq, mockRes, () => {});
      } catch (error) {
        // Don't fail the order if coupon application fails
        console.error("Failed to apply coupon:", error);
      }
    }

    // Add items to purchase history for recommendations
    for (const item of items) {
      try {
        const { recommendationService } = await import(
          "../services/recommendationService.js"
        );
        await recommendationService.addPurchaseToHistory(userId, {
          productId: item.productId,
          productName: item.name,
          category: item.category,
          series: item.category, // Using category as series for now
          quantity: item.quantity,
          price: parseFloat(item.price.replace(/[^\d.]/g, "")),
          totalAmount:
            parseFloat(item.price.replace(/[^\d.]/g, "")) * item.quantity,
        });
      } catch (error) {
        // Don't fail the order if purchase history fails
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
  } catch (error) {
    next(createError("Failed to create order", 500));
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

    const orders = await Order.find({ userId })
      .sort({ orderDate: -1 })
      .select("-__v")
      .lean();

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
        .map((id) => {
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
      const ordersWithDeletedInfo = orders.map((order) => ({
        ...order,
        items: order.items?.map((item: any) => ({
          ...item,
          isDeleted: deletedProductIds.has(item.productId?.toString()),
          isAvailable: !deletedProductIds.has(item.productId?.toString()),
        })),
      }));

      res.json({ orders: ordersWithDeletedInfo });
    } else {
      res.json({ orders });
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
    const order = await Order.findOne({ _id: orderId, userId })
      .select("-__v")
      .lean();

    if (!order) {
      return next(createError("Order not found", 404));
    }

    // Check which products are deleted
    const productIds =
      order.items?.map((item: any) => item.productId).filter(Boolean) || [];

    if (productIds.length > 0) {
      // Convert productId strings to ObjectIds for the query
      const objectIds = productIds
        .map((id) => {
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
        ...order,
        items: order.items?.map((item: any) => ({
          ...item,
          isDeleted: deletedProductIds.has(item.productId?.toString()),
          isAvailable: !deletedProductIds.has(item.productId?.toString()),
        })),
      };

      res.json({ order: orderWithDeletedInfo });
    } else {
      res.json({ order });
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
    if (!userId) {
      return next(createError("User not authenticated", 401));
    }

    const { orderId } = req.params;
    const { status, trackingNumber, notes } = req.body;

    const order = await Order.findOne({ _id: orderId, userId });

    if (!order) {
      return next(createError("Order not found", 404));
    }

    // Update fields
    const statusChanged = status && status !== order.status;
    if (status) order.status = status;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (notes) order.notes = notes;

    await order.save();

    // Notifications removed

    res.json({
      message: "Order updated successfully",
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        trackingNumber: order.trackingNumber,
      },
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
    } = req.body;

    // Validate required fields
    if (!items || !shippingInfo || !total || !merchantTransactionId) {
      return next(createError("Missing required fields", 400));
    }

    // No processing fee - removed as requested
    const phonepeFee = 0;
    const finalTotal = total; // Total already includes discount from frontend

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

    // Create order with appropriate status based on test mode
    const order = new Order({
      userId,
      orderNumber,
      items,
      shippingInfo,
      paymentMethod: "PHONEPE",
      subtotal,
      shippingCost,
      phonepeFee,
      couponCode: couponCode || null,
      couponDiscount: couponDiscount || 0,
      total: finalTotal,
      status: testMode ? "CONFIRMED" : "PENDING_PAYMENT",
      paymentStatus: testMode ? "COMPLETED" : "PENDING",
      estimatedDelivery,
      testMode: testMode || false,
    });

    await order.save();

    // Apply coupon if one was used (record usage)
    if (couponCode) {
      try {
        const { applyCoupon } = await import("../controllers/couponController.js");
        // Create a mock request/response for applyCoupon
        const mockReq = {
          body: {
            code: couponCode,
            userId: userId.toString(),
            orderId: order._id.toString(),
          },
        } as any;
        const mockRes = {
          json: (data: any) => data,
        } as any;
        await applyCoupon(mockReq, mockRes, () => {});
      } catch (error) {
        // Don't fail the order if coupon application fails
        console.error("Failed to apply coupon:", error);
      }
    }

    // Add items to purchase history for recommendations (including test orders)
    for (const item of items) {
      try {
        const { recommendationService } = await import(
          "../services/recommendationService.js"
        );
        await recommendationService.addPurchaseToHistory(userId, {
          productId: item.productId,
          productName: item.name,
          category: item.category,
          series: item.category, // Using category as series for now
          quantity: item.quantity,
          price: parseFloat(item.price.replace(/[^\d.]/g, "")),
          totalAmount:
            parseFloat(item.price.replace(/[^\d.]/g, "")) * item.quantity,
        });
      } catch (error) {
        // Don't fail the order if purchase history fails
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
    next(createError("Failed to create order for PhonePe payment", 500));
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
      });

      if (order) {
        // Check if order meets validation criteria
        const validStatuses = [
          "PAID",
          "CONFIRMED",
          "processing",
          "shipped",
          "delivered",
        ];
        const hasValidStatus = validStatuses.includes(order.status);
        const hasValidPaymentStatus = order.paymentStatus === "COMPLETED";

        if (!hasValidStatus || !hasValidPaymentStatus) {
          order = null; // Reset order if it doesn't meet criteria
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
            $in: ["PAID", "CONFIRMED", "processing", "shipped", "delivered"],
          },
          paymentStatus: "COMPLETED",
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
