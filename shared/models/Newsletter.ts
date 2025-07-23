import mongoose from "mongoose";

const newsletterSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  subscribedAt: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  // Optional fields for future enhancements
  source: {
    type: String,
    default: "footer", // footer, popup, landing-page, etc.
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
});

// Create a compound index for better performance
newsletterSchema.index({ email: 1, isActive: 1 });

// Add a method to check if email exists
newsletterSchema.statics.findByEmail = function (email: string) {
  return this.findOne({ email: email.toLowerCase(), isActive: true });
};

// Add a method to get active subscriber count
newsletterSchema.statics.getActiveCount = function () {
  return this.countDocuments({ isActive: true });
};

export const Newsletter = mongoose.model("Newsletter", newsletterSchema);
