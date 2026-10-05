const { Op } = require('sequelize');

function parseDay(value, endOfDay) {
    if (!value) return null;
    const text = String(value).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
        const [year, month, day] = text.split('-').map(Number);
        if (endOfDay) return new Date(year, month - 1, day, 23, 59, 59, 999);
        return new Date(year, month - 1, day, 0, 0, 0, 0);
    }
    const date = new Date(text);
    if (endOfDay) date.setHours(23, 59, 59, 999);
    return date;
}

function parseRange(query) {
    const q = query || {};
    const fromRaw = q.from || q.startDate;
    const toRaw = q.to || q.endDate;
    const from = parseDay(fromRaw, false)
        || new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const to = parseDay(toRaw, true) || new Date();
    if (!toRaw) to.setHours(23, 59, 59, 999);
    return { from, to };
}

function createdBetween(from, to) {
    return { createdAt: { [Op.between]: [from, to] } };
}

function datedBetween(from, to) {
    return { date: { [Op.between]: [from, to] } };
}

module.exports = { parseRange, createdBetween, datedBetween };
