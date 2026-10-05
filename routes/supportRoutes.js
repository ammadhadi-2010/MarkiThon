const express = require('express');
const { report } = require('../controllers/supportReportController');

const router = express.Router();
router.post('/report', report);

module.exports = router;
