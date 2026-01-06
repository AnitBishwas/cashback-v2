import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    customerId: {
      type: Number,
      required: true,
    },
    phone: {
      type: String,
    },
    email: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const CustomerModel = mongoose.model("Customer", customerSchema);

export default CustomerModel;
