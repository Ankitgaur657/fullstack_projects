import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiRespinse.js";

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

export { registerUser };
