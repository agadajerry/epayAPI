import mongoose from "mongoose"


const transactSchema = new mongoose.Schema(
  {
    reference: {
      type: String,
      unique: true,
    },
    senderAccount: {
      type: Number,
      ref: "balances",
    },
    amount: {
      type: String,
    },
    receiverAccount: {
      type: Number,
    },
    transferDescription: {
      type: String,
    },
  
  },
  { timestamps: true }
);

const transScheme = mongoose.model("transaction_coltn", transactSchema);

export default transScheme;



