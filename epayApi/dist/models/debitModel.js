"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const transactSchema = new mongoose_1.default.Schema({
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
    status: {
        type: String,
    }
}, { timestamps: true });
const debitScheme = mongoose_1.default.model("debit", transactSchema);
exports.default = debitScheme;
