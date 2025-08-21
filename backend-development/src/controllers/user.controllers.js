import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary , deleteFromCloudinary } from "../utils/cloudinary.js"; // Assuming delete utility exists
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

// --- Helper: Generate access and refresh tokens ---
const generateAccessAndRefreshTokens = async(userId) =>  {
  // here no need to use asyncHandler bec. we are not handle web request.
  try {
      const user = await User.findById(userId)
      const accessToken = user.generateAccessToken()
      const refreshToken = user.generateRefreshToken()

      // refreshToken put inside database (save in the user.)
      user.refreshToken = refreshToken;
      await user.save({validateBeforeSave: false});

      return {accessToken, refreshToken};


  } catch(error){
      throw new ApiError(500, "Something went wrong while generating refresh and access token")
  }

}

// --- Register a new user ---
const registerUser = asyncHandler( async (req, res) => {
  // get user details from frontend
  // validation - not empty(specially in backend)
  // check if user already exists: username, email
  // check for images, check for avatar 
  // upload them to cloudinary, check for avatar is proper upload or not 
  // create user object: when i am sending a data in mongodb (this is nosql database ) montly objects are refer to create. - create entry in db
  // remove password and refresh token field from response
  // check for user creation. if user is proper create then send response , if user is not create then send error
  
  const { fullName, email, username, password } = req.body
  //console.log("email", email);
  
  /*
  if (fullname === ""){
    throw new ApiError(400, "fullname is required")
  }
  */

  // Interesting Method

  if (
    [fullName, email, username, password].some((field) => field?.trim() === "") // if anyone field return true that means field is empty.
  ) {
    throw new ApiError(400, "All fields are required")
  }
  
  // check if user exists
  // when talking to databse use await
  const existedUser = await User.findOne({
    $or: [{ username }, { email }]
  });
  
  
  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists")
  }

  //console.log(req.files);


  // get file path from multer
  const avatarLocalPath = req.files?.avatar[0]?.path; // avatarLocalPath bec. of that it is present in the server not is in the cloudinary.

  //const coverImageLocalPath = req.files?.coverImage[0]?.path;


  let coverImageLocalPath;
  // handel undefined error
  if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
    coverImageLocalPath = req.files.coverImage[0].path
  }


  if (!avatarLocalPath){
    throw new ApiError(400, "Avatar file is required")
  }
  
  // upload to Cloudinary
  // using await because it take some time to upload
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = coverImageLocalPath ? await uploadOnCloudinary(coverImageLocalPath) : null;
  

  // check for avatar bec. avatar is required
  if (!avatar?.url){
    throw new ApiError(400, "Avatar file is required")
  }

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",  // coverImage is not required.
    email,
    password,
    username: username.toLowerCase(),
  })
  
  // basically mongodb in each entry add  _.id field
  // remove sensitive data from response
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken" // using - sign for not select a particular entity (by default it select all entity)
  )
  
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user")
  }

  return res.status(201).json(
    new ApiResponse(200, createdUser, "User registered Successfully")
  )
  
});

// ---- Login user ---
const loginUser = asyncHandler(async (req, res) => {
  // req.body -> data
  // username or email 
  // find the user
  // password check
  // access and refresh token (generate and send to user)
  // send cookie 

  const {email, username, password} = req.body
  if (!username && !email) {
    throw new ApiError(400, "username or email is required")
  }

  // Here is an alternative of above code based on logic discussed in video:
  // if (!(username || email)) {
  //     throw new ApiError(400, "username or email is required")
        
  // }

  const user = await User.findOne({
    // find on the bases of the username or email.
    $or: [{username}, {email}]
  });
  
  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  // User => it is the object in the mongoose
  // user => it is the instance of the database 
  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(404, "Invalid user credientials")
  };

  const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id);

  // Optional (database query.)
  const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

  // send cookie

  const options = {
    httpOnly: true, // only modify from the server.
    secure: true
  }


  return res
  .status(200)
  .cookie("accessToken", accessToken, options)
  .cookie("refreshToken", refreshToken, options)
  .json(
    new ApiResponse(
      200,
      { 
        // here we handle a case when user want save the access and refresh Token.
        user: loggedInUser, accessToken,
        refreshToken
      },
      "User logged In Successfully"
    )
  )

});

