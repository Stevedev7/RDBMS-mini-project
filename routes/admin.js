const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Joi = require('@hapi/joi');
const jwt = require('jsonwebtoken');
const env = require('dotenv');

//Middlewares
const db = require('../config/db');
const verify = require('../auth/adminVerification');
const makeId = require('../config/makeId');

env.config();

router.get("/login", (req, res) =>{
    res.render("admin/login");
});

//Admin page

router.get("/", verify, (req, res) =>{
    res.render("admin/home");
});

router.get("/items", (req, res) =>{
    let sql = "SELECT Name, _id, Image FROM Food UNION (SELECT Name, _id, Image FROM Beverages) ORDER BY Name";
    db.query(sql, (err, items) =>{
        if(err) throw err
        res.render("admin/items", {items});
    });
});


router.get("/items/:id", (req, res) =>{
    //check if the item is food or a beverage
    if(req.params.id.length === 20){
        db.query(`SELECT * FROM Food WHERE _id = \'${req.params.id}\'`, (err, item)=>{
            if(err) throw err;
            res.render("admin/show", {item});
        });
    } else {
        db.query(`SELECT * FROM Beverages WHERE _id = \'${req.params.id}\'`, (err, item)=>{
            if(err) throw err;
            res.render("admin/show", {item});
        });
    }
});

//admin Login

router.post("/", async (req, res) =>{
    //user schema
    const User = {
        username: req.body.username,
        password: req.body.password
    }
    //validation schema
    const schema = Joi.object({
        username: Joi.string().required(),
        password: Joi.string()

    }).with('username', 'password');
    //validate User
    const {error, value} = await schema.validate(User);

    if(!error){
        db.query(`SELECT * FROM Users WHERE Username = \'${User.username}\'`, (err, user) =>{
            if(err){
                console.log(err);
            } else {
                if(user.length !== 0){
                    bcrypt.compare(User.password, user[0].Password, (err, check)=> {
                        if (!check) {
                            return res.redirect("/admin/login");
                        } else {
                            jwt.sign({id: user[0]._id}, process.env.TOKEN_SECRET, {expiresIn: "1h"}, (err, token) =>{
                                res.clearCookie('userToken').clearCookie('userid').clearCookie('username').cookie('userToken', token).cookie('username', user[0].Username).cookie('userid', user[0]._id).redirect('/admin');
                            });
                        }
                    });
                } else if(user.length === 0){
                    res.redirect("/register");
                }
            }
        });
    } else if (error) {
        console.log(error);
        res.redirect('/login');
    }
})

module.exports = router;
