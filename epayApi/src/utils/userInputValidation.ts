import Joi from "joi";

import { userInterface, transferInt } from "./allInterfaces";

//login and reg validation

export const validateUser = (data: userInterface) => {
  const schema = Joi.object({
    firstname: Joi.string().trim().min(3).max(64),
    lastname: Joi.string().trim().min(3).max(64),
    email: Joi.string().trim().lowercase().required(),
    dob: Joi.string().trim().required(),
    phonenumber: Joi.string().length(11).required(),
    password: Joi.string().min(8).required(),
    password_repeat: Joi.ref("password"),
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

//user login validation

export const validateUserLogin = (data: userInterface) => {
  const schema = Joi.object({
    email: Joi.string().trim().lowercase().required(),
    password: Joi.string().min(8).required(),
    password_repeat: Joi.ref("password"),
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

export const validateTransferInputData = (data: transferInt) => {
  const schema = Joi.object({
    receiverAccount: Joi.number().required(),
    // senderAccount : Joi.number().required,
    amount: Joi.string().trim().required(),
    transferDescription: Joi.string(),
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
