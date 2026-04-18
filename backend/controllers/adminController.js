const db = require('../config/db');
const bcrypt = require('bcrypt');

exports.addEmployee = async (req, res) => {
    const { name, email, password, address, role, shiftId, joiningDate } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const jDate = joiningDate || new Date().toISOString().split('T')[0];
        db.run(`INSERT INTO Employees (Name, Email, Password, Address, Role, ShiftID, JoiningDate) VALUES (?, ?, ?, ?, ?, ?, ?)`, 
            [name, email, hashedPassword, address, role, shiftId, jDate],
            function(err) {
                if (err) return res.status(500).json({ message: err.message });
                res.status(201).json({ message: 'Employee added successfully', id: this.lastID });
            });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateEmployee = (req, res) => {
    const { id } = req.params;
    const { name, address, role, shiftId } = req.body;
    db.run(`UPDATE Employees SET Name = ?, Address = ?, Role = ?, ShiftID = ? WHERE ID = ?`,
        [name, address, role, shiftId, id], function(err) {
            if (err) return res.status(500).json({ message: err.message });
            res.json({ message: 'Employee updated successfully' });
        });
};

exports.deleteEmployee = (req, res) => {
    const { id } = req.params;
    const leavingDate = new Date().toISOString().split('T')[0];
    db.run(`UPDATE Employees SET IsActive = 0, LeavingDate = ? WHERE ID = ?`, [leavingDate, id], function(err) {
        if (err) return res.status(500).json({ message: err.message });
        res.json({ message: 'Employee archived successfully. History retained.' });
    });
};

exports.assignShift = (req, res) => {
    const { employeeId, shiftId } = req.body;
    db.run(`UPDATE Employees SET ShiftID = ? WHERE ID = ?`, [shiftId, employeeId], function(err) {
        if (err) return res.status(500).json({ message: err.message });
        res.json({ message: 'Shift assigned successfully' });
    });
};

exports.assignSchedule = (req, res) => {
    const { employeeId, workDate, taskDescription, shiftId } = req.body;
    db.run(`INSERT INTO Schedule (EmployeeID, WorkDate, TaskDescription, ShiftID) VALUES (?, ?, ?, ?)`,
        [employeeId, workDate, taskDescription, shiftId], function(err) {
            if (err) return res.status(500).json({ message: err.message });
            res.json({ message: 'Schedule assigned successfully' });
        });
};

exports.getReports = (req, res) => {
    db.all(`SELECT e.ID, e.Name, e.JoiningDate, e.LeavingDate, s.ShiftName FROM Employees e LEFT JOIN Shifts s ON e.ShiftID = s.ShiftID WHERE e.Role != 'Admin'`, [], (err, employees) => {
        if (err) return res.status(500).json({ message: err.message });

        db.all(`SELECT a.*, e.Name as EmployeeName FROM Attendance a JOIN Employees e ON a.EmployeeID = e.ID WHERE e.Role != 'Admin' ORDER BY a.Date DESC`, [], (err, rows) => {
            if (err) return res.status(500).json({ message: err.message });

            db.all(`SELECT WorkDate, EmployeeID, s.ShiftName FROM Schedule sc JOIN Shifts s ON sc.ShiftID = s.ShiftID`, [], (err, schedRows) => {
                const schedMap = {};
                if (schedRows) schedRows.forEach(row => schedMap[row.WorkDate + "_" + row.EmployeeID] = row.ShiftName);
                
                const today = new Date();
                const todayStr = today.toISOString().split('T')[0];
                const currentHHMM = new Date().toTimeString().split(' ')[0].substring(0, 5);
                const attendanceMap = {};
                
                rows.forEach(r => attendanceMap[`${r.Date}_${r.EmployeeID}`] = r);
                const finalRecords = [...rows]; 
                
                employees.forEach(emp => {
                    const start = new Date(emp.JoiningDate || '2026-04-01');
                    
                    let loopStart = new Date(today);
                    if (emp.LeavingDate) {
                        const leaveDate = new Date(emp.LeavingDate);
                        if (leaveDate < loopStart) {
                            loopStart = leaveDate;
                        }
                    }

                    for (let d = new Date(loopStart); d >= start; d.setDate(d.getDate() - 1)) {
                        const dStr = d.toISOString().split('T')[0];
                        if (!attendanceMap[`${dStr}_${emp.ID}`]) {
                            
                            let isAbsent = true;
                            let targetShift = schedMap[dStr + "_" + emp.ID] || emp.ShiftName;
                            if (dStr === todayStr) {
                                if (targetShift === 'Day' && currentHHMM <= '10:00') isAbsent = false;
                                if (targetShift === 'Night' && currentHHMM <= '18:30') isAbsent = false;
                            }

                            if (isAbsent) {
                                finalRecords.push({
                                    ID: `absent-${dStr}-${emp.ID}`,
                                    EmployeeID: emp.ID,
                                    EmployeeName: emp.Name,
                                    Date: dStr,
                                    CheckIn: '-',
                                    CheckOut: '-',
                                    WorkingHours: '-',
                                    Status: 'Absent'
                                });
                            }
                        }
                    }
                });

                finalRecords.sort((a, b) => new Date(b.Date) - new Date(a.Date));
                res.json(finalRecords);
            });
        });
    });
};

exports.getAllEmployees = (req, res) => {
    // Only fetch globally active employees for the primary lists natively excluding archived
    db.all("SELECT ID, Name, Email, Address, Role, ShiftID FROM Employees WHERE Role != 'Admin' AND (IsActive = 1 OR IsActive IS NULL)", [], (err, employees) => {
       if (err) return res.status(500).json({ message: err.message });
       
       const todayStr = new Date().toISOString().split('T')[0];
       db.all(`SELECT EmployeeID, ShiftID FROM Schedule WHERE WorkDate = ?`, [todayStr], (err, schedules) => {
           const map = {};
           if (schedules) schedules.forEach(s => map[s.EmployeeID] = s.ShiftID);
           
           employees.forEach(emp => {
               if (map[emp.ID]) emp.ShiftID = map[emp.ID];
           });
           res.json(employees); 
       });
    });
};

exports.getShifts = (req, res) => {
    db.all('SELECT * FROM Shifts', [], (err, rows) => {
       if (err) return res.status(500).json({ message: err.message });
       res.json(rows); 
    });
};

exports.getAllLeaves = (req, res) => {
    db.all(`SELECT l.*, e.Name as EmployeeName FROM LeaveRequests l JOIN Employees e ON l.EmployeeID = e.ID ORDER BY l.LeaveID DESC`, [], (err, rows) => {
        if (err) return res.status(500).json({ message: err.message });
        res.json(rows);
    });
};

exports.updateLeaveStatus = (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    db.run(`UPDATE LeaveRequests SET Status = ? WHERE LeaveID = ?`, [status, id], function(err) {
        if (err) return res.status(500).json({ message: err.message });
        res.json({ message: 'Leave request ' + status + ' successfully' });
    });
};
