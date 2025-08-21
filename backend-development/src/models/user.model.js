import mongoose, { Schema } from 'mongoose';
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"


const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true // for database searching (more think then use) fast-lookups
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"]
    },
    fullName: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true //if you search someone based on index  
    },
    avatar: {
      type: String, // cloudinary url service (like aws)
      required: true
    },
    coverImage: {
      type: String, // cloudinary url
    },
    watchHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video"
      }
    ],
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false, // hide by default
    },
    refreshToken: {
      type: String,
      select: false, // hide by default
    },
  },

  {
    timestamps: true
  }
)

// pre-hook it is a type of method 
// in the arrow function their is no context(this reference) so, in the pre-hook no need to use arrow function.

// Hash Password on create/change
userSchema.pre("save", async function (next) { 

  // it is a middleware, specially use next flag.
  // basically we need only hash password first-time and when user update password.
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10)
  next()

});

// Compare passwords
userSchema.methods.isPasswordCorrect = async function 
(password){ 
  // using await because it is a cryptography, take some time.
  return await bcrypt.compare(password, this.password)
  // retutn true or false
};


// Access token (short-lived)
userSchema.methods.generateAccessToken = function(){
  // no need to add async await bec it is fast

  return jwt.sign(
    {
      // payload 
      _id: this._id,
      email: this.email,
      username: this.username,
      fullname: this.fullName
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
  )
}


// Refresh token (long-lived, minimal payload)
userSchema.methods.generateRefreshToken = function(){
  // no need to add async await bec it is fast
  return jwt.sign(
    {
      // payload 
      _id: this._id,      
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    }
  )
}

// this User is able to directly contect with database because this User is created by mongoose
export const User = mongoose.model("User", userSchema)