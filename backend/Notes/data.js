/*
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>
<body>

  <form action="/get-form-data">
    <input
      type="text"
      placeholder="Enter username"
      name="username"
    >
    <input
      type="text"
      placeholder="Enter email"
      name="email"
    >
    <input 
      type="password"
      placeholder="Enter password"
      name="password"

    >
    <button>Submit form</button>
  
  </form>
</body>
</html>

// when you want to data is not show in the url then you should apply  app.post   (insted of  app.get)

// post method is generally using when you want to data from frontend to backend(server).  {data receive in the (req.body)}

// get method is generally using when you want to data from server to frontend  {data receive in the (req.query)}

// by-default their are any-form  that is hit the GET-ROUTE  (if  you want to hit POST-ROUTE then you mention 
in the form  method="post").

// by-default express is not able to read the data from the (req.body) if you want to read data from  (req.body) then 
use built-in middlewares =>  app.use(express.json())
                           app.use(express.urlencoded({ extended: true }))
*/

/*

app.get() route =>  it is show the form 
app.post() route => create the user 
*/
