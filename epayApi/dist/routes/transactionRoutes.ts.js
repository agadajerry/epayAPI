"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const transferController = __importStar(require("../controllers/transferController"));
const auth_middleware_1 = require("../utils/auth_middleware");
const router = express_1.default.Router();
//  New User registration routes
router.post("/register", transferController.registerUser);
// user login route
router.post("/login", transferController.userLogin);
//fund transfer routing
router.post("/transfer", auth_middleware_1.authoriseUser, transferController.fundTransfer);
//deposit fund
router.post("/deposit", auth_middleware_1.authoriseUser, transferController.depositFund);
//get user balance by account number
router.get("/balance/:accountnumber", transferController.getUserBalance);
//get user balance by user account number
router.get("/transaction/:accountnumber", transferController.getTransactionOfUser);
//get user  debit transaction
router.get("/transaction/debit/:accountnumber", transferController.getUserDebit);
//get user  credit transaction
router.get("/transaction/credit/:accountnumber", transferController.getUserCrdeit);
//get user balance by user id
router.get("/balance/userid/:userId", transferController.getBalanceByUserId);
//get user balance by user balances
router.get("/balance", auth_middleware_1.authoriseUser, transferController.getAllBalanceAndAccount);
exports.default = router;
