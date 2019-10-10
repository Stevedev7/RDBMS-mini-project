const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mysql = require("mysql");
const seedDB = require("./seeds");
const makeId = require('./makeId');

const db = mysql.createConnection({
  host     : 'localhost',
  user     : 'menu',
  password : 'menu',
  database : 'MyRestaurant'
});

db.connect(err=>{
    if(err){
        console.log(err);
    } else {
        console.log("Connected to database...");
    }
});
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

seedDB();
app.get("/", (req, res)=> {
    res.render("landing");
});
app.get("/items", (req, res) =>{
    let foodItems = "SELECT * FROM Food";
    let beverageItems = "Select * from Beverages";
    db.query(`DROP TABLE IF EXISTS AllItems`, (err, result) =>{
        if(err) throw err;
        console.log("AllItems Dropped");
    });
    db.query(foodItems, (err, food) =>{
        if(err) throw err;
        db.query(beverageItems, (err, bev) => {
            if(err) throw err;
            db.query(`CREATE TABLE AllItems (Name varchar(255), _id varchar(25), Image varchar(500))`, (err, all)=>{
                if(err) throw err;
                food.forEach(x=>{
                    db.query(`INSERT INTO AllItems VALUES (\'${x.Name}\', \'${x._id}\', \'${x.Image}\')`, (err, result) =>{
                        if(err) throw err;
                    });
                });
                bev.forEach(x=>{
                    db.query(`INSERT INTO AllItems VALUES (\'${x.Name}\', \'${x._id}\', \'${x.Image}\')`, (err, result) =>{
                        if(err) throw err;
                    });
                });
                db.query(`SELECT * FROM AllItems ORDER BY Name`, (err, allItems) =>{
                    if(err) throw err;
                    res.render("items/index", {items: allItems});
                });
            });
        });
    });
    db.query(`DROP TABLE IF EXISTS AllItems`, (err, result) =>{
        if(err) throw err;
        console.log("AllItems Dropped");
    });
    // db.query(foodItems, (err, result) =>{
    //     if(err) throw err;
    //     var items = result;
    //     db.query(`SELECT * FROM Beverages ORDER BY Name`, (err, result)=>{
    //         if(err) throw err;
    //         result.forEach(x=>{
    //             items.push(x);
    //         });
    //         res.render("items/index", {items: items});
    //     });
    // });
});

app.post("/items", (req, res) =>{
    if(req.body.type == "food"){
        let name = req.body.name,
            img = req.body.image,
            description = req.body.description,
            type1 = req.body.type1,
            type2 = req.body.type2,
            price = Number(req.body.price),
            id = makeId(20);
        let sql = `INSERT INTO Food VALUES(\'${name}\', \'${id}\', \'${type1}\', \'${img}\', ${price}, \'${type2}\', \'${description}\')`;
        db.query(sql, (err, result)=>{
            if(err) throw err;
            res.redirect("/items");
        });
    } if(req.body.type == "bev"){
        let name = req.body.name,
            img = req.body.image,
            description = req.body.description,
            type1 = req.body.type1,
            price = Number(req.body.price),
            id = makeId(25);
        let sql = `INSERT INTO Beverages VALUES (\'${name}\', \'${id}\', \'${type1}\', \'${img}\', ${price}, \'${description}\')`;
        db.query(sql, (err, result)=>{
            if(err) throw err;
            res.redirect("/items");
        });
    }
});
app.get("/items/new", (req, res) =>{
    res.render("items/new");
});
app.get("/items/:id", (req, res)=>{
    if(req.params.id.length === 20){
        db.query(`SELECT * FROM Food WHERE _id = \'${req.params.id}\'`, (err, item)=>{
            if(err) throw err;
            db.query(`SELECT * FROM Comments WHERE FoodId = \'${req.params.id}\'`, (err, comments)=>{
                if(err) throw err;
                res.render("items/item", {item: item, comments: comments});
            });
        });
    } else {
        db.query(`SELECT * FROM Beverages WHERE _id = \'${req.params.id}\'`, (err, item)=>{
            if(err) throw err;
            db.query(`SELECT * FROM Comments WHERE BeverageID = \'${req.params.id}\'`, (err, comments)=>{
                if(err) throw err;
                res.render("items/item", {item: item, comments: comments});
            });
        });
    }
});

//==========================================================================================================
//Comments routes
//==========================================================================================================

app.get("/items/:id/comments/new", (req, res) =>{
    var _id = req.params.id;
    if(req.params.id.length === 20){
        var table = "Food";
    } else if(_id.length === 25){
        var table = "Beverages";
    }
    let sql = `SELECT Name, _id  FROM ${table} WHERE _id = \'${_id}\'`;
    db.query(sql, (err, item) =>{
        if(err) throw err;
        res.render("comments/new", {item: item});
    });
});

app.post("/items/:id/comments", (req, res)=>{
    var _id = req.params.id;
    var table, fid, bid;
    if(_id.length === 20){
        table = "Food";
        fid = "\'" + _id + "\'";
        bid = "null";
    } else if(_id.length === 25){
        table = "Beverages";
        fid = "null";
        bid = "\'" + _id + "\'";
    }
    db.query(`SELECT * FROM ${table} WHERE _id = \'${_id}\'`, (err, item) =>{
        if(err) res.redirect("/items");
        let user = "loki@1234",
            comment = req.body.text,
            sql = `INSERT INTO Comments VALUES (\'${user}\', ${fid}, ${bid}, \'${comment}\', \'1999-07-19\')`;
            console.log(sql);
        db.query(sql, (err, result) =>{
            if(err) throw err;
            console.log(result);
            res.redirect("/items/" + _id );
        });
    });
});

app.listen(6969, ()=> {
    console.log("Listening to port 6969");
});
