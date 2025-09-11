import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  orderNumber: {
    type: String,
    required: true,
    unique: true,
  },
  items: [
    {
      productId: {
        type: Number,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      price: {
        type: String,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        default: 1,
      },
      image: {
        type: String,
        required: true,
      },
      category: {
        type: String,
        required: true,
      },
    },
  ],
  shippingInfo: {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    pincode: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
  },
  paymentMethod: {
    type: String,
    enum: ["card", "cod", "PHONEPE"],
    required: true,
  },
  subtotal: {
    type: Number,
    required: true,
  },
  shippingCost: {
    type: Number,
    required: true,
    default: 0,
  },
  codFee: {
    type: Number,
    default: 0,
  },
  phonepeFee: {
    type: Number,
    default: 0,
  },
  total: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: [
      "pending",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
      "PENDING_PAYMENT",
      "PAID",
      "PAYMENT_FAILED",
      "CONFIRMED",
    ],
    default: "pending",
  },
  orderDate: {
    type: Date,
    default: Date.now,
  },
  estimatedDelivery: {
    type: Date,
    required: false,
  },
  trackingNumber: {
    type: String,
    default: null,
  },
  notes: {
    type: String,
    default: "",
  },
  paymentStatus: {
    type: String,
    enum: ["PENDING", "COMPLETED", "FAILED"],
    default: "PENDING",
  },
  transactionId: {
    type: String,
    default: null,
  },
  testMode: {
    type: Boolean,
    default: false,
  },
});

// Generate order number
orderSchema.pre("save", async function (next) {
  if (this.isNew) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    this.orderNumber = `ORD${year}${month}${day}${random}`;

    // Set estimated delivery to 3-5 business days
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 4); // 4 days from now
    this.estimatedDelivery = deliveryDate;
  }
  next();
});

// Index for efficient queries
orderSchema.index({ userId: 1, orderDate: -1 });
orderSchema.index({ status: 1 });

export const Order = mongoose.model("Order", orderSchema);
