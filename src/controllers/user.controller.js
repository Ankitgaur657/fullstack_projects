import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiRespinse.js";
import jwt from "jsonwebtoken"

const generateAccessAndRefreshTokens= async(userId)=>{
  try {
    const user= await User.findById(userId);
    const accesstoken=user.generateAccessToken();
    const refreshToken=user.generateRefreshToken();
    user.refreshToken=refreshToken
    await user.save({validateBeforeSave:false});

    return {accesstoken,refreshToken};

  } catch (error) {
    throw new ApiError(500,"something went wrong while generating tokens");
  }
}



const registerUser = asyncHandler(async (req, res) => {
  //steps for user registration-->
  //get user details from frontend
  //get validation
  //check if user already exist
  //check for images, avatar
  //upload them to cloudinary,avatar
  //craete user object-->create entry in db
  //remove password and refresh token feild from response
  //check for user creation
  //return res
  const { fullname, email, password, username } = req.body;
  console.log("email: ", email);
  //empty validation-->
  if (fullname == "") {
    throw new ApiError(400, " fullname is required");
  }
  if (email == "") {
    throw new ApiError(400, " email is required");
  }
  if (password == "") {
    throw new ApiError(400, " password is required");
  }
  if (username == "") {
    throw new ApiError(400, " username is required");
  }
  //email validation-->
  if (email.indexOf("@") == -1) {
    throw new ApiError(400, " enter valid email");
  }

  //already existing validation-->
  const existedUser = await User.findOne({
    //queries in mongodb
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "username or email already exist");
  }

 //console.log(req.files);
  const avatarLocalPath = req.files?.avatar[0]?.path;
 // const coverImageLocalPath = req.files?.coverImage[0]?.path;
 let coverImageLocalPath;
  if(req.files&&Array.isArray(req.files.coverImage)&&req.files.coverImage.length>0){
    coverImageLocalPath=req.files.coverImage[0].path;
  }
  if(!avatarLocalPath){
   throw new ApiError(400,"Avatar file is required");
  }
  //uploading on cloudinary-->

 const avatar= await uploadOnCloudinary(avatarLocalPath);
 const coverImage=await uploadOnCloudinary(coverImageLocalPath);

 

 if(!avatar){
   throw new ApiError(400, "avatar is required");

 };

  const user= await User.create({
   fullname,
   avatar:avatar.url,
   coverImage:coverImage?.url||"",
   email,
   password,
   username:username.toLowerCase()
 });
  //verifying user created or not-->
  const createdUser = await User.findById(user._id).select("-password -refreshToken");

 if(!createdUser){
   throw new ApiError(500,"something went wrong while registering");
 }
  
 return res.status(201).json(
   new ApiResponse(200,createdUser,"User registered successfully")
 )

});


const loginUser=asyncHandler(async(req,res)=>{

  //take input from front end-->
  //username or email base
  //find user in db
  //password check
  //access and refresh token
  //send cookies 
  //response for success login
  const {email,username,password}=req.body;
    // console.log(req.body);
     
  if(!(username||email)){
    throw new ApiError(400,"username or password is required")
  };
   
  const user = await User.findOne({
    $or: [{ email }, { username }]
  });
  
  //console.log(user)
  if(!user){
    throw new ApiError(404,"User does not exist");
  };
  //password checking-->

  const isPasswordValid=await user.isPasswordCorrect(password);

  if(!isPasswordValid){
    throw new ApiError(401,"Invalid user credentials");
  };
   
  const{accesstoken,refreshToken}= await  generateAccessAndRefreshTokens(user._id);

   const loggedInUser=await  User.findById(user._id).
   select(" -password -refreshToken");

   const options={
    httpOnly:true,
    secure:true
   }
   //console.log(res)
   return res
   .status(200)
   .cookie("accessToken",accesstoken,options)
   .cookie("refreshToken",refreshToken,options)
   .json(
    new ApiResponse(
      200,
      {
        user:loggedInUser,accesstoken,
        refreshToken,
      },
      "User logged in successfully"
    )
  )

})


