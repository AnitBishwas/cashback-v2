import mongoose from "mongoose";

const cashbackDiscountSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enums: ["active", "draft"],
    },
    type: {
      type: String,
      enums: ["percentage", "fixed"],
      required: true,
    },
    value: {
      type: Number,
      required: true,
    },
    orderAboveApplication: {
      type: Boolean,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const CashbackDiscountModel = mongoose.model(
  "CashbackDiscounts",
  cashbackDiscountSchema
);

export default CashbackDiscountModel;
