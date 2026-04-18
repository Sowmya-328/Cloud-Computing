const db = require('../config/db');

exports.getProfile = (req, res) => {
    const userId = req.userId;
    db.get(`SELECT ID, Name, Email, Address, Role, ShiftID, JoiningDate FROM Employees WHERE ID = ?`, [userId], (err, user) => {
        if (err) return res.status(500).json({ message: err.message });
        if (!user) return res.status(404).json({ message: 'User not found' });
        
        const todayStr = new Date().toISOString().split('T')[0];
        db.get(`SELECT ShiftID FROM Schedule WHERE EmployeeID = ? AND WorkDate = ?`, [userId, todayStr], (err, sched) => {
            if (sched && sched.ShiftID) {
                user.ShiftID = sched.ShiftID;
            }
            res.json(user);
        });
    });
};

exports.getAttendance = (req, res) => {
    const userId = req.userId;

    // Fetch employee joining date and shift
    db.get(`SELECT e.JoiningDate, s.ShiftName FROM Employees e LEFT JOIN Shifts s ON e.ShiftID = s.ShiftID WHERE e.ID = ?`, [userId], (err, user) => {
        if (err || !user) return res.status(500).json({ message: 'Error fetching profile' });

        const joiningDateStr = user.JoiningDate || '2026-04-01'; // Fallback

        db.all(`SELECT WorkDate, s.ShiftName FROM Schedule sc JOIN Shifts s ON sc.ShiftID = s.ShiftID WHERE sc.EmployeeID = ?`, [userId], (err, schedRows) => {
            const schedMap = {};
            if (schedRows) schedRows.forEach(row => schedMap[row.WorkDate] = row.ShiftName);

            db.all(`SELECT * FROM Attendance WHERE EmployeeID = ? ORDER BY Date DESC`, [userId], (err, rows) => {
                if (err) return res.status(500).json({ message: err.message });
                
                // Build the date array from Joining Date to Today
                const today = new Date();
                const start = new Date(joiningDateStr);
                const attendanceMap = {};
                rows.forEach(r => attendanceMap[r.Date] = r);

                const todayStr = today.toISOString().split('T')[0];
                const currentHHMM = new Date().toTimeString().split(' ')[0].substring(0, 5);
                
                const finalRecords = [];
                for (let d = new Date(today); d >= start; d.setDate(d.getDate() - 1)) {
                    const dStr = d.toISOString().split('T')[0];
                    if (attendanceMap[dStr]) {
                        finalRecords.push(attendanceMap[dStr]);
                    } else {
                        let isAbsent = true;
                        let targetShift = schedMap[dStr] || user.ShiftName;
                        // Avoid false marking if today and not yet reached cutoff time
                        if (dStr === todayStr) {
                            if (targetShift === 'Day' && currentHHMM <= '10:00') isAbsent = false;
                            if (targetShift === 'Night' && currentHHMM <= '18:30') isAbsent = false;
                        }

                        if (isAbsent) {
                            finalRecords.push({ ID: 'absent-'+dStr, Date: dStr, CheckIn: '-', CheckOut: '-', WorkingHours: '-', Status: 'Absent' });
                        }
                    }
                }
                res.json(finalRecords);
            });
        });
    });
};

exports.checkIn = (req, res) => {
    const userId = req.userId;
    const today = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toTimeString().split(' ')[0].substring(0, 5); // HH:MM

    // First check if already checked in today
    db.get(`SELECT * FROM Attendance WHERE EmployeeID = ? AND Date = ?`, [userId, today], (err, record) => {
        if (err) return res.status(500).json({ message: err.message });
        if (record) return res.status(400).json({ message: 'Already checked in today' });

        // Get Shift info to determine status
        db.get(`SELECT s.ShiftName FROM Employees e JOIN Shifts s ON e.ShiftID = s.ShiftID WHERE e.ID = ?`, [userId], (err, shift) => {
            if (err) return res.status(500).json({ message: err.message });
            
            db.get(`SELECT s.ShiftName FROM Schedule sc JOIN Shifts s ON sc.ShiftID = s.ShiftID WHERE sc.EmployeeID = ? AND sc.WorkDate = ?`, [userId, today], (err, sched) => {
                let targetShift = shift ? shift.ShiftName : 'Day';
                if (sched && sched.ShiftName) targetShift = sched.ShiftName;
                
                let status = 'Present';
                if (targetShift === 'Day') {
                    if (currentTime <= '09:15') status = 'Present';
                    else if (currentTime > '09:15' && currentTime <= '10:00') status = 'Late';
                    else status = 'Absent';
                } else if (targetShift === 'Night') {
                    if (currentTime <= '18:30') status = 'Present';
                    else status = 'Absent';
                }

                db.run(`INSERT INTO Attendance (EmployeeID, Date, CheckIn, Status) VALUES (?, ?, ?, ?)`, 
                    [userId, today, currentTime, status], function(err) {
                        if (err) return res.status(500).json({ message: err.message });
                        res.json({ message: 'Checked in successfully', status, time: currentTime });
                    });
            });
        });
    });
};

exports.checkOut = (req, res) => {
    const userId = req.userId;
    const today = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toTimeString().split(' ')[0].substring(0, 5); // HH:MM

    db.get(`SELECT * FROM Attendance WHERE EmployeeID = ? AND Date = ?`, [userId, today], (err, record) => {
        if (err) return res.status(500).json({ message: err.message });
        if (!record) return res.status(400).json({ message: 'No check-in found for today' });
        if (record.CheckOut) return res.status(400).json({ message: 'Already checked out today' });

        // Calculate working hours
        const checkInTime = new Date(`1970-01-01T${record.CheckIn}:00Z`);
        const checkOutTime = new Date(`1970-01-01T${currentTime}:00Z`);
        
        let diffMs = checkOutTime - checkInTime;
        if (diffMs < 0) diffMs += 24 * 60 * 60 * 1000; // handle overnight shifts
        const workingHours = (diffMs / (1000 * 60 * 60)).toFixed(2);

        db.run(`UPDATE Attendance SET CheckOut = ?, WorkingHours = ? WHERE ID = ?`, 
            [currentTime, workingHours, record.ID], function(err) {
                if (err) return res.status(500).json({ message: err.message });
                res.json({ message: 'Checked out successfully', time: currentTime, workingHours });
            });
    });
};

exports.getSchedule = (req, res) => {
    const userId = req.userId;
    db.all(`SELECT * FROM Schedule WHERE EmployeeID = ? ORDER BY WorkDate DESC`, [userId], (err, rows) => {
        if (err) return res.status(500).json({ message: err.message });
        res.json(rows);
    });
};

exports.applyLeave = (req, res) => {
    const userId = req.userId;
    const { subject, description, fromDate, toDate } = req.body;

    db.run(`INSERT INTO LeaveRequests (EmployeeID, Subject, Description, FromDate, ToDate) VALUES (?, ?, ?, ?, ?)`,
        [userId, subject, description, fromDate, toDate], function(err) {
            if (err) return res.status(500).json({ message: err.message });
            res.status(201).json({ message: 'Leave request submitted successfully', leaveId: this.lastID });
        });
};

exports.getMyLeaves = (req, res) => {
    const userId = req.userId;
    db.all(`SELECT * FROM LeaveRequests WHERE EmployeeID = ? ORDER BY LeaveID DESC`, [userId], (err, rows) => {
        if (err) return res.status(500).json({ message: err.message });
        res.json(rows);
    });
};
