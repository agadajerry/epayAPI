"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserCrdeit = exports.getUserDebit = exports.getTransactionOfUser = exports.getAllBalanceAndAccount = exports.getBalanceByUserId = exports.getUserBalance = exports.depositFund = exports.fundTransfer = exports.userLogin = exports.registerUser = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const uuid_1 = require("uuid");
const userModel_1 = __importDefault(require("../models/userModel"));
const balancesModel_1 = __importDefault(require("../models/balancesModel"));
const transactionModel_1 = __importDefault(require("../models/transactionModel"));
const userInputValidation_1 = require("../utils/userInputValidation");
const pagination_1 = __importDefault(require("../utils/pagination"));
/**************************************************************************************
 *   This function Create user balance and account upon suuccessful sign up
 * ************************************************************************************ */
// check if db if the user is a register use before creating the account
async function userAccountNumber(regUser, req, res) {
    /****************************************************************************
        *
        *      check if account number exist in balances collection
               if not create one , else increment by 1 for new user
        *
        *************************************************************************/
    const enteredAcc = await balancesModel_1.default.findOne().sort({ createdAt: -1 }).limit(1);
    if (enteredAcc == null) {
        await balancesModel_1.default.create({
            userId: regUser._id,
            accountNumber: 2628001002,
            balance: 5000,
        });
    }
    else {
        if (enteredAcc.userId.equals(regUser._id)) {
            return;
        }
        else {
            await balancesModel_1.default.create({
                userId: regUser._id,
                accountNumber: Number(enteredAcc.accountNumber + 1),
                balance: 5000,
            });
        }
    }
} // end of user account number creation function
/*****************************************************************************************
 *  User registration and login with it validation
 * ************************************************************************************ */
const registerUser = async (req, res, next) => {
    try {
        const { firstname, lastname, dob, email, password, password_repeat, phonenumber, } = req.body;
        //validate user input
        const { error } = (0, userInputValidation_1.validateUser)(req.body);
        if (error) {
            return res
                .status(404)
                .json({ msg: "validation error Check your entry..." });
        }
        //check if user already existed in the collection
        userModel_1.default.findOne({ email: email }, async (err, user) => {
            if (err) {
                return res.json({ msg: "Error occured at finding user in db..." });
            }
            if (user) {
                return res
                    .status(404)
                    .json({ msg: "user already register in our platform..." });
            }
            else {
                user = new userModel_1.default({
                    firstname,
                    lastname,
                    dob,
                    email,
                    phonenumber,
                    password: await bcrypt_1.default.hash(password, 10),
                });
                await user.save(); //new user register
                /*
                 *  The below function call create account number a
                * default balance amount of money for the user
                 */
                userAccountNumber(user, req, res);
                return res.status(200).json({ msg: "New User registered successfully...." });
            }
        });
    }
    catch (error) {
        console.error("error occurred in user registration...");
    }
};
exports.registerUser = registerUser;
/**************************************************************************************
 *  User  login with it validation
 * ************************************************************************************ */
const userLogin = (req, res, next) => {
    const { error } = (0, userInputValidation_1.validateUserLogin)(req.body);
    try {
        if (error) {
            res.status(404).json({
                msg: "validation error in login. Check your entry...",
            });
        }
        //find user now
        userModel_1.default.findOne({ email: req.body.email }, async (err, user) => {
            if (err)
                return res
                    .status(404)
                    .json({ msg: "Error occurred in finding user" });
            if (!user) {
                return res.status(404).json({ msg: "No Such user exist..." });
            }
            //   res.status(200).json({ msg: "User exist in database..." });
            //Decrypt incomeing password from the body
            const decrptPassword = await bcrypt_1.default.compare(req.body.password, user.password);
            if (!decrptPassword) {
                return res.status(200).json({ msg: "Password/ email invalid..." });
            }
            else {
                const token = jsonwebtoken_1.default.sign({ email: req.body.email }, process.env.JWT_SECRET, {
                    expiresIn: 60 * 60 * 60,
                });
                res.cookie("jwt_token", token, { httpOnly: true });
                return res.status(200).json({ msg: "User Login successful..." });
            }
        });
    }
    catch (e) {
        console.error(e);
    }
};
exports.userLogin = userLogin;
/**************************************************************************************
 *   This function Handle user transactions
 * ************************************************************************************ */
