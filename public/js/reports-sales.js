const SALES_HEADERS = [
    ['channel', 'Channel'],
    ['referenceId', 'Reference ID'],
    ['customer', 'Customer'],
    ['totalAmountLabel', 'Total Amount'],
    ['dateTimeLabel', 'Date & Time']
];

function paintSalesOverview(data) {
    const wrap = document.getElementById('rpOverview');
    if (!wrap) return;
    wrap.hidden = false;
    const moneyFn = typeof moneyRs === 'function' ? moneyRs : (n) => `Rs. ${Number(n || 0).toLocaleString()}`;
    document.getElementById('rpRev').textContent = moneyFn(data.totalSalesRevenue);
    document.getElementById('rpExp').textContent = moneyFn(data.totalExpenses);
    const net = document.getElementById('rpNet');
    const profit = Number(data.estimatedNetProfit || 0);
    net.textContent = moneyFn(profit);
    net.classList.toggle('sup-due', profit < 0);
}

function paintSalesTable(rows) {
    const head = document.getElementById('rpHead');
    const body = document.getElementById('rpBody');
    head.innerHTML = `<tr>${SALES_HEADERS.map((col) => `<th>${col[1]}</th>`).join('')}</tr>`;
    if (!rows.length) {
        body.innerHTML = `<tr><td colspan="${SALES_HEADERS.length}" class="empty">No records in this date range.</td></tr>`;
        return;
    }
    body.innerHTML = rows.map((row) => `<tr>${SALES_HEADERS.map((col) => {
        const key = col[0];
        const value = row[key] != null ? row[key] : '-';
        return `<td>${escapeHtml(value)}</td>`;
    }).join('')}</tr>`).join('');
}

function paintSalesReport(data) {
    paintSalesOverview(data || {});
    paintSalesTable((data && data.rows) || []);
    const summary = document.getElementById('rpSummary');
    if (summary) {
        summary.hidden = true;
        summary.textContent = '';
    }
}

function hideSalesOverview() {
    const wrap = document.getElementById('rpOverview');
    if (wrap) wrap.hidden = true;
}
