async function loadExpenses() {
    const data = await api.get('/api/expenses/list');
    const rows = data.rows || [];
    document.getElementById('exTable').innerHTML = rows.map((row) => `
        <tr>
            <td>${new Date(row.spentOn).toLocaleDateString('en-GB')}</td>
            <td>${escapeHtml(row.title)}</td>
            <td>${escapeHtml(row.category)}</td>
            <td>${escapeHtml(row.staffName || '-')}</td>
            <td>Rs. ${Number(row.amount).toLocaleString()}</td>
        </tr>`).join('') || '<tr><td colspan="5" class="empty">No expenses in this period.</td></tr>';
    document.getElementById('exTotal').textContent = Number(data.total || 0).toLocaleString();
    if (typeof loadExStaffLedger === 'function') await loadExStaffLedger();
}

function expensePayload() {
    return {
        title: document.getElementById('exTitle').value,
        category: document.getElementById('exCategory').value,
        amount: document.getElementById('exAmount').value,
        spentOn: document.getElementById('exDate').value,
        note: document.getElementById('exNote').value,
        staffId: document.getElementById('exStaffId')?.value || ''
    };
}

document.addEventListener('DOMContentLoaded', () => {
    const root = document.getElementById('view-expenses');
    root.innerHTML = expensesMarkup();
    disableAutofill(root);
    const today = new Date().toISOString().slice(0, 10);
    document.getElementById('exDate').value = today;
    if (typeof bindExStaffFields === 'function') bindExStaffFields();
    document.getElementById('exForm').addEventListener('submit', async (event) => {
        event.preventDefault();
        try {
            const data = await api.post('/api/expenses/add', expensePayload());
            showToast(data.message);
            event.target.reset();
            document.getElementById('exDate').value = today;
            document.getElementById('exTitle').dataset.auto = '';
            if (typeof toggleExStaffField === 'function') toggleExStaffField();
            await loadExpenses();
            if (typeof refreshDashboard === 'function') refreshDashboard().catch(() => {});
        } catch (error) {
            showToast(error.message);
        }
    });
});
