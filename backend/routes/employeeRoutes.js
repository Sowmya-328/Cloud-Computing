const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const { verifyToken, isEmployee } = require('../middleware/auth');

router.get('/profile', verifyToken, employeeController.getProfile);
router.get('/attendance', verifyToken, isEmployee, employeeController.getAttendance);
router.post('/checkin', verifyToken, isEmployee, employeeController.checkIn);
router.post('/checkout', verifyToken, isEmployee, employeeController.checkOut);
router.get('/schedule', verifyToken, isEmployee, employeeController.getSchedule);
router.post('/apply-leave', verifyToken, isEmployee, employeeController.applyLeave);
router.get('/my-leaves', verifyToken, isEmployee, employeeController.getMyLeaves);

module.exports = router;
