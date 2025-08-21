/*
An IIFE (Immediately Invoked Function Expression) is a JavaScript function that runs as soon as it is defined.

Syntax:

(function () {
  console.log("This runs immediately!");
})();

Breakdown:
-Function Expression:
(function () { ... }) → wrapping it in () turns it into an expression instead of a declaration.
-Immediately Invoked:
() at the end executes the function right away.

Example with parameters:

(function (name) {
  console.log(`Hello, ${name}!`);
})("Sanskar");

Output: Hello, Sanskar!

Why use IIFE?
-To avoid polluting the global scope (good for modular code).
-To create a private scope for variables.
-Useful in older JavaScript (before ES6 modules).
*/

/*
import mongoose from 'mongoose'

;( async () => {})()

Explaination: if in the first line semicolon (;) is use then no need to start iife with semicolon.
right way-

import mongoose from 'mongoose';
( async ()=>{})()

*/

/*
"dev": "nodemon -r dotenv/config  --experimental-json-modules src/index.js"


What each part means
1.nodemon
- A tool that automatically restarts your Node.js app when you change files.
- So instead of running node src/index.js every time, nodemon does it for you.
2. -r dotenv/config
 -r means require this module before running your app.
- Here, it loads dotenv/config, which automatically reads your .env file and populates process.env.
- Equivalent to writing in your index.js:

import "dotenv/config";

3.--experimental-json-modules
-This flag allows you to import JSON files directly in ES Modules (import something from "./data.json").
-Without it, Node.js would throw an error if you try to import JSON.
-In Node 20+, this is no longer needed (JSON modules are stable). You can remove it if you’re on a recent version.

4.src/index.js
-The entry point of your app. Nodemon runs this file.

How to use it 
In package.json: 

"scripts": {
  "dev": "nodemon -r dotenv/config --experimental-json-modules src/index.js"
}

Then run: 

npm run dev

And Nodemon will:
-Load environment variables from .env
-Enable JSON imports
-Run src/index.js
-Restart automatically when files change

*/


/*
Example in your Express project:

// app.js
import express from "express";
const app = express();
export default app;

Then in index.js 

import app from "./app.js";

If instead you do: 

// app.js
import express from "express";
const app = express();
export { app };

Then in index.js: 

import { app } from "./app.js"


*/

/*
app.use() => mostly uses when you want middleware or configration setting.
*/

/*
What is Multer?
-Multer is a Node.js middleware for handling multipart/form-data.
-multipart/form-data is the encoding used when you upload files (like images, PDFs, videos) via forms or APIs.
-Multer works with Express.js and saves uploaded files either in memory or on disk.

Why do we need Multer?
-By default, Express cannot handle file uploads (only JSON or URL-encoded data).
Multer makes it possible to:
-Upload files via REST APIs
-Store them locally (e.g., uploads/ folder)
-Or pass them to cloud storage (AWS S3, Cloudinary, etc.)

Example:

import express from "express";
import multer from "multer";

const app = express();

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // where to save
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname); // unique name
  }
});

const upload = multer({ storage });

// Route to upload single file
app.post("/upload", upload.single("myFile"), (req, res) => {
  res.send({
    message: "File uploaded successfully",
    file: req.file
  });
});

app.listen(3000, () => console.log("Server running on 3000"));

Now you can send a POST /upload request with a file (myFile) using Postman or an HTML form.

Key Multer Methods
-upload.single(fieldName) → upload one file.
-upload.array(fieldName, maxCount) → upload multiple files under the same field.
-upload.fields([{ name, maxCount }, ...]) → upload multiple fields.

So, Multer = middleware to handle file uploads in Express apps.

*/

/*
url has encoder => converts special characters like (space => that has url encoder ids %20) 
*/

/*
What is cookie-parser?
-cookie-parser is a middleware for Express.js.
-It parses the Cookie header from incoming HTTP requests.
-After parsing, it makes cookies easily accessible via req.cookies (and req.signedCookies if you use a secret).

-app.use(cookieParser()) allows Express apps to easily read and manage cookies from client requests.

Basic Setup:

import express from "express";
import cookieParser from "cookie-parser";

const app = express();

// middleware
app.use(cookieParser());

// test route
app.get("/", (req, res) => {
  res.send(req.cookies); // shows all cookies sent by client
});

app.listen(3000, () => console.log("Server running on 3000"));

*/

