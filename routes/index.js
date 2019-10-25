const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Joi = require('@hapi/joi');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const env = require('dotenv');
const makeId = require('../config/makeId');

env.config();
router.get("/", (req, res)=> {
    res.render("landing");
});

router.get("/register", (req, res) =>{
    res.render("register")
});

router.post("/register", async (req, res) =>{
    const User = {
        firstName : req.body.firstName,
        lastName : req.body.lastName,
        username : req.body.username,
        password : req.body.password,
        repeatPassword: req.body.repeatPassword
    }
    const schema = Joi.object({
        firstName: Joi.string().min(3).max(30).required(),
        lastName: Joi.string().min(3).max(30).required(),
        username: Joi.string().alphanum().min(6).max(20).required(),
        password: Joi.string().pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/),
        repeatPassword: Joi.ref('password')

    }).with('password', 'repeatPassword');

    const {error, value} = await schema.validate(User);

    if (!error) {
        db.query(`SELECT * FROM Users WHERE UserName = \'${User.username}\'`, (err, user) =>{
            if(err){
                console.log(err);
            } else {
                if (user.length !== 0) {
                    res.send("User already exists");
                } else {
                    bcrypt.genSalt(10, (err, salt)=>{
                        bcrypt.hash(User.password, salt, (err, hash) =>{
                            let sql = `INSERT INTO USERS VALUES (\'${makeId(30)}\',\'${User.firstName}\',\'${User.lastName}\',\'${User.username}\', \'${hash}\')`;
                            db.query(sql, (err, result) => {
                                if(err){
                                    console.log(err);
                                    res.sendStatus(400).send(err);
                                    return;
                                }
                                console.log("User added");
                                res.redirect('/login');
                            });
                        });
                    });
                }
            }
        })
    } else {
        res.send(error);
    }


});

router.get("/login", (req, res) =>{
    res.render("login");
});

router.post("/login", async (req, res) =>{
    const User = {
        username: req.body.username,
        password: req.body.password
    }
    const schema = Joi.object({
        username: Joi.string().alphanum().min(6).max(20).required(),
        password: Joi.string().pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/)

    }).with('username', 'password');

    const {error, value} = await schema.validate(User);
    if(!error){
        db.query(`SELECT * FROM Users WHERE UserName = \'${User.username}\'`, (err, user) =>{
            if(err){
                console.log(err);
            } else {
                if(user.length !== 0){
                    bcrypt.compare(User.password, user[0].password, (err, check)=> {
                        if (!check) {
                            return res.send("Wrong password");
                        } else {
                            jwt.sign({id: user[0]._id}, process.env.TOKEN_SECRET, {expiresIn: "1h"}, (err, token) =>{
                                console.log(token);
                                res.header("auth-token", token);
                                res.redirect('/items');
                            });
                        }
                    });
                } else if(user.length === 0){
                    res.redirect("/register");
                }
            }
        });
    } else if (error) {
        res.redirect('/login');
    }
})

// router.get("/logout", (req, res) =>{
//     //res.header('auth-token', null).redirect("/");
// })

module.exports = router;
