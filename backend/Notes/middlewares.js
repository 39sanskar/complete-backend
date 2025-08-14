/*


1. Built-in Middleware
Definition:
- Middleware that comes pre-packaged with Express.js. No  need to install anything extra — you can use them directly. Mostly used for parsing data, serving static files, etc.

Examples:

const express = require("express");
const app = express();

app.use(express.json());       // Parse JSON request body
app.use(express.urlencoded()); // Parse URL-encoded data
app.use(express.static("public")); // Serve static files from 'public' folder


2. Custom Middleware
Definition:
- Middleware you create yourself to perform specific tasks like logging, authentication checks, or request validation.

Example:

function logger(req, res, next) {
  console.log(`${req.method} ${req.url}`);
  next(); // Pass control to next middleware or route
}

app.use(logger);


3. Third-party Middleware
Definition:
- Middleware developed by others and available as npm packages. You need to install them before using. Common for things like security, session handling, or CORS.

Examples:

const cors = require("cors");
const morgan = require("morgan");

app.use(cors());   // Enable CORS for cross-origin requests
app.use(morgan("dev")); // Log HTTP requests in development format


Types of        |      Definition              |      Examples in Express.js
Middlewares.    |                              |

Built-in        | Comes with Express.js by     |     express.json(), 
                |  default, no extra           |     express.urlencoded(),
                |  installation needed.        |     express.static()

Custom          | Written by you to            |     Logging requests, 
                | handle app-specific logic.   |     authentication check, 
                |                              |     data validation
                |  
                

Third-party     |  Installed from npm,         |  cors, 
                |  created by other developers |  morgan, 
                |  adds extra features.        |  helmet, 
                |                              |  cookie-parser
                
*/

/*
Built-In Middleware, Custom Middleware, Third-Party Middleware they all are run for each route (by-default).

custom middleware we can made for a particular route.
*/
