"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.memoryServerConnect = exports.connect = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const mongodb_memory_server_1 = require("mongodb-memory-server");
require("dotenv").config();
const uri = "mongodb+srv://" +
    process.env.USERNAME +
    ":" +
    process.env.PASSWORD +
    "@cluster0.duwgf.mongodb.net/fund_transfer_cluster?retryWrites=true&w=majority";
const connect = async () => {
    try {
        await mongoose_1.default.connect(uri);
        console.log("database is connected successfully...");
    }
    catch (err) {
        console.log("connection error occurred. ensure you are connected to db...");
    }
};
exports.connect = connect;
//connection to mongodb memory server for integration testing
const memoryServerConnect = () => {
    try {
        mongodb_memory_server_1.MongoMemoryServer.create().then((mongodb) => {
            const uri = mongodb.getUri();
            mongoose_1.default.connect(uri).then(() => {
                console.log("Coonection to Mongodb memory server established...");
            });
        });
    }
    catch (err) {
        console.error(err);
    }
};
exports.memoryServerConnect = memoryServerConnect;
