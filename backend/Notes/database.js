/*
npm install mongoose => 

What it does ?
-Installs Mongoose, an ODM (Object Data Modeling) library for MongoDB and Node.js.
-Helps you:
-Define schemas for your MongoDB collections.
-Validate data before saving.
-Interact with MongoDB using JavaScript methods instead of raw queries.

Example: 

const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/mydb")
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("Connection error:", err));


*/

/*
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  
})
const userModel = mongoose.model('user', userSchema)

module.exports = userModel;

*/
/*
Explanation:

const mongoose = require('mongoose');

-Imports the mongoose library into your file.
-You must have installed it using npm install mongoose.
-mongoose is used to connect to MongoDB and define schemas & models.

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  
})

-mongoose.Schema defines the structure (blueprint) for  documents inside a MongoDB collection.
-Here you’re creating a schema named userSchema with three fields:
-username → stores a string.
-email → stores a string.
-password → stores a string.
-Right now, you’re not adding validation rules (like required, unique, minLength) — just specifying the data types.


const userModel = mongoose.model('user', userSchema)

-Creates a model based on the schema.
-A model is like a JavaScript class that represents your MongoDB collection.
-'user' → The name of the model (Mongoose will create a collection named users — pluralized automatically).
-userSchema → The schema you defined earlier.
-userModel → This is the variable you’ll use to create, read, update, and delete documents from the users collection.


module.exports = userModel;

-What it does
-In Node.js, every file is treated as a module.
-module.exports is the object that determines what will be returned when another file require()s this file.
-Here, you are exporting the userModel so other files can import and use it.

-Why we need it
-If you don’t export userModel, you won’t be able to access it outside the file where it’s defined

- Analogy:
-Think of module.exports as packing an item into a box 📦 and require() as opening the box in another file to use the item.
*/

/*
improved userSchema with validation, default values, and some security-friendly settings:

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,        // Must be provided
    unique: true,          // No two users with the same username
    trim: true,            // Removes extra spaces
    minlength: 3           // Minimum 3 characters
  },
  email: {
    type: String,
    required: true,        // Must be provided
    unique: true,          // No duplicate emails
    trim: true,
    lowercase: true,       // Always store in lowercase
    match: [/^\S+@\S+\.\S+$/, "Invalid email format"] // Email pattern
  },
  password: {
    type: String,
    required: true,
    minlength: 6           // Stronger password rule
  },
  createdAt: {
    type: Date,
    default: Date.now      // Auto-set when user is created
  }
});

// Create the model
const userModel = mongoose.model('user', userSchema);

module.exports = userModel;


What’s New
-Validation → Prevents invalid or missing data.
-unique → Stops duplicate usernames/emails.
-trim → Removes accidental spaces.
-lowercase → Makes emails case-insensitive.
-Regex match → Checks for valid email format.
-createdAt → Auto-stamps creation date.
*/

/*
How to connect DataBase
- First create a config folder and inside db.js 

const mongoose = require('mongoose')

mongoose.connect('mongodb://0.0.0.0/backend')
*/

/*
{
  "_id": {
    "$oid": "689ccd26ff66f8c8139a4115"
  },
  "username": "b",
  "email": "b@gmail.com",
  "password": "b",
  "__v": 0
}

basically "_id" is cereated by the mongoose. each user has different id (No two user has same _id).

__v: it is the version that tells us how many times user is update 
*/