const express = require('express');
const db = require('../config/db');
const makeId = require('../config/makeId');
const verify = require('../auth/verification');
const router = express.Router({mergeParams: true});

//add a new comment to an item
router.get("/new", verify, (req, res) =>{
    var _id = req.params.id;
    if(req.params.id.length === 20){
        var table = "Food";
    } else if(_id.length === 25){
        var table = "Beverages";
    }
    let sql = `SELECT Name, _id  FROM ${table} WHERE _id = \'${_id}\'`;
    db.query(sql, (err, item) =>{
        if(err) throw err;
        res.render("comments/new", {item});
    });
});

router.post("/", (req, res)=>{
    var _id = req.params.id;
    var table, fid, bid;
    //Check if the item is a food or a Beverage
    if(_id.length === 20){
        table = "Food";
        fid = `\'${_id}\'`;
        bid = "null";
    } else if(_id.length === 25){
        table = "Beverages";
        fid = "null";
        bid = `\'${_id}\'`;
    }
    //save the comment
    db.query(`SELECT * FROM ${table} WHERE _id = \'${_id}\'`, (err, item) =>{
        if(err) res.redirect("/items");

        let user = req.cookies.userid,
            comment = req.body.text,
            sql = `INSERT INTO Comments VALUES (\'${user}\', ${fid}, ${bid}, \'${comment}\', \'1999-07-19\')`;
        db.query(sql, (err, result) =>{
            if(err) throw err;
            res.redirect("/items/" + _id );
        });
    });
});

module.exports = router;
