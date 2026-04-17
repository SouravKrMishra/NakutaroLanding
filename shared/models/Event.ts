import mongoose from "mongoose";

const galleryImageSchema = new mongoose.Schema(
  {
    src: { type: String, required: true },
    alt: { type: String, default: "" },
  },
  { _id: false },
);

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ["organized", "sponsored", "upcoming"],
      required: true,
    },
    eventDate: { type: Date, required: true },
    eventEndDate: { type: Date },
    time: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    image: { type: String, default: "" },
    featuredImage: { type: String, default: "" },
    featured: { type: Boolean, default: false },
    tags: [{ type: String, trim: true }],
    prizePool: { type: String, default: "", trim: true },
    attendees: { type: String, default: "", trim: true },
    galleryImages: [galleryImageSchema],
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

eventSchema.index({ eventDate: 1 });
eventSchema.index({ isActive: 1, eventDate: 1 });

export const Event =
  mongoose.models.Event || mongoose.model("Event", eventSchema);
