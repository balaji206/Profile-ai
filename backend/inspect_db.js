const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./kalviumlabs_forge.sqlite');

db.all("SELECT name, sql FROM sqlite_master WHERE type='table' AND (name='courses' OR name='applications')", (err, rows) => {
    if (err) console.error(err);
    console.log(rows);
});
