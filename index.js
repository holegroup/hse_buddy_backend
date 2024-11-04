require("dotenv").config(); 
const express = require("express"); 
const app = express(); 
const connectDB = require("./config/db");

const userRoutes = require("./routes/userRoutes"); 

// cors
const cors = require("cors"); 
const bodyParser = require("body-parser");


app.get("/", (req, res) => { 
    res.send("server is running on port:-", process.env.PORT); 
}); 

// middlewares for server
app.use(bodyParser.json()); 
app.use(cors()); 

// connecting to db
connectDB(); 

// defining the routes
// user routes
app.use("/api/users", userRoutes); 

app.get("/testing", (req, res)=> { 
    res.send("<h1>Hello Subhankar</h1>"); 
})
app.get("/server", (req, res)=> { 
    res.send("<h2>This is a testing server Atendeor Flutter APP with auth log-in and auth reg-in(changed the login from req-body to req-query kismat kumar</h2>"); 
})

app.listen(process.env.PORT, ()=>{
    console.log(":server is listening in port", process.env.PORT); 
})
