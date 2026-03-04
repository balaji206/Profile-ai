const sqlite3 = require('sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'kalviumlabs_forge.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('Inspecting table: students');
db.all("PRAGMA table_info(students)", (err, rows) => {
    if (err) {
        console.error(err);
        return;
    }
    console.log('Columns in students table:');
    rows.forEach(row => {
        console.log(`- ${row.name} (${row.type})`);
    });

    db.get("SELECT profile_image FROM students WHERE profile_image IS NOT NULL LIMIT 1", (err, row) => {
        if (err) {
            console.error('Error fetching image:', err);
        } else if (row) {
            console.log('Found an entry with profile_image. Length:', row.profile_image.length);
        } else {
            console.log('No profile_image data found in any records.');
        }
        db.close();
    });
});
