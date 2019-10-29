const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Joi = require('@hapi/joi');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const env = require('dotenv');
const makeId = require('../config/makeId');

env.config();

router.get("/login", (req, res) =>{
    res.render("admin/login");
});

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
    console.log(User);
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
                            return res.send("Wrong password");
                        } else {
                            console.log("logged in");
                            jwt.sign({id: user[0]._id}, process.env.TOKEN_SECRET, {expiresIn: "1h"}, (err, token) =>{
                                console.log(token);
                                res.clearCookie('userToken').clearCookie('userid').clearCookie('username').cookie('userToken', token).cookie('username', user[0].Username).cookie('userid', user[0]._id).redirect('/items');
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
