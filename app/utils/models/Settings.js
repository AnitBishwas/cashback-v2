import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema({
  shop: {
    type: String,
    required: true,
  },
  usage: {
    type: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },
    value: {
      type: Number,
      required: true,
    },
  },
  order_allocation: {
    type: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },
    value: {
      type: Number,
      required: true,
    },
  },
  max_cashback: {
    value: {
      type: Number,
    },
  },
  expiry_period: {
    value: {
      type: Number,
      required: true,
    },
  },
  extension: {
    enable: {
      type: Boolean,
    },
    period: {
      type: Number,
    },
  },
});

const SettingsModal = mongoose.model("Settings", settingsSchema);

export default SettingsModal;
