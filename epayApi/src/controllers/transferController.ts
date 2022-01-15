import { Express, Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import userRegistration from "../models/userModel";
import balances from "../models/balancesModel";
import transScheme from "../models/transactionModel";
import {
  validateUser,
  validateUserLogin,
  validateTransferInputData,
} from "../utils/userInputValidation";

import myPagination from "../utils/pagination"






/**************************************************************************************
 *   This function Create user balance and account upon suuccessful sign up
 * ************************************************************************************ */

 
  // check if db if the user is a register use before creating the account

  
    async function userAccountNumber (regUser:any, req:Request, res:Response) {
  
      /****************************************************************************
          *
          *      check if account number exist in balances collection
                 if not create one , else increment by 1 for new user
          * 
          *************************************************************************/

      const enteredAcc = await balances.findOne().sort({ createdAt: -1 }).limit(1);
      
      if (enteredAcc == null) {
        await balances.create({
          userId: regUser._id,
          accountNumber: 2628001002,
          balance: 5000,
        });
      } else {
        if (enteredAcc.userId.equals(regUser._id)) {
          
          return
          
        } else {
          await balances.create({
            userId: regUser._id,
            accountNumber: Number(enteredAcc.accountNumber + 1),
            balance: 5000,
          });
        
        }
      }
}// end of user account number creation function
    




/*****************************************************************************************
 *  User registration and login with it validation
 * ************************************************************************************ */


export const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      firstname,
      lastname,
      dob,
      email,
      password,
      password_repeat,
      phonenumber,
    } = req.body;

    //validate user input
    const { error } = validateUser(req.body);

    if (error) {
      return res
        .status(404)
        .json({ msg: "validation error Check your entry..." });
    }

    //check if user already existed in the collection

    userRegistration.findOne({ email: email }, async (err: any, user: any) => {
      if (err) {
        return res.json({ msg: "Error occured at finding user in db..." });
      }
      if (user) {
      return  res
          .status(404)
        .json({ msg: "user already register in our platform..." });
        
      } else {


        user = new userRegistration({
          firstname,
          lastname,
          dob,
          email,
          phonenumber,
          password: await bcrypt.hash(password, 10),
        });
        await user.save(); //new user register



        /*
         *  The below function call create account number a 
        * default balance amount of money for the user
         */
  

            userAccountNumber(user, req, res);

            
      return  res.status(200).json({ msg: "New User registered successfully...." });
      }

      

    });
  } catch (error) {
    console.error("error occurred in user registration...");
  }
};






/**************************************************************************************
 *  User  login with it validation
 * ************************************************************************************ */

export const userLogin = (req: Request, res: Response, next: NextFunction) => {
  const { error } = validateUserLogin(req.body);

  try {
    if (error) {
      res.status(404).json({
        msg: "validation error in login. Check your entry...",
      });
    }

    //find user now

    userRegistration.findOne(
      { email: req.body.email },
      async (err: any, user: any) => {
        if (err)
          return res
            .status(404)
            .json({ msg: "Error occurred in finding user" });

        if (!user) {
          return res.status(404).json({ msg: "No Such user exist..." });
        }

        //   res.status(200).json({ msg: "User exist in database..." });

        //Decrypt incomeing password from the body

        const decrptPassword = await bcrypt.compare(
          req.body.password,
          user.password
        );

        if (!decrptPassword) {
          return res.status(200).json({ msg: "Password/ email invalid..." });
        } else {
          const token = jwt.sign(
            { email: req.body.email },
            process.env.JWT_SECRET as string,
            {
              expiresIn: 60 * 60 * 60,
            }
          );

          res.cookie("jwt_token", token, { httpOnly: true });

          return res.status(200).json({ msg: "User Login successful..." });
        }
      }
    );
  } catch (e) {
    console.error(e);
  }
};




/**************************************************************************************
 *   This function Handle user transactions
 * ************************************************************************************ */



export const fundTransfer = async (req: Request, res: Response) => {
  // validate incoming request

  try {
    const { amount, receiverAccount, senderAccount, transferDescription } =
      req.body;

    const { error } = validateTransferInputData(req.body);
    if (error)
      return res
        .status(404)
        .json({ msg: "Error occured in input validatation...." + error });

    //  get sender details from the balance collection first

    balances.findOne(
      { accountNumber: Number(senderAccount) },
      async (err: any, user: any) => {
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
          } else {
            //send to the reciever
            await transScheme.create({
              reference: uuidv4(),
              senderAccount: user.accountNumber,
              amount,
              receiverAccount,
              transferDescription,
            });


            // find Reciever old balance and update the  account

            const recieverPrevBalance = await balances.findOne({
              accountNumber: receiverAccount,
            });

            await balances.updateOne(
              { accountNumber: receiverAccount },
              {
                $set: {
                  balance: Number(recieverPrevBalance.balance) + Number(amount)
                  
                },
                $currentDate: { lastModified: true },
              }
            );

            // Update the sender's balance by removig the amount he want to send

            await balances.updateOne(
              { accountNumber: user.accountNumber },
              {
                $set: {
                  balance: Number(user.balance) - Number(amount),
                  
                },
                $currentDate: { lastModified: true },
              }
            );
           return res.status(201).json({ msg: "Transaction completed..." });
          }
          //perform transfer as follow
        } else {
         return res
            .status(404)
            .json({ msg: "Your account number is not corrrect..." });
        }
      }
    );
  } catch (error) {}
};

/**************************************************************************************
 *   This function Handle user deposit to his account
 * ************************************************************************************ */



