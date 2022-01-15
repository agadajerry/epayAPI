"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.userLogin = exports.userRegistration = void 0;
const express_1 = __importDefault(require("express"));
const bcrypt_1 = __importDefault(require("bcrypt"));
require("dotenv").config();
const userInputValidation_1 = require("../utils/userInputValidation");
const jwt = require("jsonwebtoken");
const userModel_1 = __importDefault(require("../models/userModel"));
const router = express_1.default.Router();
//--------------- registration of new user -----------------------
const userRegistration = async (req, res) => {
    try {
        const { fullname, email, phoneNumber, address, password, repeat_password } = req.body;
        // Validating with joi
        const { error } = (0, userInputValidation_1.validateUser)(req.body);
        console.log(error);
        if (error) {
            return res.json(error);
        }
        // rLook for a user if found, prevent him from aregister again
        userModel_1.default.findOne({ email: req.body.email }, async (err, user) => {
            if (err) {
                res.status(404).json(err);
            }
            if (user) {
                res.status(201).json("user exist");
            }
            else {
                user = new userModel_1.default({
                    fullname,
                    email,
                    phoneNumber,
                    address,
                    password: await bcrypt_1.default.hash(req.body.password, 10)
                });
                await user.save();
                res.status(200).json("user registered");
            }
        });
    }
    catch (error) {
        console.error("Registration error has occured");
    }
};
exports.userRegistration = userRegistration;
//---------------------- Login  implementation  for users---------------------------
//Login routes
const userLogin = (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    if (!email || !password.length) {
        res.status(404).json("empty empty fields");
        return;
    }
    userModel_1.default.findOne({ email: req.body.email }, async (err, user) => {
        if (err) {
            return res.status(404).json(err);
        }
        if (!user) {
            return res.status(403).json("user does not exist");
        }
        //validate the password
        let validPass = await bcrypt_1.default.compare(req.body.password, user.password);
        if (!validPass) {
            return res.status(404).json({ msg: "password or email incorrect" });
        }
        else {
            //save the jwt token
            const maxAge = 1 * 24 * 60 * 60;
            const access_token = jwt.sign({ email: email }, process.env.JWT_SECRET, {
                expiresIn: maxAge,
            });
            res.cookie("jwt", access_token, { httpOnly: true });
            return res
                .status(200)
                .json({
                msg: "login successful",
                isLogin: true,
                name: user.fullname,
            });
        }
    });
};
exports.userLogin = userLogin;
async function logout(req, res) {
    res.clearCookie("jwt");
    res.json("login page after logout");
}
exports.logout = logout;
exports.default = router;
