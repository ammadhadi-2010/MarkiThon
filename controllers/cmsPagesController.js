const { readCms, updateCms } = require('../utils/adminCms');
const { pagePatch } = require('../utils/cmsPages');

exports.getPages = (req, res) => {
    try {
        res.status(200).json({ pages: readCms().pages });
    } catch (error) {
        res.status(500).json({ message: 'Could not load page content.' });
    }
};

exports.savePage = (req, res) => {
    try {
        const saved = updateCms({ pages: pagePatch(req.body || {}), note: 'Page content updated.' });
        res.status(200).json({ message: 'Page content updated.', pages: saved.pages });
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message || 'Could not save page content.' });
    }
};
