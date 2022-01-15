import express, { Request, Response, NextFunction, response } from "express";
import * as transferController from "../controllers/transferController";

import { authoriseUser } from "../utils/auth_middleware";

const router = express.Router();



router.get("/", (req: Request, res: Response) => {
  res.json({
    msg: " to access registration route is, /register, login is /login",msg2:"The transfer route is protected.."
  });
})



//  New User registration routes

router.post("/register", transferController.registerUser);

// user login route
router.post("/login", transferController.userLogin);

//fund transfer routing

router.post("/transfer", authoriseUser, transferController.fundTransfer);

//deposit fund

router.post("/deposit", authoriseUser, transferController.depositFund);

//get user balance by account number
router.get("/balance/:accountnumber", transferController.getUserBalance);

//get user balance by user account number
router.get(
  "/transaction/:accountnumber",
  transferController.getTransactionOfUser
);

//get user  debit transaction
router.get(
  "/transaction/debit/:accountnumber",
  transferController.getUserDebit
);

//get user  credit transaction
router.get(
  "/transaction/credit/:accountnumber",
  transferController.getUserCrdeit
);

//get user balance by user id
router.get("/balance/userid/:userId", transferController.getBalanceByUserId);

//get user balance by user balances
router.get(
  "/balance",
  authoriseUser,
  transferController.getAllBalanceAndAccount
);

export default router;
