const EXPENSE_HEADERS = [
    ['dateLabel', 'Date'],
    ['title', 'Title / Reason'],
    ['category', 'Category'],
    ['staff', 'Staff Member'],
    ['amountLabel', 'Amount (Rs.)']
];

function paintExpenseTable(rows) {
    const head = document.getElementById('rpHead');
    const body = document.getElementById('rpBody');
    head.innerHTML = `<tr>${EXPENSE_HEADERS.map((col) => `<th>${col[1]}</th>`).join('')}</tr>`;
    if (!rows.length) {
        body.innerHTML = `<tr><td colspan="${EXPENSE_HEADERS.length}" class="empty">No records in this date range.</td></tr>`;
        return;
    }
    body.innerHTML = rows.map((row) => `<tr>${EXPENSE_HEADERS.map((col) => {
        const value = row[col[0]] != null ? row[col[0]] : '-';
        return `<td>${escapeHtml(value)}</td>`;
    }).join('')}</tr>`).join('');
}

function paintExpenseReport(data) {
    if (typeof hideSalesOverview === 'function') hideSalesOverview();
    paintExpenseTable((data && data.rows) || []);
    const summary = document.getElementById('rpSummary');
    if (!summary) return;
    summary.hidden = false;
    const moneyFn = typeof moneyRs === 'function' ? moneyRs : (n) => `Rs. ${Number(n || 0).toLocaleString()}`;
    summary.textContent = `Total expenses in range: ${moneyFn(data && data.total)}`;
}
