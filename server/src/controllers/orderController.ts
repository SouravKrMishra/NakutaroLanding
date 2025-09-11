import { Request, Response, NextFunction } from "express";
import { Order } from "../../../shared/models/Order.js";
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
      total: finalTotal,
    });

    await order.save();

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
        console.error("Error adding to purchase history:", error);
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
      .select("-__v");

    res.json({ orders });
  } catch (error) {
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
    const order = await Order.findOne({ _id: orderId, userId }).select("-__v");

    if (!order) {
      return next(createError("Order not found", 404));
    }

    res.json({ order });
  } catch (error) {
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
    if (status) order.status = status;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (notes) order.notes = notes;

    await order.save();

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

    console.log("Request body:", JSON.stringify(req.body, null, 2));

    const {
      items,
      shippingInfo,
      subtotal,
      shippingCost,
      total,
      merchantTransactionId,
      testMode,
    } = req.body;

    // Validate required fields
    if (!items || !shippingInfo || !total || !merchantTransactionId) {
      return next(createError("Missing required fields", 400));
    }

    console.log("All required fields present");

    // Calculate PhonePe processing fee
    const phonepeFee = 2;
    const finalTotal = total + phonepeFee;

    console.log("Creating order with data:", {
      userId,
      items: items.length,
      shippingInfo: Object.keys(shippingInfo),
      subtotal,
      shippingCost,
      total: finalTotal,
    });

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
      total: finalTotal,
      status: testMode ? "CONFIRMED" : "PENDING_PAYMENT",
      paymentStatus: testMode ? "COMPLETED" : "PENDING",
      estimatedDelivery,
      testMode: testMode || false,
    });

    console.log(
      "Order object created with status:",
      order.status,
      "paymentStatus:",
      order.paymentStatus,
      "testMode:",
      order.testMode
    );
    console.log("Attempting to save order...");
    await order.save();
    console.log(
      "Order saved successfully:",
      order.orderNumber,
      "ID:",
      order._id
    );
    console.log(
      "Final order status after save:",
      order.status,
      "paymentStatus:",
      order.paymentStatus
    );

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
        console.log(`Added purchase history for product ${item.productId}`);
      } catch (error) {
        console.error("Error adding to purchase history:", error);
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
    console.error("Error creating order for PhonePe:", error);
    console.error("Error stack:", error.stack);
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
    console.log("Order validation request:", {
      orderId,
      transactionId,
      userId,
    });

    if (!orderId && !transactionId) {
      return next(createError("Order ID or Transaction ID is required", 400));
    }

    let order;

    if (orderId) {
      // Get order by ID
      console.log("Looking for order by ID:", orderId, "Type:", typeof orderId);

      // Try to find the order with more flexible query
      order = await Order.findOne({
        _id: orderId,
        userId: userId,
      });

      console.log("Raw order found:", order ? "YES" : "NO");
      if (order) {
        console.log("Order details:", {
          id: order._id,
          status: order.status,
          paymentStatus: order.paymentStatus,
          userId: order.userId,
          testMode: order.testMode,
        });

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

        console.log("Validation checks:", {
          hasValidStatus,
          hasValidPaymentStatus,
          orderStatus: order.status,
          orderPaymentStatus: order.paymentStatus,
        });

        if (!hasValidStatus || !hasValidPaymentStatus) {
          order = null; // Reset order if it doesn't meet criteria
        }
      }

      console.log(
        "Final order validation result:",
        order ? "PASSED" : "FAILED"
      );
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
      console.log("Order not found or not completed");
      return next(createError("Order not found or not completed", 404));
    }

    console.log("Order found:", {
      id: order._id,
      status: order.status,
      paymentStatus: order.paymentStatus,
      orderDate: order.orderDate,
    });

    // Check if order was completed recently (within last 30 minutes)
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    if (order.orderDate < thirtyMinutesAgo) {
      console.log("Order success page access expired");
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
    console.error("Error getting order for success page:", error);
    next(createError("Failed to get order details", 500));
  }
};
