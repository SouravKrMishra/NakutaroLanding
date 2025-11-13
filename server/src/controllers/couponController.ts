import { Request, Response, NextFunction } from "express";
import { Coupon } from "../../../shared/models/Coupon.js";
import { Product } from "../../../shared/models/Product.js";
import { createError } from "../middleware/errorHandler.js";

// Validate coupon (for frontend use)
export const validateCoupon = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { code, userId, cartItems, cartTotal } = req.body;

    if (!code) {
      return next(createError("Coupon code is required", 400));
    }

    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
    }).lean();

    if (!coupon) {
      return res.json({
        valid: false,
        message: "Invalid coupon code",
      });
    }

    // Check if active
    if (!coupon.isActive) {
      return res.json({
        valid: false,
        message: "This coupon is currently inactive",
      });
    }

    // Check date validity
    const now = new Date();
    const startDate = new Date(coupon.startDate);
    const endDate = new Date(coupon.endDate);

    if (now < startDate) {
      return res.json({
        valid: false,
        message: "This coupon is not yet valid",
      });
    }

    if (now > endDate) {
      return res.json({
        valid: false,
        message: "This coupon has expired",
      });
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.json({
        valid: false,
        message: "This coupon has reached its usage limit",
      });
    }

    // Check per-user usage limit
    if (userId) {
      const userUsageCount =
        coupon.usedBy?.filter(
          (usage: any) => usage.userId.toString() === userId
        ).length || 0;

      if (userUsageCount >= coupon.usageLimitPerUser) {
        return res.json({
          valid: false,
          message:
            "You have already used this coupon the maximum number of times",
        });
      }
    }

    // Check minimum purchase
    if (cartTotal < coupon.minimumPurchase) {
      return res.json({
        valid: false,
        message: `Minimum purchase of ₹${coupon.minimumPurchase} required`,
      });
    }

    // Check product applicability
    if (coupon.selectionType !== "all" && cartItems && cartItems.length > 0) {
      // Extract actual product IDs from variant-based IDs (format: "productId_Size:S|Color:Black")
      const productIds = cartItems.map((item: any) => {
        const productId = item.productId || item.id;
        // If it's a variant ID, extract the base product ID (part before underscore)
        if (typeof productId === "string" && productId.includes("_")) {
          return productId.split("_")[0];
        }
        return productId;
      });

      // Remove duplicates
      const uniqueProductIds = [...new Set(productIds)];

      const products = await Product.find({ _id: { $in: uniqueProductIds } });

      let applicableProducts: any[] = [];

      // Handle multiple selection types - product matches if it matches ANY criteria
      // If selectionType is "all", all products are applicable
      if (coupon.selectionType === "all") {
        applicableProducts = products;
      } else {
        // Check category selection
        if (
          coupon.selectionType === "category" ||
          (coupon.selectedCategories && coupon.selectedCategories.length > 0)
        ) {
          const categoryProducts = products.filter((p: any) =>
            coupon.selectedCategories.includes(p.category)
          );
          applicableProducts.push(...categoryProducts);
        }

        // Check tag selection
        if (
          coupon.selectionType === "tag" ||
          (coupon.selectedTags && coupon.selectedTags.length > 0)
        ) {
          const tagProducts = products.filter((p: any) =>
            p.tags?.some((tag: string) => coupon.selectedTags.includes(tag))
          );
          applicableProducts.push(...tagProducts);
        }

        // Check individual product selection
        if (
          coupon.selectionType === "individual" ||
          (coupon.selectedProducts && coupon.selectedProducts.length > 0)
        ) {
          const individualProducts = products.filter((p: any) =>
            coupon.selectedProducts.some(
              (id: any) => id.toString() === p._id.toString()
            )
          );
          applicableProducts.push(...individualProducts);
        }

        // Remove duplicates (in case a product matches multiple criteria)
        const uniqueApplicableProducts = applicableProducts.filter(
          (product, index, self) =>
            index ===
            self.findIndex((p) => p._id.toString() === product._id.toString())
        );

        applicableProducts = uniqueApplicableProducts;
      }

      if (applicableProducts.length === 0) {
        return res.json({
          valid: false,
          message: "This coupon is not applicable to any items in your cart",
        });
      }

      // Calculate applicable amount
      const applicableAmount = cartItems.reduce((sum: number, item: any) => {
        const productId = item.productId || item.id;
        // Extract base product ID if it's a variant ID
        const baseProductId =
          typeof productId === "string" && productId.includes("_")
            ? productId.split("_")[0]
            : productId;

        const product = applicableProducts.find(
          (p: any) => p._id.toString() === baseProductId.toString()
        );
        return product ? sum + item.price * item.quantity : sum;
      }, 0);

      // Calculate discount
      let discountAmount = 0;
      if (coupon.discountType === "percentage") {
        discountAmount = (applicableAmount * coupon.discountValue) / 100;
        if (coupon.maximumDiscount) {
          discountAmount = Math.min(discountAmount, coupon.maximumDiscount);
        }
      } else {
        discountAmount = Math.min(coupon.discountValue, applicableAmount);
      }

      return res.json({
        valid: true,
        coupon: {
          _id: coupon._id,
          code: coupon.code,
          description: coupon.description,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          applicableAmount,
          discountAmount: Math.round(discountAmount),
        },
        message: "Coupon applied successfully",
      });
    }

    // Calculate discount for "all" type or when no cart items provided
    let discountAmount = 0;
    if (coupon.discountType === "percentage") {
      discountAmount = (cartTotal * coupon.discountValue) / 100;
      if (coupon.maximumDiscount) {
        discountAmount = Math.min(discountAmount, coupon.maximumDiscount);
      }
    } else {
      discountAmount = Math.min(coupon.discountValue, cartTotal);
    }

    res.json({
      valid: true,
      coupon: {
        _id: coupon._id,
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        applicableAmount: cartTotal,
        discountAmount: Math.round(discountAmount),
      },
      message: "Coupon applied successfully",
    });
  } catch (error) {
    console.error("Error validating coupon:", error);
    next(createError("Failed to validate coupon", 500));
  }
};

// Apply coupon (record usage) - should be called when order is created
export const applyCoupon = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { code, userId, orderId } = req.body;

    if (!code) {
      return next(createError("Coupon code is required", 400));
    }

    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
    });

    if (!coupon) {
      return next(createError("Invalid coupon code", 404));
    }

    // Increment usage count
    coupon.usedCount += 1;

    // Record user usage
    if (userId) {
      coupon.usedBy.push({
        userId,
        usedAt: new Date(),
        orderId,
      } as any);
    }

    await coupon.save();

    res.json({
      message: "Coupon applied successfully",
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
      },
    });
  } catch (error) {
    console.error("Error applying coupon:", error);
    next(createError("Failed to apply coupon", 500));
  }
};
