const { createReport } = require('../utils/adminTickets');

exports.report = (req, res) => {
    const row = createReport(req.body || {});
    if (!row) return res.status(400).json({ message: 'Enter your name, subject, and message.' });
    res.status(201).json({ message: 'Report sent to admin.', ticket: row });
};