export const depositFund = async (req: Request, res: Response) => {
  if (req.body.depositorAccount == "" || req.body.amount == "")
      return res.status(404).json({ msg: "Empty field.." });
    
    if (Number(req.body.amount) < 0 )
      return res.status(404).json({ msg: "The amount is zero. You cant deposit 0" });

  const depositorPrevBalance = await balances.findOne({
    accountNumber: req.body.depositorAccount,
  });

  await balances.updateOne(
    { accountNumber: req.body.depositorAccount },
    {
      $set: {
        balance: Number(depositorPrevBalance.balance) + Number(req.body.amount),
      },
      $currentDate: { lastModified: true },
    } 
  );
    res.status(201).json({msg:`# ${req.body.amount} deposited succesfully...`})
};

   

/****************************************************************************
 * 
 *    GET  balance/:accountNumber         
 *  Getting balance for a particular account 
 *****************************************************************************
 * ****/
 
export const getUserBalance = (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  try {
    let userAcc = req.params.accountnumber;

    balances.findOne({ accountnumber: userAcc }, (err: any, user: any) => {
      if (err) {
        return res.json({
          msg: "error message in user account balance fetching" + err,
        });
      }

      if (user) {
        return res
          .status(200)
          .json({ msg: `Your Account balance is:  ${user.balance}` });
      } else {
        res.json({msg:"Account Number provided does not exist"})
      }
    });
  } catch (err: any) {
    console.error(err)
  }
};



/****************************************************************************
 * 
 *    balance/:userId   Getting balance for a particular user by userid
 ***************************************************************************/
 

 export const getBalanceByUserId =   (
   req: Request,
   res: Response,
   next: NextFunction
 ) => {
   try {
     const userId = req.params.userId;

     balances
       .findOne({ userId: userId }, (err: any, user: any) => {
         if (err) {
           return res.json({
             msg: "error message in user account balance fetching" + err,
           });
         }

         if (user) {
           return res
             .status(200)
             .json({ msg: `Your Account balance is:  ${user.balance}` });
         } else {
           res.json({ msg: "User Id provided does not exist" });
         }
       });
   } catch (err: any) {
     console.error(err);
   }
 };



/****************************************************************************
 * 
 *    GET    | /balance  | Getting all accounts and their 
 ***************************************************************************/
 

export const  getAllBalanceAndAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  try {


    let user = await balances.find({}).select({ accountNumber: 1, balance: 1, "_id": 0 });

      if (user) {
        return res
          .status(200)
          .json(user);
      } else {
        res.json({msg:"No user found..."})
      }
  
  } catch (err: any) {
    console.error(err)
  }
};





/****************************************************************************
 * 
 *    Transaction of a particular user
 * transaction/:accountNumber    | gets all transactions of a particular 
 ***************************************************************************/
 

export const getTransactionOfUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let userAccNo = req.params.accountnumber;

    transScheme
      .find({ userAccountNumber: userAccNo })
      .select({
        receiverAccount: 1,
        amount: 1,
        transferDescription: 1,
        reference: 1,
        createdAt: 1,
        _id: 0,
      })
      .exec((err: any, userTrans: any) => {
        if (err) {
          return res.json({
            msg: "error message in user transaction  fetching" + err,
          });
        }

        if (userTrans) {

          //pagination function is called here
          myPagination(
            req.query.page,
            req.query.perpage,
            transScheme,
            userTrans
          );
          return res.status(200).json(userTrans);


          // myPagination(
          //   req.query.page,
          //   req.query.perpage,
          //   transScheme,
          //   userTrans
          // );
        } else {
          res.json({ msg: "User account number provided does not exist" });
        }
      });
  } catch (err: any) {
    console.error(err);
  }
};


/****************************************************************************
 * 
 *    | GET. /transaction/credit/:accountNumber | 
 * gets all credit transactions of a particular user |
 ***************************************************************************/
 

export const getUserDebit = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let userAccNo = req.params.accountnumber;

    transScheme
      .find({ senderAccount: userAccNo })
      .select({
        receiverAccount: 1,
        amount: 1,
        transferDescription: 1,
        reference: 1,
        createdAt: 1,
        _id: 0, 
      })
      .exec((err: any, userTrans: any) => {
        if (err) {
          return res.json({
            msg: "error message in user transaction  fetching" + err,
          });
        }

        if (userTrans) {
          return res.status(200).json({msg:"Successful", status:"Debit", userTrans});
        } else {
          res.json({ msg: "User account number provided does not exist" });
        }
      });
  } catch (err: any) {
    console.error(err);
  }
};



/****************************************************************************
 * 
 *    | GET. /transaction/credit/:accountNumber | 
 * gets all credit transactions of a particular user |
 ***************************************************************************/
 

export const getUserCrdeit = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {

    let userAccNo = req.params.accountnumber;

    transScheme
      .find({ receiverAccount: userAccNo })
      .select({
        senderAccount: 1,
        amount: 1,
        transferDescription: 1,
        reference: 1,
        createdAt: 1,
        _id: 0,
      })
      .exec((err: any, userTrans: any) => {
        if (err) {
          return res.json({
            msg: "error message in user transaction  fetching" + err,
          });
        }

        if (userTrans) {
          return res
            .status(200)
            .json({ msg: "Successful", status: "Credit", userTrans });
        } else {
          res.json({ msg: "User account number provided does not exist" });
        }
      });
  } catch (err: any) {
    console.error(err);  
  }
};




