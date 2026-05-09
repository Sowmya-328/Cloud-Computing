const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

let dbPath;

// Check if running in Azure App Service environment
if (process.env.WEBSITE_SITE_NAME) {
    // In Azure, /home/site/wwwroot can be read-only (Run From Package)
    // We use /home/data which is persistent and writable across deployments
    const dataDir = '/home/data';
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
    dbPath = path.join(dataDir, 'database.sqlite');
} else {
    // Localhost environment
    dbPath = path.resolve(__dirname, '../database.sqlite');
}

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Database opening error:', err);
    } else {
        console.log(`Connected to SQLite database at ${dbPath}`);
    }
});

module.exports = db;
