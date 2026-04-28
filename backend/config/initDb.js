/*const db = require('./db');
const bcrypt = require('bcrypt');

const initDb = () => {
    db.serialize(() => {
        db.run(`CREATE TABLE IF NOT EXISTS Employees (
            ID INTEGER PRIMARY KEY AUTOINCREMENT,
            Name TEXT,
            Email TEXT UNIQUE,
            Password TEXT,
            Address TEXT,
            Role TEXT,
            ShiftID INTEGER
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS Shifts (
            ShiftID INTEGER PRIMARY KEY AUTOINCREMENT,
            ShiftName TEXT,
            StartTime TEXT,
            EndTime TEXT
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS Attendance (
            ID INTEGER PRIMARY KEY AUTOINCREMENT,
            EmployeeID INTEGER,
            Date TEXT,
            CheckIn TEXT,
            CheckOut TEXT,
            WorkingHours REAL,
            Status TEXT,
            FOREIGN KEY(EmployeeID) REFERENCES Employees(ID)
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS Schedule (
            ScheduleID INTEGER PRIMARY KEY AUTOINCREMENT,
            EmployeeID INTEGER,
            WorkDate TEXT,
            TaskDescription TEXT,
            ShiftID INTEGER,
            FOREIGN KEY(EmployeeID) REFERENCES Employees(ID),
            FOREIGN KEY(ShiftID) REFERENCES Shifts(ShiftID)
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS LeaveRequests (
            LeaveID INTEGER PRIMARY KEY AUTOINCREMENT,
            EmployeeID INTEGER,
            Subject TEXT,
            Description TEXT,
            FromDate TEXT,
            ToDate TEXT,
            Status TEXT DEFAULT 'Pending',
            FOREIGN KEY(EmployeeID) REFERENCES Employees(ID)
        )`);

        // Insert default shifts
        db.get("SELECT COUNT(*) as count FROM Shifts", (err, row) => {
            if (row && row.count === 0) {
                db.run(`INSERT INTO Shifts (ShiftName, StartTime, EndTime) VALUES ('Day', '09:00', '18:00')`);
                db.run(`INSERT INTO Shifts (ShiftName, StartTime, EndTime) VALUES ('Night', '18:00', '00:00')`);
                console.log("Default Shifts created.");
            } else {
                // Correct existing shift environments globally
                db.run(`UPDATE Shifts SET EndTime = '18:00' WHERE ShiftName = 'Day'`);
                db.run(`UPDATE Shifts SET EndTime = '00:00' WHERE ShiftName = 'Night'`);
            }
        });

        // Add JoiningDate and Reset Tokens if missing
        db.all("PRAGMA table_info(Employees)", (err, cols) => {
            if (cols) {
                if (!cols.some(c => c.name === 'JoiningDate')) {
                    db.run(`ALTER TABLE Employees ADD COLUMN JoiningDate TEXT DEFAULT '2026-04-01'`, (err) => {
                        if (err) console.error("Error altering Employees table:", err.message);
                        else console.log("Added JoiningDate column to Employees table.");
                    });
                } else {
                    db.run(`UPDATE Employees SET JoiningDate = '2026-04-01' WHERE JoiningDate = '${new Date().toISOString().split('T')[0]}' OR JoiningDate IS NULL`);
                }
                
                if (!cols.some(c => c.name === 'ResetToken')) {
                    db.run(`ALTER TABLE Employees ADD COLUMN ResetToken TEXT`);
                    db.run(`ALTER TABLE Employees ADD COLUMN ResetTokenExpiry INTEGER`);
                    console.log("Added Reset Token columns to Employees table.");
                }

                if (!cols.some(c => c.name === 'IsActive')) {
                    db.run(`ALTER TABLE Employees ADD COLUMN IsActive INTEGER DEFAULT 1`);
                    db.run(`ALTER TABLE Employees ADD COLUMN LeavingDate TEXT`);
                    console.log("Added Soft Delete columns to Employees table.");
                }
            }
        });

        // Insert default Admin
        db.get("SELECT COUNT(*) as count FROM Employees WHERE Role = 'Admin'", async (err, row) => {
            if (row && row.count === 0) {
                const hashedPassword = await bcrypt.hash('admin123', 10);
                db.run(`INSERT INTO Employees (Name, Email, Password, Address, Role, ShiftID) VALUES (?, ?, ?, ?, ?, ?)`, 
                    ['Super Admin', 'admin@system.com', hashedPassword, 'HQ', 'Admin', 1],
                    (err) => {
                        if (err) console.error("Error creating default admin");
                        else console.log("Default Admin created (admin@system.com / admin123).");
                    });
            }
        });
    });
};

module.exports = initDb;*/


const db = require('./db');
const bcrypt = require('bcrypt');

