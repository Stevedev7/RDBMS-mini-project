const express = require('express');
const db = require('../config/db');
const makeId = require('../config/makeId');
const verify = require('../auth/verification');
const router = express.Router({mergeParams: true});

router.post("/", verify, (req, res)=>{
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
    var todaysDate = new Date();
    function convertDate(date) {
      var yyyy = date.getFullYear().toString();
      var mm = (date.getMonth()+1).toString();
      var dd  = date.getDate().toString();

      var mmChars = mm.split('');
      var ddChars = dd.split('');

      return yyyy + '-' + (mmChars[1]?mm:"0"+mmChars[0]) + '-' + (ddChars[1]?dd:"0"+ddChars[0]);
    }
    const date = convertDate(todaysDate);
    const user = req.cookies.userid;
    db.query(`Select * from Orders where UserID =\'${user}\' and ${field} = \'${_id}\'`, (err, orders) => {
        if(err) throw err;
        if(orders.length > 0){
            //save the comment
            db.query(`SELECT * FROM ${table} WHERE _id = \'${_id}\'`, (err, item) =>{
                if(err) res.redirect("/items");
                    let comment = req.body.text,
                    sql = `INSERT INTO Comments VALUES (\'${user}\', ${fid}, ${bid}, \'${comment}\', \'${date}\')`;
                db.query(sql, (err, result) =>{
                    if(err) throw err;
                    db.query(`select Users.UserName, Comments.Text from Users, Comments where  Users._id = Comments.UserID AND Comments.${field} = \'${_id}\' ORDER BY Date`, (error, comments) =>{
                            res.render("items/item", {item, comments, message: "Comment added", error: false, type: (field === 'FoodID' ? 'food' : 'bev')});
                    })
                });
            });
        } else {
            db.query(`SELECT * FROM ${table} WHERE _id = \'${_id}\'`, (err, item) =>{
                if(err) res.redirect("/items");
                db.query(`select Users.UserName, Comments.Text from Users, Comments where  Users._id = Comments.UserID AND Comments.${field} = \'${_id}\' ORDER BY Date`, (error, comments) =>{
                        res.render("items/item", {item, comments, message: "You haven't ordered this item yet", error: true, type: (field === 'FoodID' ? 'food' : 'bev')});
                });
            });
        }
    });
});

module.exports = router;
