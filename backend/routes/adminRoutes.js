const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, isAdmin } = require('../middleware/auth');

router.use(verifyToken, isAdmin);

router.post('/add-employee', adminController.addEmployee);
router.put('/update-employee/:id', adminController.updateEmployee);
router.delete('/delete-employee/:id', adminController.deleteEmployee);
router.post('/assign-shift', adminController.assignShift);
router.post('/assign-schedule', adminController.assignSchedule);
router.get('/reports', adminController.getReports);
router.get('/employees', adminController.getAllEmployees);
router.get('/shifts', adminController.getShifts);
router.get('/leaves', adminController.getAllLeaves);
router.put('/leaves/:id', adminController.updateLeaveStatus);

module.exports = router;