// ---- Logout user ---
const logoutUser = asyncHandler(async (req, res)=> {
  // how to logoutUser 
  // first find the user
  // clear cookies
  // reset refreshToken 

  await User.findByIdAndUpdate(
    req.user._id,
    {
      // refresh token delete from database.

      // $set: mongodb operator it provide you object and what you want to update.
      $unset: {
        refreshToken: 1 // this removes the field from document
      }
    },
    {
      new: true
    }
  )
 
  // cookieOptions
  const options = {
    httpOnly: true,
    secure: true
  }

  return res
  .status(200)
  .clearCookie("accessToken", options)
  .clearCookie("refreshToken", options)
  .json(new ApiResponse(200, {}, "User logged Out"))
});

// ---- Refresh access token ---
const refreshAccessToken = asyncHandler(async (req, res)=> {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

  // incomingRefreshtoken => this is full token
  if(!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request - no refresh token provided");
  };

  try {
    // 1. Verify token signature
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
  
    // 2. Find user
    const user = await User.findById(decodedToken?._id)
    if (!user) {
      throw new ApiError(401, "Invalid refresh token - user not found");
    }
  
    // match incomingRefreshToken to refreshToken
    // 3. Compare token in DB
    if (incomingRefreshToken !== user?.refreshToken){
      // optionally unwrap refresh token.
      throw new ApiError(401, "Refresh token is expired or already used");
    }
  
    // here no need to hold reference
    // 4. Generate new tokens
    const {accessToken, newRefreshToken} = await generateAccessAndRefreshTokens(user._id)

    // for send in the cookies so use options
    // 5. Cookie options
    const options = {
      httpOnly: true,
      secure: true, // set to true in production (https)
      sameSite: "strict", // prevent CSRF attack
    }
  
    // 6. Send cookies + response
    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", newRefreshToken, options)
    .json(
      new ApiResponse(
        200,
        {accessToken, refreshToken: newRefreshToken},
        "Access token refreshed"
      )
    );
  } catch (error) {
     throw new ApiError(401, error?.message || "Invalid or expired refresh token");
    
  }
});

// --- Change current password ---
const changeCurrentPassword = asyncHandler(async (req, res) => {
  // add confirm password
  const {oldPassword, newPassword, confirmPassword} = req.body;

  // 1. Check confirm password
  if(!(newPassword == confirmPassword)) {
    throw new ApiError(400, "New password and confirm password do not match");
  }

  // 2. Find User
  const user = await User.findById(req.user?.id); // dont forget await

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // 3. Verify old Password
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid old password");
  }

  // 4. Update password
  user.password = newPassword;
  await user.save({validateBeforeSave: false});

  return res
  .status(200)
  .json(new ApiResponse(200, {}, "Password changed successfully"));

});

//--- Get current logged-in user---
const getCurrentUser = asyncHandler(async (req, res) => {
  return res
  .status(200)
  .json(new ApiResponse(200, req.user, "current user fetched successfully"));
});

// ---Update account details---
const updateAccountDetails = asyncHandler(async (req,res) =>{
    const {fullName, email} = req.body;
    
    // 1. Validate required fields
    if (!fullName || !email) {
      throw new ApiError(400, "All fields are required")
    }

    // 2. Validate email format (optional but recommended)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)){
      throw new ApiError(400, "Invalid email format")
    }

    try {
      // 3. Update user with validation
      const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
          $set: {
            fullName: fullName,
            email: email,
          },
        },
        {new: true, runValidators: true} // runValidators ensures schema validation
    
      ).select("-password");
    
      if (!user) {
        throw new ApiError(404, "User not found");
      }
    
      // 4. Success response
      return res
      .status(200)
      .json(new ApiResponse(200, user, "Account details updated successfully"))
    
    } catch (error) {
      // 5. Handle duplicate email (E11000 error from MongoDB)
      if (error.code === 11000) {
        throw new ApiError(400, "Email is already in use");
      }
      throw error; // re throw other errors
      
    }
});

