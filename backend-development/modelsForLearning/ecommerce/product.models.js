import mongoose  from "mongoose";

const productSchema = new mongoose.Schema({
  description: {
    required: true,
    type: String,
  },
  name: {
    required: true,
    type: String
  },
  productImage: { // databases are not made for direct image storage
    type: String,
  },
  price: {
    type: Number,
    default: 0
  },
  stock: {
    default: 0,
    type: Number
  },
  category: {
    //In Mongoose, after defining the type of a field, you can add (in the next line) ref to tell Mongoose that this field is a reference to another collection.(Standard Practice.)

    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true
  },
  owner : {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
}, {timestamps: true})


export const Product = mongoose.model("Product", productSchema)
