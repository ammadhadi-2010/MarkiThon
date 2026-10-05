const express = require('express');
const router = express.Router();
const salesReport = require('../controllers/salesReportController');
const report = require('../controllers/reportController');

router.get('/', report.sales);
router.get('/summary', salesReport.summary);
router.get('/by-category', salesReport.byCategory);
router.get('/top-selling', salesReport.topSelling);
router.get('/overview', salesReport.overview);
router.get('/recent-downloads', salesReport.recentDownloads);
router.post('/recent-downloads', salesReport.logDownload);

module.exports = router;
