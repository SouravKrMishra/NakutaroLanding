import mongoose, { Schema, Document } from "mongoose";

export interface ISettings extends Document {
  key: string;
  value: any;
  description?: string;
  updatedAt: Date;
  updatedBy?: mongoose.Types.ObjectId;
}

const SettingsSchema = new Schema<ISettings>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
    },
    value: {
      type: Schema.Types.Mixed,
      required: true,
    },
    description: {
      type: String,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

export const Settings =
  mongoose.models.Settings ||
  mongoose.model<ISettings>("Settings", SettingsSchema);
