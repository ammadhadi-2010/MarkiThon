const express = require('express');
const router = express.Router();
const { getStep1, saveStep1, saveStep2, saveStep5, saveStep6 } = require('../controllers/onboardingController');
const staff = require('../controllers/onboardingStaffController');

router.get('/step-1', getStep1);
router.post('/step-1', saveStep1);
router.post('/step-2', saveStep2);
router.get('/step-4/staff', staff.listStaff);
router.post('/step-4/staff', staff.addStaff);
router.put('/step-4/staff/:id', staff.updateStaff);
router.delete('/step-4/staff/:id', staff.deleteStaff);
router.post('/step-4/permissions', staff.savePermissions);
router.post('/step-4/subscribe', require('../controllers/subscriptionController').subscribeStep4);
router.post('/step-5', saveStep5);
router.post('/step-6/complete', saveStep6);

module.exports = router;
