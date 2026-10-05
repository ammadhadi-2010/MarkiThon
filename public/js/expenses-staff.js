const EX_STAFF_CATS = ['Staff Salary', 'Staff Advance / Udhaar'];
let exStaffLedger = [];

function isExStaffCategory(cat) {
    return EX_STAFF_CATS.includes(cat);
}

function selectedExStaffRow() {
    const id = document.getElementById('exStaffId')?.value;
    return exStaffLedger.find((s) => String(s.staffId) === String(id)) || null;
}

function toggleExStaffField() {
    const cat = document.getElementById('exCategory')?.value;
    const wrap = document.getElementById('exStaffWrap');
    const hint = document.getElementById('exSalaryHint');
    const show = isExStaffCategory(cat);
    const sel = document.getElementById('exStaffId');
    if (wrap) wrap.hidden = !show;
    if (sel) sel.required = show;
    paintExSalaryHint();
    if (!show && hint) hint.hidden = true;
}

function paintExSalaryHint() {
    const hint = document.getElementById('exSalaryHint');
    const amt = document.getElementById('exAmount');
    if (!hint) return;
    const cat = document.getElementById('exCategory')?.value;
    const row = selectedExStaffRow();
    if (cat !== 'Staff Salary' || !row) {
        hint.hidden = true;
        return;
    }
    const net = Number(row.netPayable || 0);
    hint.hidden = false;
    hint.textContent = net > 0
        ? `Advance Rs. ${Number(row.advanceThisMonth || 0).toLocaleString()} will be deducted. Net payable Rs. ${net.toLocaleString()}.`
        : 'No remaining salary this month after advances.';
    if (amt && (amt.value === '' || Number(amt.value) === 0)) amt.value = net > 0 ? String(net) : '';
}

function fillExStaffOptions() {
    const sel = document.getElementById('exStaffId');
    if (!sel) return;
    const keep = sel.value;
    sel.innerHTML = '<option value="">Select staff member</option>' + exStaffLedger.map((s) =>
        `<option value="${s.staffId}">${escapeHtml(s.name)} · ${escapeHtml(s.role || '')}</option>`
    ).join('');
    if (keep) sel.value = keep;
}

function renderExStaffLedger() {
    const tbody = document.getElementById('exStaffTable');
    if (!tbody) return;
    tbody.innerHTML = exStaffLedger.map((s) => {
        const net = Number(s.netPayable || 0);
        return `<tr>
            <td>${escapeHtml(s.name)}</td>
            <td>Rs. ${Number(s.baseSalary || 0).toLocaleString()}</td>
            <td>Rs. ${Number(s.advanceThisMonth || 0).toLocaleString()}</td>
            <td class="${net < 0 ? 'sup-due' : ''}">Rs. ${net.toLocaleString()}</td>
        </tr>`;
    }).join('') || '<tr><td colspan="4" class="empty">Add staff in onboarding to track salary and advance.</td></tr>';
}

async function loadExStaffLedger() {
    const data = await api.get('/api/expenses/staff-ledger');
    exStaffLedger = Array.isArray(data.rows) ? data.rows : [];
    fillExStaffOptions();
    renderExStaffLedger();
    paintExSalaryHint();
}

function bindExStaffFields() {
    document.getElementById('exCategory')?.addEventListener('change', toggleExStaffField);
    document.getElementById('exStaffId')?.addEventListener('change', () => {
        const row = selectedExStaffRow();
        const cat = document.getElementById('exCategory')?.value;
        const title = document.getElementById('exTitle');
        if (row && title && (!title.value || title.dataset.auto === '1')) {
            title.value = cat === 'Staff Salary' ? `Salary - ${row.name}` : `Advance - ${row.name}`;
            title.dataset.auto = '1';
        }
        paintExSalaryHint();
    });
    toggleExStaffField();
}
