

const mysql = require("mysql2");

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Shaik_Sumaya@09",
    database: "hostel_db"
});

db.connect((err) => {
    if (err) {
        console.log("Database connection failed:", err);
    } else {
        console.log("Hostel Database Connected!");
    }
});

module.exports = db;
