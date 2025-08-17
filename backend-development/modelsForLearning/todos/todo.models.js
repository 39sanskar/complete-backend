import mongoose from 'mongoose'


const TodoSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  complete: {
    type: Boolean,
    default: false,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User" // use name which is present inside the model (reference is compulsury).
  },
  subTodos: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubTodo"
    }
  ] // Array of sub-Todos
}, {timestamps: true})


export const Todo = mongoose.model("Todo", TodoSchema)
