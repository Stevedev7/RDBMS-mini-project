const express = require('express');
const db = require('../config/db');
const makeId = require('../config/makeId');
const verifyAdmin = require('../auth/adminVerification');
const router = express.Router();

//show all items
router.get("/", (req, res) =>{
    let sql = "SELECT Name, _id, Image FROM Food UNION (SELECT Name, _id, Image FROM Beverages) ORDER BY Name";
    db.query(sql, (err, items) =>{
        if(err) throw err
        res.render("items/index", {items});
    });
});

router.post("/", verifyAdmin, (req, res) =>{
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
router.get("/new", verifyAdmin, (req, res) =>{
    res.render("items/new");
});

// display item details

router.get("/:id", (req, res)=>{
    //check if the item is food or a beverage
    if(req.params.id.length === 20){
        db.query(`SELECT * FROM Food WHERE _id = \'${req.params.id}\'`, (err, item)=>{
            if(err) throw err;
            db.query(`select Users.UserName, Comments.Text from Users, Comments where comments.FoodID = \'${req.params.id}\'`, (err, comments)=>{
                if(err) throw err;
                res.render("items/item", {item, comments});
            });
        });
    } else {
        db.query(`SELECT * FROM Beverages WHERE _id = \'${req.params.id}\'`, (err, item)=>{
            if(err) throw err;
            db.query(`select Users.UserName, Comments.Text from Users, Comments where Comments.BeverageID = \'${req.params.id}\'`, (err, comments)=>{
                if(err) throw err;
                res.render("items/item", {item, comments});
            });
        });
    }
});

module.exports = router;
