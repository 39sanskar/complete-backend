/*
Nodejs it is the run-time environment for a javascript.

Nodejs is developed in a V8-engine initially it was developed for a chrome.

some developer create a copy of the v8 engine and developed a nodejs , so it provides us a functionallity to run a javascript (browser se alag kahi aaur) in the server.

npm init -y => this particular command create a package.json file (application initate)

package.json => (it is specially for a developer) only tells us in the package what is it contain like - dependencies etc...
if you have package.json then only one command you will run (npm i) then you got node_modules and package-lock.json
Remember: package.json you never be delete


package-lock.json => it is specially for system where you will run your application.

without node_modules application will not work.

package => it is a reusable code (npmjs.com website)

npm i cat-me  => install cat-me package 

require('cat-me') => jitna bhi code cat-me ke andar hai usko particular file ke andar le jana hai.

for creating a server => first you require('http') and also its store in a constant  ( const http = require('http') )
by-default http comes with nodejs 

const server = http.createServer() => createServer() it is a method that returns you server-instance {basically it creates a server not run , only create.}

- server.listen(3000) => it is basically start/run the server

- console.log(req.url) => basically you hit which particular route 

- npx nodemon app.js => it restart your application (realtime) in the terminal based on code when the js file change or update.

*/

/*
Basically it create a application but it is not the way of production level.

This is the http Server

const http = require('http');

const server = http.createServer((req, res) => {
  if (req.url == '/about'){
    res.end("The about page!")
  }

  if (req.url == '/profile'){
    res.end("The profile page!")
  }

  if (req.url == '/'){
    res.end("The hole page!")
  }
})

server.listen(3000, ()=> {
  console.log("Server is running ")
})

*/

/*
Basically express is a toolbox thats create a server 
const app = express() => when we call express() basically it opens a toolbox and store all the tools in the app variables 
if any tool i want to use then call it using   app.get(), app.post()  etc..
- also here we use res.send() and not using res.end().
- express behind the seen it uses http (express is a kind   of framework feeling).
*/

/*
How to render HTML with help of express ? 
first setup a view engine like ejs and create a foider which name is views and create a file index.ejs (and its inside code is exact HTML.)
npm i ejs => command for install
app.set("view engine", 'ejs') 
*/

/*

-Middleware is like a “middle layer” in your application that sits between the request coming in and the response going out.
-Its job is to process, modify, or check the request/response before handing it to the next step.
-In web development (like with Express.js), middleware functions can:

-Run before your route handler to validate, authenticate, or log data.
-Run after to format, compress, or send responses.
-Decide whether to pass control to the next middleware using next() or stop the request entirely.


function exampleMiddleware(req, res, next) {
  console.log("Middleware executed!");
  next(); // Pass to the next middleware or route
}

app.use(exampleMiddleware);

app.get("/", (req, res) => {
  res.send("Hello World!");
});


🔹 Key roles of middleware:
-Logging requests
-Checking authentication/authorization
-Parsing request data (e.g., JSON, form data)
-Error handling
-Serving static files

If you think of your app like an airport, middleware is like security checkpoints — each checkpoint can inspect, modify, or block travelers (requests) before they reach the gate (your route handler).


Here’s a visual flow diagram of how middleware works in something like Express.js:

[ Incoming Request ]
        │
        ▼
┌───────────────────┐
│ Middleware 1      │  → e.g., Log request details
└───────────────────┘
        │
        ▼
┌───────────────────┐
│ Middleware 2      │  → e.g., Check authentication
└───────────────────┘
        │
        ▼
┌───────────────────┐
│ Middleware 3      │  → e.g., Parse JSON body
└───────────────────┘
        │
        ▼
┌───────────────────┐
│ Route Handler     │  → e.g., Fetch data & send response
└───────────────────┘
        │
        ▼
[ Outgoing Response ]


Key idea:
- Each middleware can do something and then call next() to move to the next one.
- If a middleware doesn’t call next(), it stops the chain (useful for blocking unauthorized access).
- Middleware runs in order you define it.

Concept => In frameworks like Express.js, middleware functions run in the order you define them and are typically executed before the request reaches the route handler.

app.use((req, res, next) => {
  console.log("Middleware runs first");
  next(); // Pass control to next middleware/route
});

app.get("/", (req, res) => {
  res.send("Route handler runs after middleware");
});


The only time middleware won’t run before a route is if:
-You define the middleware after the route in code.
-The request is short-circuited by a previous middleware (e.g., authentication fails and it sends a response early).

*/
