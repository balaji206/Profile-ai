const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const db = new sqlite3.Database('kalviumlabs_forge.sqlite');

db.serialize(() => {
    db.all("SELECT name FROM sqlite_master WHERE type='table';", (err, tables) => {
        if (err) {
            console.error(err);
            return;
        }
        const tablePromises = tables.map(table => {
            return new Promise((resolve) => {
                db.all(`PRAGMA table_info(${table.name});`, (err, rows) => {
                    if (err) {
                        console.error(err);
                        resolve(null);
                        return;
                    }
                    resolve({ table: table.name, columns: rows });
                });
            });
        });

        Promise.all(tablePromises).then(results => {
            fs.writeFileSync('schema.json', JSON.stringify(results, null, 2));
            db.close();
        });
    });
});
