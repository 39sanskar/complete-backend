//require('dotenv').config({path: './env'})
import dotenv from "dotenv"
import connectDB from './db/index.js';

dotenv.config({
  path: './env'
})


connectDB();









/*

import express from "express"
const app = express()

// An IIFE (Immediately Invoked Function Expression) is a JavaScript function that runs as soon as it is defined.

// IIFE to connect DB and start server (professional way)
( async () => {
   try {
      await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)

      app.on("error", () => {
        console.log("ERROR: ", error);
        throw error;
      });

      app.listen(process.env.PORT, () => {
        console.log(`App is listining on port $ {process.env.PORT}`);
      })
   } catch (error) {
    console.log("ERROR: ", error)
    throw error; // fixed variable name
   }
})();

*/