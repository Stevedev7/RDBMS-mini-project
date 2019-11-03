//Requiring packages
const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require('dotenv');
const session = require('express-session');
const cookieParser = require('cookie-parser');

const db = require('./config/db');
const seedDB = require("./config/seeds");

//Routes

const indexRoutes = require('./routes/index');
const itemsRoutes = require('./routes/items');
const commentsRoutes = require('./routes/comments');
const adminRoutes = require('./routes/admin');

const app = express();

app.use(cookieParser());
app.use(express.static(__dirname + "/public"));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}));

dotenv.config();//use environment variables
//connect to the database
db.connect(err=>{
    if(err){
        console.log(err);
    } else {
        console.log("Connected to database...");
    }
});

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

seedDB(); //seeding the database

app.use((req, res, next) =>{
    res.locals.username = req.cookies.username;
    next();
})
app.use("/", indexRoutes);

app.use("/items", itemsRoutes);

app.use("/items/:id/comments", commentsRoutes);

app.use("/admin", adminRoutes);

app.get("*", (req, res) => {
    res.send("page not found")
})

app.listen(process.env.PORT, console.log(`Listening to port ${process.env.PORT}`));
