const mysql = require("mysql");
require('dotenv').config();

let connection = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    connectTimeout: 1000,
    connectionLimit: 4
});

connection.connect();

module.exports = connection;