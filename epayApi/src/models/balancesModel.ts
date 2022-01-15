import { NextFunction } from "express";
import mongoose from "mongoose";

export const balanceSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "Registereduser" },

    accountNumber: {
      type: Number,
      maxlength: [10, "Account Number is required"],
      unique: true,
    },

    balance: {
      type: Number,
    },
  },
  { timestamps: true }
);

const balances = mongoose.model("balances", balanceSchema);

export default balances;
