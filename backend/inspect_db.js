const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./kalviumlabs_forge.sqlite');

db.all("SELECT * FROM courses", (err, rows) => {
    console.log("Courses:", rows);
});

db.all("SELECT * FROM applications", (err, rows) => {
    console.log("Applications:", rows);
});
