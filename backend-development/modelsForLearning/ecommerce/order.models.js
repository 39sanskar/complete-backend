import mongoose from "mongoose";

// orderItemschema
const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product"
  },
  quantity: {
    type: Number,
    required: true    
  }
})

// orderSchema with(using orderItemschema)
const orderSchema = new mongoose.Schema({
      orderPrice: {
        type: Number,
        required: true,
      },
      customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      OrderItems: {
        type: [orderItemSchema], // so orderItemSchema is only use by orderItems (so not export if want to export then export.) 
      },
      address: {
        type: String,
        required: true
      },
      status: {
        type: String,
        enum: ["PENDING", "CANCELLED", "DELIVERED"], // enums provides you choices
        default: "PENDING"
      }
    }, 
  
  {timestamps: true}
)


export const Order = mongoose.model("Order", orderSchema)