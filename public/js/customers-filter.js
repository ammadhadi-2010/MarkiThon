let custRows = [];
let custStats = { totalCustomers: 0, totalPurchases: 0, avgOrderValue: 0, activeCustomers: 0 };
let custAreas = [];
let custQuery = '';
let custKind = 'all';
let custArea = 'all';
let custRange = '30d';
let custPage = 1;
const CUST_PAGE = 10;

function custRs(n) {
    return 'Rs. ' + Number(n || 0).toLocaleString();
}

function custDay(value) {
    const date = value ? new Date(value) : null;
    if (!date || Number.isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function custInitials(name) {
    return String(name || 'C').split(/\s+/).filter(Boolean).slice(0, 2)
        .map((p) => p[0]).join('').toUpperCase();
}

function custInRange(row) {
    if (custRange === 'all') return true;
    if (!row.lastOrderAt) return false;
    const at = new Date(row.lastOrderAt).getTime();
    if (Number.isNaN(at)) return false;
    const now = Date.now();
    if (custRange === '7d') return at >= now - 7 * 86400000;
    if (custRange === '30d') return at >= now - 30 * 86400000;
    if (custRange === 'month') {
        const d = new Date(row.lastOrderAt);
        const n = new Date();
        return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear();
    }
    return true;
}

function custFiltered() {
    const q = custQuery.trim().toLowerCase();
    return custRows.filter((row) => {
        if (custKind === 'vip' && !row.vip) return false;
        if (custKind === 'active' && row.status !== 'Active') return false;
        if (custKind === 'inactive' && row.status !== 'Inactive') return false;
        if (custArea !== 'all' && row.area !== custArea) return false;
        if (!custInRange(row)) return false;
        if (!q) return true;
        const blob = [row.name, row.phone, row.whatsapp, row.address, row.area].join(' ').toLowerCase();
        return blob.includes(q);
    });
}

function paintCustAreas() {
    const sel = document.getElementById('custArea');
    if (!sel) return;
    const cur = custArea;
    sel.innerHTML = '<option value="all">All Areas</option>' +
        custAreas.map((a) => `<option value="${escapeHtml(a)}">${escapeHtml(a)}</option>`).join('');
    sel.value = custAreas.includes(cur) ? cur : 'all';
    custArea = sel.value;
}

function paintCustStats() {
    const set = (id, text) => {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    };
    set('custStatTotal', String(custStats.totalCustomers || 0));
    set('custStatBuy', custRs(custStats.totalPurchases));
    set('custStatAov', custRs(custStats.avgOrderValue));
    set('custStatActive', String(custStats.activeCustomers || 0));
}
