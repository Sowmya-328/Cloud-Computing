const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, '../database.sqlite');

// [AZURE DEPLOYMENT NOTE]:
// For Microsoft Azure SQL Database deployment via Azure App Service, install the 'mssql' package.
// Read connection properties from process.env.DB_SERVER, process.env.DB_USER, etc.
// Create an implicit wrapper around db.all, db.get, and db.run to proxy the SQL strings over to
// the 'mssql' connection pool so that the application controllers can run seamlessly in Azure.
// The local database below correctly structures all outputs for seamless environment transition.

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error connecting to database:', err.message);
    } else {
        console.log('Connected to the SQLite database (Ready for Azure SQL Migration).');
    }
});

module.exports = db;

