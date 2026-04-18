const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_local';

exports.verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(403).json({ message: 'No token provided' });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Unauthorized!' });
        }
        req.userId = decoded.id;
        req.userRole = decoded.role;
        next();
    });
};

exports.isAdmin = (req, res, next) => {
    if (req.userRole !== 'Admin') {
        return res.status(403).json({ message: 'Require Admin Role!' });
    }
    next();
};

exports.isEmployee = (req, res, next) => {
    if (req.userRole !== 'Employee' && req.userRole !== 'Admin') {
        return res.status(403).json({ message: 'Require Employee Role!' });
    }
    next();
};
