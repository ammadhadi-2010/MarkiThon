const express = require('express');
const router = express.Router();
const { getBill } = require('../controllers/billController');

router.get('/:id', getBill);

module.exports = router;
