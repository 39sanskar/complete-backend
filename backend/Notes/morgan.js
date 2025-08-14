/*
-Morgan is a third-party logging middleware for Node.js/Express that helps you automatically log details about each HTTP request your server receives.


Why use Morgan?
-Tracks method, URL, status code, response time.
-Useful for debugging, monitoring, and analyzing traffic.
-Saves you from writing your own logging logic every time.

Installation

npm install morgan

Examples:

const express = require("express");
const morgan = require("morgan");

const app = express();

// Use Morgan in 'dev' format
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.send("Hello, Morgan!");
});

app.listen(3000, () => console.log("Server running on port 3000"));

How It Works
When you run the server and visit /, Morgan will log something like:

GET / 200 5.123 ms - 14

- GET → HTTP method
- / → Request path
- 200 → Status code
- 5.123 ms → Response time
- 14 → Response size in bytes

Common Login Format

| Format     | Description                                  |
| ---------- | -------------------------------------------- |
| `dev`      | Short, color-coded, good for development.    |
| `tiny`     | Very minimal output.                         |
| `combined` | Detailed Apache-style logs with user agent.  |
| `common`   | Standard Apache common log format.           |
| `short`    | Shorter than combined but still informative. |

*/