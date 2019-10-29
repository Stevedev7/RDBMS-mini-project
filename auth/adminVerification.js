const jwt = require('jsonwebtoken');
const env =require('dotenv');

env.config();

module.exports = (req, res, next) =>{
    const token = req.cookies.userToken;
    if(!token) return res.status(401).redirect('/admin/login');
    try {
        if(req.cookies.username === "admin"){
            const verified = jwt.verify(token, process.env.TOKEN_SECRET);
            req.id = verified;
            next();
        } else {
            res.redirect('/admin/login');
        }
    } catch (e) {
        res.redirect('/admin/login');
    }
}
