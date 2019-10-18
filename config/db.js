const mysql = require("mysql");

module.exports = mysql.createConnection({
  host     : 'localhost',
  user     : 'menu',
  password : 'menu',
  database : 'MyRestaurant'
});
