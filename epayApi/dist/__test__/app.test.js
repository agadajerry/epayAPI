"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("../app"));
const supertest_1 = __importDefault(require("supertest"));
//sign up tetsing
describe(" Registration of new user", () => {
    it("A new user should be registered", async () => {
        const rawData = {
            firstname: "Mary",
            lastname: " Godwin",
            dob: "12/4/1994",
            email: "mary4@gmail.com",
            password: "idoko300",
            phonenumber: "08122342301"
        };
        let { firstname, lastname, dob, email, phonenumber, password } = rawData;
        const response = await (0, supertest_1.default)(app_1.default).post('/register').send(rawData);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('msg');
    });
    //sign in the user
    const userLoginData = {
        email: "mary4@gmail.com",
        password: "idoko300",
    };
    let { email, password } = userLoginData;
    test("User sign in", async () => {
        const res = await (0, supertest_1.default)(app_1.default).post("/login").send(userLoginData);
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("msg");
    });
});
/**************************************************************************|
/ *  Test for Getting balance for a particular account number              *|
 /**************************************************************************/
describe("user account balance using his account number", () => {
    it("A user can be able to get his account balance", async () => {
        const res = await (0, supertest_1.default)(app_1.default).get("/balance/:accountnumber");
        ;
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("msg");
    });
});
/**************************************************************************|
/ *  Test for Getting balance for a particular User id                    *|
 /**************************************************************************/
describe("user account balance using Id Number", () => {
    it("A user can be able to get his account balance using ID", async () => {
        const res = await (0, supertest_1.default)(app_1.default).get("/balance/userid/:userId");
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("msg");
    });
});
/**************************************************************************|
/ transaction/:accountNumber  gets all transactions of a
              particular user                                             *|
 /**************************************************************************/
describe(" Test for user transaction using account number", () => {
    it("As a user ,you can be able to get alltransction using account number", async () => {
        const res = await (0, supertest_1.default)(app_1.default).get("/transaction/:accountNumber");
        expect(res.status).toBe(200);
    });
});
/**************************************************************************|
/ test for user credit transaction
 GET.   |
      /transaction/credit/:accountNumber
 /**************************************************************************/
describe(" Test for user  credit transaction using account number", () => {
    it("As a user, you can be able to get  all credit transaction", async () => {
        const res = await (0, supertest_1.default)(app_1.default).get("/transaction/credit/:accountNumber");
        expect(res.status).toBe(200);
    });
});
/**************************************************************************|
/ test for user debit transaction
 GET.   |
      /transaction/debit/:accountNumber
 /**************************************************************************/
describe(" Test for user  debit transaction using account number", () => {
    it("A user can be able to get his his debit transaction", async () => {
        const res = await (0, supertest_1.default)(app_1.default).get("/transaction/credit/:accountNumber");
        expect(res.status).toBe(200);
    });
});
