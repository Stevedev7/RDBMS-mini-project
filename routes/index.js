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
    res.render("register", {message: ""})
});

router.post("/register", async (req, res) =>{
    //user schema
    const User = {
        firstName : req.body.firstName,
        lastName : req.body.lastName,
        username : req.body.username,
        password : req.body.password,
        repeatPassword: req.body.repeatPassword
    }
    //validation schema
    if (User.username !== "admin") {
        var schema = Joi.object({
            firstName: Joi.string().min(3).max(30).required(),
            lastName: Joi.string().min(3).max(30).required(),
            username: Joi.string().alphanum().min(6).max(20).required(),
            password: Joi.string().pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/),
            repeatPassword: Joi.ref('password')
        }).with('password', 'repeatPassword');
    } else {
        var schema = Joi.object({
            firstName: Joi.string().min(3).max(30).required(),
            lastName: Joi.string().min(3).max(30).required(),
            username: Joi.string().required(),
            password: Joi.string(),
            repeatPassword: Joi.ref('password')
        }).with('password', 'repeatPassword');
    }
    //validate User

    const {error, value} = await schema.validate(User);

    if (!error) {
        db.query(`SELECT * FROM Users WHERE Username = \'${User.username}\'`, (err, user) =>{
            if(err){
                console.log(err);
            } else {
                if (user.length !== 0) {
                    return res.render("register",{message: "User already exists"});
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
                                res.render('login', {message: "Login with your newly created account"});
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
    res.render("login", {message: ""});
});

router.post("/login", async (req, res) =>{
    //user schema
    const User = {
        username: req.body.username,
        password: req.body.password
    }
    //validation schema
    const schema = Joi.object({
        username: Joi.string().alphanum().min(6).max(20).required(),
        password: Joi.string().required()

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
                            return res.render("login", {message:"Wrong password"});
                        } else {
                            jwt.sign({id: user[0]._id}, process.env.TOKEN_SECRET, {expiresIn: "1h"}, (err, token) =>{
                                res.clearCookie('userToken').clearCookie('userid').clearCookie('username').cookie('userToken', token).cookie('username', user[0].Username).cookie('userid', user[0]._id).redirect('/items');
                            });
                        }
                    });
                } else if(user.length === 0){
                    res.render("login", {message: "username doesn't exist"});
                }
            }
        });
    } else if (error) {
        res.render('login', {message: "Please enter the valid credentials"});
    }
})

router.post("/order", (req, res)=>{
    res.send(req.body.qty);
});

router.get("/logout", (req, res, next) =>{
    delete req.session.authentiated;
    res.clearCookie('userToken').clearCookie('username').clearCookie('userid').redirect('/');
});

module.exports = router;
