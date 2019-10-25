const mysql = require("mysql");
const dotenv = require('dotenv');
dotenv.config();

module.exports = mysql.createConnection({
  host     : 'localhost',
  user     : process.env.DB_USERNAME,
  password : process.env.DB_PASSWORD,
  database : 'MyRestaurant'
});