const initDb = () => {
    try {
        db.serialize(() => {

            // ✅ Employees Table
            db.run(`CREATE TABLE IF NOT EXISTS Employees (
                ID INTEGER PRIMARY KEY AUTOINCREMENT,
                Name TEXT,
                Email TEXT UNIQUE,
                Password TEXT,
                Address TEXT,
                Role TEXT,
                ShiftID INTEGER
            )`, (err) => {
                if (err) console.error("Employees table error:", err.message);
            });

            // ✅ Shifts Table
            db.run(`CREATE TABLE IF NOT EXISTS Shifts (
                ShiftID INTEGER PRIMARY KEY AUTOINCREMENT,
                ShiftName TEXT,
                StartTime TEXT,
                EndTime TEXT
            )`, (err) => {
                if (err) console.error("Shifts table error:", err.message);
            });

            // ✅ Attendance Table
            db.run(`CREATE TABLE IF NOT EXISTS Attendance (
                ID INTEGER PRIMARY KEY AUTOINCREMENT,
                EmployeeID INTEGER,
                Date TEXT,
                CheckIn TEXT,
                CheckOut TEXT,
                WorkingHours REAL,
                Status TEXT,
                FOREIGN KEY(EmployeeID) REFERENCES Employees(ID)
            )`, (err) => {
                if (err) console.error("Attendance table error:", err.message);
            });

            // ✅ Schedule Table
            db.run(`CREATE TABLE IF NOT EXISTS Schedule (
                ScheduleID INTEGER PRIMARY KEY AUTOINCREMENT,
                EmployeeID INTEGER,
                WorkDate TEXT,
                TaskDescription TEXT,
                ShiftID INTEGER,
                FOREIGN KEY(EmployeeID) REFERENCES Employees(ID),
                FOREIGN KEY(ShiftID) REFERENCES Shifts(ShiftID)
            )`, (err) => {
                if (err) console.error("Schedule table error:", err.message);
            });

            // ✅ Leave Requests Table
            db.run(`CREATE TABLE IF NOT EXISTS LeaveRequests (
                LeaveID INTEGER PRIMARY KEY AUTOINCREMENT,
                EmployeeID INTEGER,
                Subject TEXT,
                Description TEXT,
                FromDate TEXT,
                ToDate TEXT,
                Status TEXT DEFAULT 'Pending',
                FOREIGN KEY(EmployeeID) REFERENCES Employees(ID)
            )`, (err) => {
                if (err) console.error("LeaveRequests table error:", err.message);
            });

            // ✅ Insert default shifts
            db.get("SELECT COUNT(*) as count FROM Shifts", (err, row) => {
                if (err) {
                    console.error("Shift count error:", err.message);
                    return;
                }

                if (row && row.count === 0) {
                    db.run(`INSERT INTO Shifts (ShiftName, StartTime, EndTime) VALUES ('Day', '09:00', '18:00')`);
                    db.run(`INSERT INTO Shifts (ShiftName, StartTime, EndTime) VALUES ('Night', '18:00', '00:00')`);
                    console.log("Default Shifts created.");
                } else {
                    db.run(`UPDATE Shifts SET EndTime = '18:00' WHERE ShiftName = 'Day'`);
                    db.run(`UPDATE Shifts SET EndTime = '00:00' WHERE ShiftName = 'Night'`);
                }
            });

            // ✅ Alter Employees Table (safe checks)
            db.all("PRAGMA table_info(Employees)", (err, cols) => {
                if (err) {
                    console.error("PRAGMA error:", err.message);
                    return;
                }

                if (cols) {
                    if (!cols.some(c => c.name === 'JoiningDate')) {
                        db.run(`ALTER TABLE Employees ADD COLUMN JoiningDate TEXT DEFAULT '2026-04-01'`);
                    }

                    if (!cols.some(c => c.name === 'ResetToken')) {
                        db.run(`ALTER TABLE Employees ADD COLUMN ResetToken TEXT`);
                        db.run(`ALTER TABLE Employees ADD COLUMN ResetTokenExpiry INTEGER`);
                    }

                    if (!cols.some(c => c.name === 'IsActive')) {
                        db.run(`ALTER TABLE Employees ADD COLUMN IsActive INTEGER DEFAULT 1`);
                        db.run(`ALTER TABLE Employees ADD COLUMN LeavingDate TEXT`);
                    }
                }
            });

            // ✅ Insert default Admin (FIXED async issue)
            db.get("SELECT COUNT(*) as count FROM Employees WHERE Role = 'Admin'", (err, row) => {
                if (err) {
                    console.error("Admin check error:", err.message);
                    return;
                }

                if (row && row.count === 0) {
                    bcrypt.hash('admin123', 10)
                        .then((hashedPassword) => {
                            db.run(
                                `INSERT INTO Employees (Name, Email, Password, Address, Role, ShiftID) VALUES (?, ?, ?, ?, ?, ?)`,
                                ['Super Admin', 'admin@system.com', hashedPassword, 'HQ', 'Admin', 1],
                                (err) => {
                                    if (err) console.error("Admin insert error:", err.message);
                                    else console.log("Default Admin created.");
                                }
                            );
                        })
                        .catch(err => console.error("Hash error:", err.message));
                }
            });

        });

    } catch (err) {
        console.error("DB Initialization Failed:", err.message);
    }
};

module.exports = initDb;
