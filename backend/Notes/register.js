/*
const { username, email, password } = req.body;


What’s happening
-This is object destructuring in JavaScript.
-req.body is an object that contains the data sent by the client (e.g., from an HTML form or API request).
-{ username, email, password } means:
-Create three variables: username, email, and password.
-Assign them the values of the corresponding keys from req.body.

Example:
If req.body looks like this:

{
  username: "john_doe",
  email: "john@example.com",
  password: "secret123"
}

Then:

const { username, email, password } = req.body;

is the same as 

const username = req.body.username;
const email = req.body.email;
const password = req.body.password;


-Why use destructuring?
-Shorter and cleaner code.
-Easier to read when extracting multiple properties.
*/

/*
app.post('/register', (req, res) => {
  
  const { username, email, password } =  req.body
  
  await userModel.create({
    username: username,
    email:email,
    password:password
  })

  res.send('user-register')
})

Problem: this above function send the user to res.send('user-register') before the creation of the creation of the user in the database. 

Solution: Using async-await in the function , so first it create the user in the databae and then send the res.send('user-register')

app.post('/register', async (req, res) => {
  
  const { username, email, password } =  req.body
  
  await userModel.create({
    username: username,
    email:email,
    password:password
  })

  res.send('user-register')
})

*/