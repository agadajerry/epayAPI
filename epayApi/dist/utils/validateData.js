"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleErrors = exports.validateUser = void 0;
const joi_1 = __importDefault(require("joi"));
//login and reg validation
const validateUser = (data) => {
    const schema = joi_1.default.object({
        firstname: joi_1.default.string().trim().min(2).max(64),
        lastname: joi_1.default.string().trim().min(2).max(64),
        email: joi_1.default.string().trim().lowercase().required(),
        dob: joi_1.default.string().trim().required(),
        phonenumber: joi_1.default.string().required(),
        password: joi_1.default.string().min(8).required(),
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
// Handling/  validating errors
const handleErrors = (err) => {
    console.log(err.message, err.code);
    let errors = {
        firstname: "",
        lastname: "",
        email: "",
        phonenumber: "",
        password: ""
    };
    // Duplicate error code
    if (err.code === 11000) {
        errors.email = "This email is already registered";
        return errors;
    }
    // validations error
    if (err.message.includes("User validation failed")) {
        Object.values(err.errors).forEach(({ properties }) => {
            errors[properties.path] = properties.message;
        });
    }
    return errors;
};
exports.handleErrors = handleErrors;
