const express = require("express");
const app = express()
const connectToMongo = require("./db/conn");
const session = require("express-session");

// connecting to the db here
connectToMongo();

// session 
app.use(session({
    secret: "ourlittlesecret",
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 1  // this is will be stored one day
    }
}));


// urlencoded express
app.use(express.urlencoded({extended: "false"}));

// view engine of ejs 
app.use(express.static('public'));
app.set("view engine", "ejs");


// routes is here
app.use("/admin", require("./routers/admin"));
app.use("/", require("./routers/frontend"));
app.use("/parking", require("./routers/parking"));

// port listening is here
app.listen(5000, ()=>{
    console.log("Your server is running on port 5000");
});