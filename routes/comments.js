const express = require('express');
const db = require('../config/db');
const makeId = require('../config/makeId');
const router = express.Router({mergeParams: true});


router.get("/new", (req, res) =>{
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
        db.query(sql, (err, result) =>{
            if(err) throw err;
            res.redirect("/items/" + _id );
        });
    });
});

module.exports = router;
