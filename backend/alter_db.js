const sqlite3 = require('sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../kalviumlabs_forge.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Failed to connect:', err);
        process.exit(1);
    }
});

db.run("ALTER TABLE students ADD COLUMN profile_image TEXT", (err) => {
    if (err) {
        if (err.message.includes("duplicate column name")) {
            console.log("Column profile_image already exists.");
        } else {
            console.error("Error altering table:", err.message);
        }
    } else {
        console.log("Successfully added profile_image column.");
    }
    db.close();
});
