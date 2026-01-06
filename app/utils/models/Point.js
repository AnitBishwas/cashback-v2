import mongoose from "mongoose";

const pointSchema = new mongoose.Schema(
  {
    customerId: {
      type: Number,
      required: true,
    },
    orders: [
      {
        id: {
          type: Number,
          required: true,
        },
        type: {
          type: String,
          enums: ["credit", "debit"],
          required: true,
        },
        amount: {
          type: Number,
          required: true,
        },
      },
    ],
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enums: ["pending", "ready", "expired", "cancelled"],
    },
    walletId: {
      type: String,
      required: true,
    },
    expiresOn: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const PointModel = mongoose.model("Point", pointSchema);

export default PointModel;
