import mongoose from "mongoose";

const taxSlabSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      unique: true,
      enum: [
        "T-Shirts",
        "Hoodies",
        "Sweatshirt",
        "Action Figures",
        "Wigs",
        "Accessories",
        "Posters",
        "Stickers",
        "Other",
      ],
    },
    zohoTaxId: {
      type: String,
      required: true,
      trim: true,
    },
    igstZohoTaxId: {
      type: String,
      required: true,
      trim: true,
    },
    taxName: {
      type: String,
      required: true,
      trim: true,
    },
    igstTaxName: {
      type: String,
      required: true,
      trim: true,
    },
    /** HSN code for this category (Goods). e.g. 6109 for T-shirts. Used on Zoho invoices when no product override. */
    hsnCode: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.model("TaxSlab", taxSlabSchema);