const logoutUser=asyncHandler(async (req,res)=>{
      //cannont access user here to logout so I injected user
      //by self constructed middleware in req 
     // console.log(req.user);
    await  User.findByIdAndUpdate(
      req.user._id,
      {
        $set:{
          refreshToken:undefined
        }
      },
      {
        new: true
      }
     )

     const options={
      httpOnly:true,
      secure:true
     }
     
     return res
     .status(200)
     .clearCookie("accessToken",options)
     .clearCookie("refreshToken",options)
     .json(
      new ApiResponse(200,{},"User logged out successfully")
     )
})

const refreshAccessToken =asyncHandler(async(req,res)=>{
       const incomingRefreshToken= req.cookies.refreshToken||req.body.refreshToken;

       if(!incomingRefreshToken){
        throw new ApiError(400,"unaothorised request")
       }
     
     try {
      const decodedToken=  jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET);
      const user= User.findById(decodedToken?._id);
 
      if(!user){
       throw new ApiError(400,"Invalid refresh token")
      }
      if(incomingRefreshToken!==user?.refreshToken){
       throw new ApiError(401,"invalid token or expired")
      }
 
      const options={
       httpOnly:true,
       secure:true
      }
 
     const {accesstoken,newRefreshToken}=await  generateAccessAndRefreshTokens(user._id);
       return res
       .status(200) 
       .cookie("accessToken",accesstoken,options)
       .cookie("refreshToken",newRefreshToken,options)
       .json(
         new ApiResponse(
           200,
           {accesstoken,refreshToken:newRefreshToken},
           "access token refreshed successfully"
         )
       )
     } catch (error) {
        new ApiError(401,error?.message||"error in refreshing")
     }
})


const changeCurrentPassword=asyncHandler(async (req,res)=>{
   const {oldPassword,newPassword}=req.body
   
  const user= await User.findById(req.user?._id);
   const isPasswordCorrect= await user.isPasswordCorrect(oldPassword);

   if(!isPasswordCorrect){
    throw new ApiError(400,"invalid old password");
   }

   user.password=newPassword;

   await user.save({validateBeforeSave:false});

    return res.status(200)
    .json(
      new ApiResponse(200,{},"password changed successfully")
    )
})


const getCurrentUser=asyncHandler(async (req,res)=>{
      return res.status(200)
      .json(200,req.user,"user fetched successfully")
})

const updateAccountDetails=asyncHandler(async (req,res)=>{
  const {fullname,email}=req.body;
  if(!fullname||!email){
    throw new ApiError(400,"All fields are required")
  }
 const user= User.findByIdAndUpdate(req.user?._id,
    {
      $set:{
        fullname,//fullname:fullname
        email:email
      }
    },
    {new:true}
  ).select("-password ")

  return res.status(200)
  .json(
    new ApiResponse(200,"Account updated successfully")
  )

})

const updateUserAvatar=asyncHandler(async (req,res)=>{
  const avatarLocalPath=req.file?.path;
     if(!avatarLocalPath){
      throw new ApiError(400,"Avatar missing")
     }

     const avatar=await uploadOnCloudinary(avatarLocalPath)

     if(!avatar.url){
      throw new ApiError(400,"error while uploading files on avatar")
     }

    const user= await User.findByIdAndUpdate(
      req.user?._id,
      {
        $set:{
          avatar:avatar.url
        }
      },
      {new :true}
     ).select("-password")

     return res.status(200)
     .json(
      new ApiResponse(200,"avatart image updated successfully")
     )
})

const updateUserCoverImage=asyncHandler(async (req,res)=>{
  const coverImageLocalPath=req.file?.path;
     if(!coverImageLocalPath){
      throw new ApiError(400,"coverImage is  missing")
     }

     const coverImage=await uploadOnCloudinary(coverImageLocalPath)

     if(!coverImageLocalPath.url){
      throw new ApiError(400,"error while uploading files on coverImage")
     }

     const user=await User.findByIdAndUpdate(
      req.user?._id,
      {
        $set:{
          coverImage:coverImage.url
        }
      },
      {new :true}
     ).select("-password")

     return res.status(200)
     .json(
      new ApiResponse(200,"coverImage updated successfully")
     )
})



export { registerUser,
        loginUser,
        logoutUser,
        refreshAccessToken,
        changeCurrentPassword,
        getCurrentUser,
        updateAccountDetails,
        updateUserAvatar,
        updateUserCoverImage
 };
