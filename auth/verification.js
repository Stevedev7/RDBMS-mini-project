const jwt = require('jsonwebtoken');
const env =require('dotenv');

env.config();

module.exports = (req, res, next) =>{
    const User = {
        username : ""
    };
    const token = req.cookies.userToken;
    if(!token) {
        res.render('login', {User, message: 'Please login', error: true});
        return
    }
    try {
        const verified = jwt.verify(token, process.env.TOKEN_SECRET);
        req.id = verified;
        req.session.authenticated = true;
        next();
    } catch (e) {
        res.render('login', {User, message: "Something went wrong... Please try again", error: true});
    }
}
