import mongoose, { mongo } from "mongoose";

const recordSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["settings", "distribution", "discounts"],
    },
    action: {
      type: String,
      enum: ["create", "update", "delete", "disburse", "rollback"],
      required: true,
    },
    user: {
      id: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
    },
    oldChanges: {
      type: mongoose.Schema.Types.Mixed,
    },
    newChanges: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

const RecordModal = mongoose.model("Record", recordSchema);

export default RecordModal;
