const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_local';

exports.register = async (req, res) => {
    const { name, email, password, address, role, shiftId } = req.body;

    if (!name || !email || !password || !role) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const joiningDate = new Date().toISOString().split('T')[0];
        
        db.run(`INSERT INTO Employees (Name, Email, Password, Address, Role, ShiftID, JoiningDate) VALUES (?, ?, ?, ?, ?, ?, ?)`, 
            [name, email, hashedPassword, address, role, shiftId || 1, joiningDate],
            function(err) {
                if (err) {
                    if (err.message.includes('UNIQUE')) {
                        return res.status(400).json({ message: 'Email already exists' });
                    }
                    return res.status(500).json({ message: 'Database error', error: err.message });
                }
                res.status(201).json({ message: 'User registered successfully', userId: this.lastID });
            });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.login = (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password required' });
    }

    db.get(`SELECT * FROM Employees WHERE Email = ?`, [email], async (err, user) => {
        if (err) {
            return res.status(500).json({ message: 'Database error', error: err.message });
        }
        if (!user || user.IsActive === 0) {
            return res.status(401).json({ message: 'Invalid credentials or account revoked' });
        }

        const isMatch = await bcrypt.compare(password, user.Password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.ID, role: user.Role }, JWT_SECRET, { expiresIn: '24h' });

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.ID,
                name: user.Name,
                email: user.Email,
                role: user.Role
            }
        });
    });
};

exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email required' });

    db.get(`SELECT * FROM Employees WHERE Email = ?`, [email], (err, user) => {
        if (err || !user || user.IsActive === 0) return res.status(404).json({ message: 'User not found or account revoked' });
        
        // Mock success so frontend can redirect sequentially
        res.json({ message: 'Email validated. Redirecting to reset page...', email: user.Email });
    });
};

exports.resetPassword = async (req, res) => {
    console.log("ResetPassword Payload received: ", req.body);
    // Explicitly fallback to mapping token as email if the browser hasn't refreshed Vite HMR yet
    const email = req.body.email || req.body.token; 
    const { newPassword } = req.body;

    if (!email || !newPassword) return res.status(400).json({ message: 'Missing fields' });

    db.get(`SELECT * FROM Employees WHERE Email = ?`, [email], async (err, user) => {
        if (err || !user) return res.status(404).json({ message: 'User not found' });

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        db.run(`UPDATE Employees SET Password = ?, ResetToken = NULL, ResetTokenExpiry = NULL WHERE ID = ?`, [hashedPassword, user.ID], (err) => {
            if (err) return res.status(500).json({ message: 'Failed to reset password' });
            res.json({ message: 'Password has been safely reset! You can now log in.' });
        });
    });
};
