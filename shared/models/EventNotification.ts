import mongoose from "mongoose";

const eventNotificationSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    userId: {
      type: String,
      default: "",
      trim: true,
    },
    source: {
      type: String,
      enum: ["registered", "guest"],
      default: "guest",
    },
  },
  { timestamps: true },
);

eventNotificationSchema.index({ eventId: 1, email: 1 }, { unique: true });

export const EventNotification =
  mongoose.models.EventNotification ||
  mongoose.model("EventNotification", eventNotificationSchema);

