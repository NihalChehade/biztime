/** Database setup for BizTime. */
const { Client } = require("pg");

let DB_URI;

if (process.env.NODE_ENV === "test") {
  DB_URI = "postgresql://nihal:nihalchehade@127.0.0.1:5432/biztime_test" ;
} else {
  DB_URI = "postgresql://nihal:nihalchehade@127.0.0.1:5432/biztime";
}

const db = new Client({
  connectionString: DB_URI
});

db.connect(err => {
  if (err) {
    console.error('Connection error', err.stack);
  } else {
    console.log('Connected to the database');
  }
});

module.exports = db;
