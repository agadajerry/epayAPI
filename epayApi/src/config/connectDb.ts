import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
require("dotenv").config();




const uri =
  "mongodb+srv://" +
  process.env.USERNAME +
  ":" +
  process.env.PASSWORD +
  "@cluster0.duwgf.mongodb.net/fund_transfer_cluster?retryWrites=true&w=majority";

export const connect = async () => {
  try {
    await mongoose.connect(uri);
    console.log("database is connected successfully...");
  } catch (err: any) {
    console.log("connection error occurred. ensure you are connected to db...");
  } 
};



//connection to mongodb memory server for integration testing

export const memoryServerConnect = () => {
  try {

    MongoMemoryServer.create().then((mongodb) => {
      
      const uri = mongodb.getUri();
      mongoose.connect(uri).then(() => {
        
        console.log("Coonection to Mongodb memory server established...");
        
      })
    })
    
  } catch (err: any) {
    console.error(err)
  }
}

