/*
-Static files are files that the server sends to the client exactly as they are, without changing them or generating them dynamically.
-Examples of static files:
-HTML files (fixed content)
-CSS files (stylesheets)
-JavaScript files (client-side scripts)
-Images (JPEG, PNG, SVG, etc.)
-Fonts (TTF, WOFF)
-Videos / Audio files

-In simple terms:
-If your website has an image logo.png in a public folder, the server just sends that file when the browser asks for it — it doesn’t generate it from code each time.

Static files in Express.js 

const express = require("express");
const app = express();

// Serve files from the "public" folder
app.use(express.static("public"));

app.listen(3000, () => console.log("Server running on port 3000"));

If public/logo.png exists, visiting

http://localhost:3000/logo.png


Here’s the difference between static and dynamic files in a clear table:

Aspect           | Static Files                | Dynamic Files
                 |                             |
                 |                             | 
Definition       | Sent to the client exactly  | Generated or modified  
                 | as stored on the server.    | on-the-fly before
                 |                             | sending to the client.

Examples         | HTML, CSS, JS,              | Web pages rendered from  
                 | images, fonts, videos.      | templates, API responses,
                 |                             | user-specific dashboards.

Content Changes  | Doesn’t change unless       | Changes based on user   
                 | the developer manually      | input, database content,
                 | updates the file.           | or server logic.

Performance      | Very fast to serve          | Slightly slower because  
                 | (often cached by            | the server must process
                 | browsers/CDN).              | code before sending.
                 |                             |

Use Case         | Logos, stylesheets,         | Search results,  
                 | common scripts,             | logged-in user profile pages,
                 | static landing pages.       | e-commerce product listings.

                                              
Example URL      | /logo.png always            | /profile?id=5 might  
                 |  returns the same image.    | show a different page
                 |                             | for each user.

*/

/*
 Simple analogy:
-Static → Like a printed book 📖 (content doesn’t change unless you reprint it).
-Dynamic → Like a conversation 💬 (response depends on who’s asking and what they say).
*/

/*
Static files => are those files user can direct access without any (restriction or Authentication ) from the frontend

also use built-in-middleware => app.use(express.static("filder-name"))

*/