const fundTransfer = async (req, res) => {
    // validate incoming request
    try {
        const { amount, receiverAccount, senderAccount, transferDescription } = req.body;
        const { error } = (0, userInputValidation_1.validateTransferInputData)(req.body);
        if (error)
            return res
                .status(404)
                .json({ msg: "Error occured in input validatation...." + error });
        //  get sender details from the balance collection first
        balancesModel_1.default.findOne({ accountNumber: Number(senderAccount) }, async (err, user) => {
            if (err)
                return res
                    .status(404)
                    .json({ msg: "error from finding sender account number..." });
            if (user) {
                //check if the reciever account equal sender account
                if (user.accountNumber == req.body.receiverAccount)
                    return res.json({ msg: "Provide reciever account" });
                if (Number(user.balance) < Number(amount)) {
                    return res.status(404).json({
                        msg: "The amount specified is greater than what you have in your account",
                    });
                }
                else {
                    //send to the reciever
                    await transactionModel_1.default.create({
                        reference: (0, uuid_1.v4)(),
                        senderAccount: user.accountNumber,
                        amount,
                        receiverAccount,
                        transferDescription,
                    });
                    // find Reciever old balance and update the  account
                    const recieverPrevBalance = await balancesModel_1.default.findOne({
                        accountNumber: receiverAccount,
                    });
                    await balancesModel_1.default.updateOne({ accountNumber: receiverAccount }, {
                        $set: {
                            balance: Number(recieverPrevBalance.balance) + Number(amount)
                        },
                        $currentDate: { lastModified: true },
                    });
                    // Update the sender's balance by removig the amount he want to send
                    await balancesModel_1.default.updateOne({ accountNumber: user.accountNumber }, {
                        $set: {
                            balance: Number(user.balance) - Number(amount),
                        },
                        $currentDate: { lastModified: true },
                    });
                    return res.status(201).json({ msg: "Transaction completed..." });
                }
                //perform transfer as follow
            }
            else {
                return res
                    .status(404)
                    .json({ msg: "Your account number is not corrrect..." });
            }
        });
    }
    catch (error) { }
};
exports.fundTransfer = fundTransfer;
/**************************************************************************************
 *   This function Handle user deposit to his account
 * ************************************************************************************ */
const depositFund = async (req, res) => {
    if (req.body.depositorAccount == "" || req.body.amount == "")
        return res.status(404).json({ msg: "Empty field.." });
    if (Number(req.body.amount) < 0)
        return res.status(404).json({ msg: "The amount is zero. You cant deposit 0" });
    const depositorPrevBalance = await balancesModel_1.default.findOne({
        accountNumber: req.body.depositorAccount,
    });
    await balancesModel_1.default.updateOne({ accountNumber: req.body.depositorAccount }, {
        $set: {
            balance: Number(depositorPrevBalance.balance) + Number(req.body.amount),
        },
        $currentDate: { lastModified: true },
    });
    res.status(201).json({ msg: `# ${req.body.amount} deposited succesfully...` });
};
exports.depositFund = depositFund;
/****************************************************************************
 *
 *    GET  balance/:accountNumber
 *  Getting balance for a particular account
 *****************************************************************************
 * ****/
const getUserBalance = (req, res, next) => {
    try {
        let userAcc = req.params.accountnumber;
        balancesModel_1.default.findOne({ accountnumber: userAcc }, (err, user) => {
            if (err) {
                return res.json({
                    msg: "error message in user account balance fetching" + err,
                });
            }
            if (user) {
                return res
                    .status(200)
                    .json({ msg: `Your Account balance is:  ${user.balance}` });
            }
            else {
                res.json({ msg: "Account Number provided does not exist" });
            }
        });
    }
    catch (err) {
        console.error(err);
    }
};
exports.getUserBalance = getUserBalance;
/****************************************************************************
 *
 *    balance/:userId   Getting balance for a particular user by userid
 ***************************************************************************/
