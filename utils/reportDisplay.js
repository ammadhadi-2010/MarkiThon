const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function pad2(value) {
    return String(value).padStart(2, '0');
}

function formatRs(value) {
    return `Rs. ${Number(value || 0).toLocaleString('en-PK')}`;
}

function formatLocalDateTime(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    let hours = date.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}, ${pad2(hours)}:${pad2(date.getMinutes())} ${ampm}`;
}

function formatLocalDate(value) {
    if (value == null || value === '') return '-';
    const text = value instanceof Date ? value.toISOString() : String(value);
    const match = text.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
        return `${Number(match[3])} ${MONTHS[Number(match[2]) - 1]} ${match[1]}`;
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

module.exports = { formatRs, formatLocalDateTime, formatLocalDate };
