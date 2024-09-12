const mysql = require("mysql");
const conn = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
});

const reraConn = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.RERA_DB_NAME,
});
//connect to database
conn.connect((err) => {
  if (err) throw err;
  console.log("real_estate db Connected with the application...");
});

reraConn.connect((err) => {
  if (err) {
    throw err;
  }
  console.log("reraDb connected  with the application...");
});
module.exports = { conn, reraConn };
