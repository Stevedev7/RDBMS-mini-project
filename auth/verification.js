const jwt = require('jsonwebtoken');
const env =require('dotenv');

env.config();

module.exports = (req, res, next) =>{
    const token = req.cookies.userToken;
    if(!token) {
        res.render('login', {message: 'please login'});
        return
    }
    try {
        const verified = jwt.verify(token, process.env.TOKEN_SECRET);
        req.id = verified;
        req.session.authenticated = true;
        next();
    } catch (e) {
        req.flash('error', 'Please login');
        res.locals.message = req.flash();
        res.redirect('/login');
    }
}
