

import mongooose from "mongoose"

import { userInterface } from "../utils/allInterfaces";


export  const registerSchema = new mongooose.Schema<userInterface>({

    firstname: {
        type: String,
        required:[true, "First Name field is required"]
    },

    lastname: {
        type: String,
        required:[true, " Last Name field is required"]
    },
    dob: {
        type: Date,
        required:[true, "Date of birth is required"]
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true
    },
    password: {
        type: String,
        minlength:[8,"password most at least 8 character long"]
    },

    phonenumber: {
        type: String,
        maxlength: [11, "Phone number is required"],
        unique: true
    },


},
 {timestamps:true},
)

const userRegistration = mongooose.model("Registereduser", registerSchema)



export default userRegistration;