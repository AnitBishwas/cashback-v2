import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    walletId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enums: ["pending", "completed", "cancelled", "expired"],
    },
    type: {
      type: String,
      enums: ["credit", "debit"],
    },
    orderId: {
      type: Number,
    },
    orderName: {
      type: String,
    },
    closingBalance: {
      type: Number,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    note: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const TransactionModel = mongoose.model("Transaction", transactionSchema);

export default TransactionModel;