/*
What is Express?
-Express.js (or simply Express) is the most popular web framework for Node.js.
-It simplifies building APIs and web apps by providing tools for routing, middleware, request/response handling, and more.

👉 Think of Express as the "backbone" for building a server in Node.js.

Why use Express?
-Lightweight & fast
-Minimal boilerplate
-Huge ecosystem (middlewares like cookie-parser, cors, multer, express-validator)
-Powers many production apps (APIs, web services, microservices)

Basic Example: 

import express from "express";

const app = express();

// Middleware to parse JSON
app.use(express.json());

// Simple route
app.get("/", (req, res) => {
  res.send("Hello, Express!");
});

// Start server
app.listen(3000, () => {
  console.log("🚀 Server running at http://localhost:3000");
});

Key Concepts:

1. Routing
Defines how your app responds to requests:

app.get("/users", (req, res) => {
  res.send("List of users");
});

app.post("/users", (req, res) => {
  res.send("User created");
});

2. Middleware
-Functions that process requests before sending a response.
-Examples: authentication, logging, parsing body, error handling.

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next(); // pass control to next middleware/route
});


3. Request & Response

Express wraps Node.js req and res objects for convenience.

app.get("/hello/:name", (req, res) => {
  res.json({ message: `Hello, ${req.params.name}` });
});


4. Error Handling

Custom error middleware

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

Express is a framework for Node.js that makes it easy to build web servers and APIs.

*/

/*
based on cryptography.(based on cryptographical Algorithm)
bcrypt => A bcrypt library for nodejs (core)
A library to help you hash passwords.

bcryptjs => Optimized bcrypt in plain Javascript with zero dependencies. Compatiable to 'bcrypt'

jsonwebtoken(jwt) => based on cryptography
jwt secret which protect the tokens

jwt it is a Bearer token (this is like a key )
if any person has Bearer token then system send the data.
*/

/*
ACCESS_TOKEN_SECRET=you are cunt
// ACCESS_TOKEN is not store in the databse.

ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=i love you
// REFRESH_TOKEN is store in the database.

REFRESH_TOKEN_EXPIRY=10d

Session and cookies (read.)
*/

/*
npm install cloudinary
npm install multer

*/

/*
// when export is default then use below syntax like "./routes/user.routes.js"
import userRouter  from "./routes/user.routes.js"

// using only the below syntax when export is not in the default.
import { registerUser } from "../controllers/user.controllers.js";
*/

/*

1  ./ (single dot)
Means current directory.
So ./middlewares/multer.middleware.js looks for a folder middlewares inside the same folder as the current file.

2  ../ (double dot)
Means go up one level (parent directory).
So ../middlewares/multer.middleware.js goes up one folder from the current file’s directory, then looks for middlewares.

Example Folder Structure

src/
 ├── middlewares/
 │    └── multer.middleware.js
 ├── routes/
 │    └── user.routes.js
 └── index.js

- inside user.routes.js (which inside routes/):

import { upload } from "../middlewares/multer.middleware.js"

✅ correct, because you need to go up one level from routes/ into src/, then down into middlewares/.

- Inside index.js (which is in src/):

import { upload } from "./middlewares/multer.middleware.js"

✅ correct, because middlewares/ is in the same folder as index.js.

Rule of Thumb
Use ./ if the target is in the same directory.
Use ../ for parent directory.
You can chain: ../../ goes up two levels, etc.
*/

/*
refreshToken => we can save in the database, so that can not take from the user again nad again

accessToken => user ko de-dete hai
*/

/*

const options = {
    httpOnly: true,
    secure: true
}

basically cookie can be modify from the frontend (bydefault)
but when you apply (httpOnly: true) then these cookies are only modified by server only.
*/

/*

After adding app.use(cookieParser())  middleware 
then we can access req.cookie(), res.cookie()

*/

/*
req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")

"bearer " (Bearer + space)=> completly replace with "" empty string with no space.
*/

/*

export const verifyJWT  = asyncHandler(async (req, res, next)

if response is not in the use then we write in the production grade, like

export const verifyJWT  = asyncHandler(async (req, _, next)

*/

/*
refreshToken vs accessToken ? article

req.user?.id => find id from req.user
*/

/*
Aggregation Pipeline (read -decumentation)

*/