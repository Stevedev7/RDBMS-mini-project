const jwt = require('jsonwebtoken');
const env =require('dotenv');


env.config();

module.exports = (req, res, next) =>{
    const token = req.header('auth-token');
    if(!token) return res.status(401).redirect('/login');
    try {
        const verified = jwt.verify(token, process.env.TOKEN_SECRET);
        req.id = verified;
        console.log(req.id.id);
        res.send('loggedin');
        next();
    } catch (e) {
        res.redirect('/login');
    }
}
