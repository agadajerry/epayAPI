"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.balanceSchema = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
exports.balanceSchema = new mongoose_1.default.Schema({
    userId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Registereduser" },
    accountNumber: {
        type: Number,
        maxlength: [10, "Account Number is required"],
        unique: true,
    },
    balance: {
        type: Number,
    },
}, { timestamps: true });
const balances = mongoose_1.default.model("balances", exports.balanceSchema);
exports.default = balances;
