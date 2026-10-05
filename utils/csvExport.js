function csvEscape(value) {
    const text = String(value ?? '');
    if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
    return text;
}

function toCsv(rows) {
    if (!rows.length) return 'message\nNo records';
    const headers = Object.keys(rows[0]);
    const lines = [headers.join(',')];
    rows.forEach((row) => {
        lines.push(headers.map((key) => csvEscape(row[key])).join(','));
    });
    return lines.join('\n');
}

function sendCsv(res, filename, rows) {
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(200).send(toCsv(rows));
}

module.exports = { toCsv, sendCsv };
