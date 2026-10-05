const OS_ORD_PAGE = 10;
const OS_ORD_STATUSES = ['New', 'Confirmed', 'Processing', 'Dispatched', 'Completed', 'Cancelled'];

let osOrders = [];
let osOrdTab = 'All';
let osOrdQuery = '';
let osOrdRange = 'all';
let osOrdPage = 1;
let osOrdOpenId = '';

function osOrdInitials(name) {
    const parts = String(name || 'C').trim().split(/\s+/);
    const first = parts[0] ? parts[0][0] : 'C';
    const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (first + last).toUpperCase();
}

function osOrdWhen(iso) {
    const date = iso ? new Date(iso) : null;
    if (!date || Number.isNaN(date.getTime())) return { day: '—', time: '' };
    const day = date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
    const time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    return { day, time };
}

function osOrdInRange(row) {
    if (osOrdRange === 'all') return true;
    const at = row.createdAt ? new Date(row.createdAt).getTime() : 0;
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    if (osOrdRange === 'today') return at >= start;
    if (osOrdRange === '7d') return at >= start - 6 * 86400000;
    if (osOrdRange === 'month') {
        return at >= new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    }
    return true;
}

function osOrdMatch(row) {
    const q = osOrdQuery.trim().toLowerCase();
    if (osOrdTab !== 'All' && row.status !== osOrdTab) return false;
    if (!osOrdInRange(row)) return false;
    if (!q) return true;
    return [row.orderNumber, row.customerName, row.customerPhone]
        .join(' ').toLowerCase().includes(q);
}

function osOrdFiltered() {
    return osOrders.filter(osOrdMatch);
}

function osOrdCounts() {
    const counts = { All: osOrders.length };
    OS_ORD_STATUSES.forEach((name) => {
        counts[name] = osOrders.filter((row) => row.status === name).length;
    });
    return counts;
}

function paintOsOrdTabs() {
    const counts = osOrdCounts();
    document.querySelectorAll('#osOrdTabs .os-ord-tab').forEach((btn) => {
        const key = btn.dataset.osostatus;
        btn.classList.toggle('on', key === osOrdTab);
        const badge = btn.querySelector('[data-osocount]');
        if (badge) badge.textContent = counts[key] == null ? 0 : counts[key];
    });
}
