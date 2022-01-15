"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateTransferInputData = exports.validateUserLogin = exports.validateUser = void 0;
const joi_1 = __importDefault(require("joi"));
//login and reg validation
const validateUser = (data) => {
    const schema = joi_1.default.object({
        firstname: joi_1.default.string().trim().min(3).max(64),
        lastname: joi_1.default.string().trim().min(3).max(64),
        email: joi_1.default.string().trim().lowercase().required(),
        dob: joi_1.default.string().trim().required(),
        phonenumber: joi_1.default.string().length(11).required(),
        password: joi_1.default.string().min(8).required(),
        password_repeat: joi_1.default.ref("password"),
    }).unknown();
    const options = {
        errors: {
            wrap: {
                label: "",
            },
        },
    };
    return schema.validate(data, options);
};
exports.validateUser = validateUser;
//user login validation
const validateUserLogin = (data) => {
    const schema = joi_1.default.object({
        email: joi_1.default.string().trim().lowercase().required(),
        password: joi_1.default.string().min(8).required(),
        password_repeat: joi_1.default.ref("password"),
    }).unknown();
    const options = {
        errors: {
            wrap: {
                label: "",
            },
        },
    };
    return schema.validate(data, options);
};
exports.validateUserLogin = validateUserLogin;
const validateTransferInputData = (data) => {
    const schema = joi_1.default.object({
        receiverAccount: joi_1.default.number().required(),
        // senderAccount : Joi.number().required,
        amount: joi_1.default.string().trim().required(),
        transferDescription: joi_1.default.string(),
    }).unknown();
    const options = {
        errors: {
            wrap: {
                label: "",
            },
        },
    };
    return schema.validate(data, options);
};
exports.validateTransferInputData = validateTransferInputData;