// --- Update avatar ---
const updateUserAvatar = asyncHandler( async (req, res)=> {
  // here we want only one file (file option provided by multer)
  // If multer is configured with single("avatar")
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath){
    throw new ApiError(400, "Avatar file is missing")
  }

  /*

  // TODO: delete old image -assignment
  // 1. Find the current user to get old avatar
  const existingUser = await User.findById(req.user?._id);

  if (!existingUser) {
    throw new ApiError(404, "User not found");
  }

  // 2. If user already has an avatar, delete it from Cloudinary
  if (existingUser.avatar) {
    try {
      // Cloudinary stores public_id in the URL after "upload/" 
      const publicId = existingUser.avatar.split("/").pop().split(".")[0];
      await uploadOnCloudinary.uploader.destroy(publicId)
    } catch (error) {
      console.error("Error deleting old avatar:", error.message);
      // we dont throw here, because even if deletion fails, we still upload new image
      
    }
  }

  */
  // 3. Upload new avatar
  
  const avatar = await uploadOnCloudinary(avatarLocalPath)

  if (!avatar || !avatar.url){
    throw new ApiError(400, "Error while uploading on avatar");

  }

  // 4. Update user with new avatar URL
  const user = await User.findByIdAndUpdate
  (
    req.user?._id,
    {
      $set:{
        avatar: avatar.url,
      },
    },
    {new: true}
  ).select("-password");

  return res
  .status(200)
  .json(
    new ApiResponse(200, user, "Avatar image updated successfully")
  )
});

// --- Update cover image ---
const updateUserCoverImage = asyncHandler(async (req,res)=> {
  // Multer saves the uploaded file locally first
  const coverImageLocalPath = req.file?.path;
  
  if(!coverImageLocalPath) {
    throw new ApiError(400, "CoverImage is missing");
  }

  // upload file to Cloudinary
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!coverImage || !coverImage.url){
    throw new ApiError(400, "Error while uploading on coverImage");
  }

  // Update user in DB
  const user = await User.findByIdAndUpdate
  (
    req.user?._id,
    {
      $set:{
        coverImage: coverImage.url,
      },
    },
    {new: true}
  ).select("-password")

  return res
  .status(200)
  .json(
    new ApiResponse(200, user, "Cover image updated Successfully")
  )

});

// --- Get user channel profile ---
const getUserChannelProfile = asyncHandler(async (req, res)=> {
  const {username} = req.params

  if (!username?.trim()){
    throw new ApiError(400, "Username is missing")
  }

  // Using aggregate pipeline
  const channel = await User.aggregate([
    {
      $match: {
        username: username.toLowerCase()
      }
    },
    {

      $lookup: {
        from: "subscriptions",
        localfiels: "_id",
        foreignField: "channel",
        as: "subscribers"
      }
    },
    {

      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo"
      }
    },
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers"
        },
        channelsSubscribedToCount: {
          $size: "$subscribedTo"
        },
        idSubscribed: {
          $cond: { // true: then, false: else.
            if: {$in: [req.user?._id, "$subscribers.subscriber"]},
            then: true,
            else: false
          }
        }
      }
    },
    {
      $project: {
        fullName: 1, // flag on
        username: 1,
        subscribersCount: 1,
        channelsSubscribedToCount: 1,
        idSubscribed: 1,
        avatar: 1,
        coverImage: 1,
        email: 1,
      }
    }
  ])
  
  if (!channel?.length){ // it check channel is exist or not
    // "If channel doesn't exist or it's an empty array, then do something (e.g., return a 404 or handle the error)."
    throw new ApiError(404, "channel does not exist")
  }

  return res
  .status(200)
  .json(
    new ApiResponse(200, channel[0], "User channel fetched successfully")
  )
})

//--- Get watch history ---
const getWatchHistory = asyncHandler(async (req, res) => {
  /*
   req.user._id // here we get string (ObjectId), and (behind the sence mongoose handel)
  */

   // aggregation pipeline ka jitna bhi code hai wo directly hi jata hai.
   const user = await User.aggregate([
  {
    $match: {
      _id: new mongoose.Types.ObjectId(req.user._id)  // ensure string → ObjectId
    }
  },
  {
    $lookup: {
      from: "videos", 
      localFiels: "watchHistory",
      foreignField: "_id",
      as: "watchHistory",
      pipeline: [
        {
          $lookup: {
            from: "users",
            localField: "owner",
            foreignField: "_id",
            as: "owner",
            pipeline: [
              {
                $project: {
                  fullName: 1,
                  username: 1,
                  avatar: 1
                }
              },
              {
                $addFields: {
                  owner: {
                    $first: "$owner"
                  }
                }
              }
            ]
          }
        }
      ]
    }
  }
  ])

  return res
  .status(200)
  .json(
    new ApiResponse(
      200,
      user[0]?.WatchHistory || [],
      "Watch history fetched successfully"
    )
  )

});


export { 
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory
}
