const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../data/platform-applications.json');
const seed = [
    { id: 'app-alnoor', name: 'Al-Noor Fabrics', wait: '2h ago', status: 'pending' },
    { id: 'app-modern', name: 'Modern Textiles', wait: '5h ago', status: 'pending' },
    { id: 'app-fashion', name: 'Fashion Hub', wait: '1d ago', status: 'pending' }
];

function readQueue() {
    try {
        const rows = JSON.parse(fs.readFileSync(file, 'utf8'));
        return Array.isArray(rows) ? rows : seed.map((row) => ({ ...row }));
    } catch (error) {
        return seed.map((row) => ({ ...row }));
    }
}

function writeQueue(rows) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, JSON.stringify(rows, null, 2));
}

function listApplications() {
    const rows = readQueue();
    if (!fs.existsSync(file)) writeQueue(rows);
    return rows;
}

function decideApplication(id, status) {
    const rows = listApplications();
    const hit = rows.find((row) => row.id === id);
    if (!hit) return null;
    hit.status = status;
    writeQueue(rows);
    return hit;
}

module.exports = { listApplications, decideApplication };
