const express = require('express');
const Joi = require('@hapi/joi');
const db = require('../config/db');
const makeId = require('../config/makeId');
const verifyAdmin = require('../auth/adminVerification');
const verify = require('../auth/verification');
const router = express.Router({mergeParams: true});

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
        let sql = `INSERT INTO Food VALUES(\'${id}\',\'${name}\' , \'${type1}\', \'${img}\', ${price}, \'${type2}\', \'${description}\')`;
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
        let sql = `INSERT INTO Beverages VALUES (\'${id}\', \'${name}\', \'${type1}\', \'${img}\', ${price}, \'${description}\')`;
        db.query(sql, (err, result)=>{
            if(err) throw err;
            res.redirect("/admin/items");
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
                res.render("items/item", {item, comments, message: ""});
            });
        });
    } else {
        db.query(`SELECT * FROM Beverages WHERE _id = \'${req.params.id}\'`, (err, item)=>{
            if(err) throw err;
            db.query(`select Users.UserName, Comments.Text from Users, Comments where Comments.BeverageID = \'${req.params.id}\'`, (err, comments)=>{
                if(err) throw err;
                res.render("items/item", {item, comments, message: ""});
            });
        });
    }
});

router.post("/:id/order", verify, async (req, res)=>{
    var _id = req.params.id;
    var table, fid, bid, field;
    //Check if the item is a food or a Beverage
    if(_id.length === 20){
        table = "Food";
        fid = `\'${_id}\'`;
        bid = "null";
        field = 'FoodID';
    } else if(_id.length === 25){
        table = "Beverages";
        fid = "null";
        bid = `\'${_id}\'`;
        field = 'BeverageID';
    }
    const order = {
        qty:req.body.qty
    }
    const schema = Joi.object({
        qty: Joi.number()
        .integer()
        .min(1)
    });
    const {error, value} = await schema.validate(order);
    if(!error){
        //Proceed the order process
        db.query(`SELECT * FROM ${table} WHERE _id = \'${_id}\'`, (err, item) =>{
            if(err) res.redirect("/items");
            db.query(`select Users.UserName, Comments.Text from Users, Comments where Comments.${field} = \'${_id}\'`, (error, comments) =>{
                let user = req.cookies.userid,
                    qty = req.body.qty,
                    sql = `INSERT INTO Orders VALUES (\'${makeId(35)}\', \'${user}\', ${fid}, ${bid}, \'${qty}\', \'1999-07-19\')`;
                db.query(sql, (err, result) =>{
                    if(err) throw err;
                    res.render("items/item", {item, comments, message: "Order placed..."});
                });
            })
        });
    } else {
        db.query(`SELECT * FROM ${table} WHERE _id = \'${_id}\'`, (err, item) =>{
            if(err) res.redirect("/items");
            db.query(`select Users.UserName, Comments.Text from Users, Comments where Comments.${field} = \'${_id}\'`, (error, comments) =>{
                    res.render("items/item", {item, comments, message: "Invalid order quantity..."});
            });
        });
    }

});

module.exports = router;