const getBalanceByUserId = (req, res, next) => {
    try {
        const userId = req.params.userId;
        balancesModel_1.default
            .findOne({ userId: userId }, (err, user) => {
            if (err) {
                return res.json({
                    msg: "error message in user account balance fetching" + err,
                });
            }
            if (user) {
                return res
                    .status(200)
                    .json({ msg: `Your Account balance is:  ${user.balance}` });
            }
            else {
                res.json({ msg: "User Id provided does not exist" });
            }
        });
    }
    catch (err) {
        console.error(err);
    }
};
exports.getBalanceByUserId = getBalanceByUserId;
/****************************************************************************
 *
 *    GET    | /balance  | Getting all accounts and their
 ***************************************************************************/
const getAllBalanceAndAccount = async (req, res, next) => {
    try {
        let user = await balancesModel_1.default.find({}).select({ accountNumber: 1, balance: 1, "_id": 0 });
        if (user) {
            return res
                .status(200)
                .json(user);
        }
        else {
            res.json({ msg: "No user found..." });
        }
    }
    catch (err) {
        console.error(err);
    }
};
exports.getAllBalanceAndAccount = getAllBalanceAndAccount;
/****************************************************************************
 *
 *    Transaction of a particular user
 * transaction/:accountNumber    | gets all transactions of a particular
 ***************************************************************************/
const getTransactionOfUser = (req, res, next) => {
    try {
        let userAccNo = req.params.accountnumber;
        transactionModel_1.default
            .find({ userAccountNumber: userAccNo })
            .select({
            receiverAccount: 1,
            amount: 1,
            transferDescription: 1,
            reference: 1,
            createdAt: 1,
            _id: 0,
        })
            .exec((err, userTrans) => {
            if (err) {
                return res.json({
                    msg: "error message in user transaction  fetching" + err,
                });
            }
            if (userTrans) {
                //pagination function is called here
                (0, pagination_1.default)(req.query.page, req.query.perpage, transactionModel_1.default, userTrans);
                return res.status(200).json(userTrans);
                // myPagination(
                //   req.query.page,
                //   req.query.perpage,
                //   transScheme,
                //   userTrans
                // );
            }
            else {
                res.json({ msg: "User account number provided does not exist" });
            }
        });
    }
    catch (err) {
        console.error(err);
    }
};
exports.getTransactionOfUser = getTransactionOfUser;
/****************************************************************************
 *
 *    | GET. /transaction/credit/:accountNumber |
 * gets all credit transactions of a particular user |
 ***************************************************************************/
const getUserDebit = (req, res, next) => {
    try {
        let userAccNo = req.params.accountnumber;
        transactionModel_1.default
            .find({ senderAccount: userAccNo })
            .select({
            receiverAccount: 1,
            amount: 1,
            transferDescription: 1,
            reference: 1,
            createdAt: 1,
            _id: 0,
        })
            .exec((err, userTrans) => {
            if (err) {
                return res.json({
                    msg: "error message in user transaction  fetching" + err,
                });
            }
            if (userTrans) {
                return res.status(200).json({ msg: "Successful", status: "Debit", userTrans });
            }
            else {
                res.json({ msg: "User account number provided does not exist" });
            }
        });
    }
    catch (err) {
        console.error(err);
    }
};
exports.getUserDebit = getUserDebit;
/****************************************************************************
 *
 *    | GET. /transaction/credit/:accountNumber |
 * gets all credit transactions of a particular user |
 ***************************************************************************/
const getUserCrdeit = (req, res, next) => {
    try {
        let userAccNo = req.params.accountnumber;
        transactionModel_1.default
            .find({ receiverAccount: userAccNo })
            .select({
            senderAccount: 1,
            amount: 1,
            transferDescription: 1,
            reference: 1,
            createdAt: 1,
            _id: 0,
        })
            .exec((err, userTrans) => {
            if (err) {
                return res.json({
                    msg: "error message in user transaction  fetching" + err,
                });
            }
            if (userTrans) {
                return res
                    .status(200)
                    .json({ msg: "Successful", status: "Credit", userTrans });
            }
            else {
                res.json({ msg: "User account number provided does not exist" });
            }
        });
    }
    catch (err) {
        console.error(err);
    }
};
exports.getUserCrdeit = getUserCrdeit;
