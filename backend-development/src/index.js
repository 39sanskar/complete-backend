//require('dotenv').config({path: './env'})
import dotenv from "dotenv"
import connectDB from './db/index.js';

dotenv.config({
  path: './env'
})


// connectDB => it is uses asynchronous method. (when asynchronous method is complete technically it returns you a Promise)
connectDB()
.then(() => {
  app.on("error", ()=>{
    console.log("Express app error: , err");
    throw err;
  });

  app.listen(process.env.PORT || 8000, () => {
    console.log(`Server is running at port : ${process.env.PORT || 8000}`);
  });
})
.catch((err) => {
  console.log("MONGO db connection failed !!! ", err)
});








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