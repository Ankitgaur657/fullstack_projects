//use try catch and async await to connect database
//require('dotenv').config({path: './env'})

import dotenv from "dotenv"
import connectDB from "./db/index.js";
import {app} from "./app.js"
dotenv.config({
    path: './env'
});

app.on("error",()=>{
    console.log("Error while connecting to database");
    throw error;
});


connectDB()
.then(()=>{
    app.listen(process.env.PORT||8000,()=>{
        console.log(`Server is running on port : ${process.env.PORT}`)
    })
})
.catch((error)=>{
    console.log("Error while connecting to database", error);
    throw error;
})





/*
import express from "express";
const app = express();
(async()=>{
    try {
     await  mongoose.connect(`${process.env.MONGO_URL}/${DB_NAME}` )
        console.log("Database connected successfully");
        app.on("error",()=>{
            console.log("Error while connecting to database");
            throw error;
        })

      app.listen(process.env.PORT,()=>{
          console.log(`Server is running on port ${process.env.PORT}`)
      })
    } catch (error) {
        console.log("Error while connecting to database", error);
        throw error;
    }
})()*///this is the same as below code