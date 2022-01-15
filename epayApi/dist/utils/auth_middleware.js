"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authoriseUser = void 0;
const jwt = require("jsonwebtoken");
function authoriseUser(req, res, next) {
    try {
        const token = req.cookies.jwt_token;
        if (token) {
            jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
                if (err) {
                    return res.status(404).json({ msg: "You are not authorised to view this page..." });
                }
                else {
                    next();
                }
            });
        }
        else {
            //307 -redirect status code
            res.status(404).json({ msg: "No token found . You are redirect to login page" });
        }
    }
    catch (err) {
        res.sendStatus(401);
    }
}
exports.authoriseUser = authoriseUser;
