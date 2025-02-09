import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';




const app = express();

app.use(cors({
      origin: process.env.CORS_ORIGIN,
        credentials: true
}));
//major configuration-->
app.use(express.json({
    limit: "30mb"
}));

app.use(express.urlencoded({
    extended: true,
    limit: "30mb"
}));
app.use(express.static("public"));
app.use(cookieParser());


//routing-->
import userRouter from "./routes/user.routes.js"





//routes declaration-->
app.use("/api/v1/users",userRouter);










export {app};