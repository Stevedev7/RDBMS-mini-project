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

router.get("/items", verify, (req, res) =>{
    let sql = "SELECT Name, _id, Image FROM Food UNION (SELECT Name, _id, Image FROM Beverages) ORDER BY Name";
    db.query(sql, (err, items) =>{
        if(err) throw err
        res.render("admin/items", {items});
    });
});


router.get("/items/:id", verify, (req, res) =>{
    //check if the item is food or a beverage
    if(req.params.id.length === 20){
        db.query(`SELECT * FROM Food WHERE _id = \'${req.params.id}\'`, (err, item)=>{
            if(err) throw err;
            res.render("admin/show", {item, type: "food"});
        });
    } else {
        db.query(`SELECT * FROM Beverages WHERE _id = \'${req.params.id}\'`, (err, item)=>{
            if(err) throw err;
            res.render("admin/show", {item, type: "bev"});
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
});

router.get("/items/:id/change", verify, (req, res) =>{
    if(req.params.id.length === 20){
        db.query(`SELECT * FROM Food WHERE _id = \'${req.params.id}\'`, (err, item)=>{
            if(err) throw err;
            res.render("admin/update", {item, type: "food"});
        });
    } else {
        db.query(`SELECT * FROM Beverages WHERE _id = \'${req.params.id}\'`, (err, item)=>{
            if(err) throw err;
            res.render("admin/update", {item, type: "bev"});
        });
    }
});

router.post("/items/change", verify, (req, res) =>{
    const id = req.body.type;
    if(id.length === 20){
        let name = req.body.name,
                img = req.body.image,
                description = req.body.description,
                type1 = req.body.type1,
                type2 = req.body.type2,
                price = Number(req.body.price);
            let sql = `UPDATE Food SET Name = \'${name}\', Image = \'${img}\', DietaryPreference = \'${type1}\', Category = \'${type2}\', Price = ${price}, Description = \'${description}\' WHERE _id = \'${id}\'`;
            console.log(sql);
            db.query(sql, (err, result)=>{
                if(err) throw err;
                    res.send(`${id.length}`);
                    //res.redirect(`/admin/items/${id}`);
                });

    } else {
        let name = req.body.name,
                img = req.body.image,
                description = req.body.description,
                type1 = req.body.type1,
                price = Number(req.body.price);
            let sql = `UPDATE Food SET Name = \'${name}\', Image = \'${img}\', DietaryPreference = \'${type1}\', Price = ${price}, Description = \'${description}\' WHERE _id = \'${id}\'`;
            console.log(sql);
            db.query(sql, (err, result)=>{
                if(err) throw err;
                    res.send(`${id.length}`);
                    //res.redirect(`/admin/items/${id}`);
            });

    }

    // if(id.length === 20){
    //     let name = req.body.name,
    //         img = req.body.image,
    //         description = req.body.description,
    //         type1 = req.body.type1,
    //         type2 = req.body.type2,
    //         price = Number(req.body.price);
    //     let sql = `UPDATE Food SET Name = \'${name}\', Image = \'${img}\', DietaryPreference = \'${type1}\', Category = \'${type2}\', Price = ${price}, Description = \'${description}\' WHERE _id = \'${id}\'`;
    //     res.send(sql);
    //     // db.query(sql, (err, result)=>{
    //     //     if(err) throw err;
    //     //     res.send(result);
    //     //     //res.redirect(`/admin/items/${id}`);
    //     // });
    // } if(id.length === 30){
    //     let name = req.body.name,
    //         img = req.body.image,
    //         description = req.body.description,
    //         type1 = req.body.type1,
    //         price = Number(req.body.price);
    //     let sql = `UPDATE Food SET Name = \'${name}\', Image = \'${img}\', DietaryPreference = \'${type1}\', Price = ${price}, Description = \'${description}\' WHERE _id = \'${id}\'`;
    //     res.send(sql);
    //     console.log(sql);
    //     // db.query(sql, (err, result)=>{
    //     //     if(err) throw err;
    //     //     res.send(result);
    //     //     //res.redirect(`/admin/items/${id}`);
    //     // });
    // }
});

module.exports = router;
