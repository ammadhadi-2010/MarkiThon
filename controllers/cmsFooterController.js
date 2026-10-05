const { readCms, updateCms } = require('../utils/adminCms');

exports.getFooter = (req, res) => {
    try {
        res.status(200).json({ footer: readCms().footer });
    } catch (error) {
        res.status(500).json({ message: 'Could not load the footer.' });
    }
};

exports.saveFooter = (req, res) => {
    try {
        const body = req.body || {};
        const footer = body.footer && typeof body.footer === 'object' ? body.footer : body;
        const saved = updateCms({ footer, note: 'Footer links updated.' });
        res.status(200).json({ message: 'Footer links updated.', footer: saved.footer });
    } catch (error) {
        res.status(500).json({ message: 'Could not save the footer.' });
    }
};
