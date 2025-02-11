import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export  const verifyJWT=asyncHandler(async(req,_,next)=>{


  try {
    const token=  req.cookies?.accessToken ||req.heade("Authorization")?.replace("Bearer","");
  
    if(!token){
      throw new ApiError(401,"unauthorised request");
    }
  
    const decodedToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
  
   const user= await User.findById(decodedToken?._id).select(" -password -refreshToken");
     if(!user){
  
      throw new ApiError(401,"Invalid Access token");
  
     }
  
     req.user=user;//injecting in req;
     next();
  } catch (error) {
    throw new ApiError(401,error?.message||"invalid access token");
  }
}
   
)