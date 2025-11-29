import { Types } from "mongoose";
import Stock from "../../../shared/models/Stock.js";
import { Order } from "../../../shared/models/Order.js";

const resolveProductTypeFromCategory = (
  category?: string | null
): "tshirt" | "hoodie" => {
  if (!category) {
    return "tshirt";
  }
  return category.toLowerCase().includes("hoodie") ? "hoodie" : "tshirt";
};

/**
 * Reduce stock quantities for a given order.
 * Ensures the adjustment happens only once per order using the stockAdjusted flag.
 */
export const reduceStockForOrder = async (
  orderId: Types.ObjectId | string
): Promise<void> => {
  try {
    // Skip if order already processed or doesn't exist
    const order = await Order.findOneAndUpdate(
      { _id: orderId, stockAdjusted: { $ne: true } },
      { $set: { stockAdjusted: true } },
      { new: false }
    );

    if (!order || order.testMode) {
      return;
    }

    const itemsWithVariants = order.items.filter(
      (item) => item.size && item.color && item.quantity > 0
    );

    if (itemsWithVariants.length === 0) {
      return;
    }

    await Promise.all(
      itemsWithVariants.map(async (item) => {
        const productType = resolveProductTypeFromCategory(item.category);
        const stock = await Stock.findOne({
          size: item.size,
          color: item.color,
          $or: [{ productType }, { productType: { $exists: false } }],
        });

        if (!stock) {
          return;
        }

        const newQuantity = Math.max(0, stock.quantity - item.quantity);
        if (newQuantity !== stock.quantity) {
          stock.quantity = newQuantity;
          await stock.save();
        }
      })
    );
  } catch (error) {
    console.error("Failed to adjust stock for order:", orderId, error);
    await Order.updateOne(
      { _id: orderId },
      { $set: { stockAdjusted: false } }
    ).catch(() => {
      /* prevent crashing if rollback fails */
    });
  }
};
