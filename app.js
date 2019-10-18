//Requiring packages
const express = require("express");
const bodyParser = require("body-parser");

const db = require('./config/db');
const seedDB = require("./config/seeds");

const indexRoutes = require('./routes/index');
const itemsRoutes = require('./routes/items');
const commentsRoutes = require('./routes/comments')

db.connect(err=>{
    if(err){
        console.log(err);
    } else {
        console.log("Connected to database...");
    }
});

const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

seedDB();

app.use("/", indexRoutes);

app.use("/items", itemsRoutes);

app.use("/items/:id/comments", commentsRoutes);
//==========================================================================================================
//Comments routes
//==========================================================================================================

app.listen(6969, ()=> {
    console.log("Listening to port 6969");
});
