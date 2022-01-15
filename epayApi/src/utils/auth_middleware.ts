import { Request, Response, NextFunction } from "express";
const jwt = require("jsonwebtoken");

export function authoriseUser(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies.jwt_token;

      if (token) {
        
      jwt.verify(
        token,
        process.env.JWT_SECRET,
        (err: any, decodedToken: any) => {
          if (err) {
           return res.status(404).json({msg:"You are not authorised to view this page..."});
          } else {
            next();
          }
        }
      );
    } else {
        //307 -redirect status code
      res.status(404).json({msg:"No token found . You are redirect to login page"})
    }
  } catch (err) {
    res.sendStatus(401);
  }
}
