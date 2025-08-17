import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    }, // when you define username in a object then you call super-power of the mongoose
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
    }
  }, {timestamps: true}
)


export const User = mongoose.model("User", userSchema)

