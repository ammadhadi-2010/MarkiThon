function paintCustDPays(row) {
    const list = Array.isArray(row.payments) ? row.payments : [];
    const rows = list.map((p) => `<tr>
        <td>${custDDay(p.day)}</td>
        <td>${custRs(p.amount)}</td>
        <td>${escapeHtml(p.method || 'Cash')}</td>
        <td>${escapeHtml(p.note || '—')}</td>
    </tr>`).join('') || '<tr><td colspan="4" class="empty">No payments recorded.</td></tr>';
    document.getElementById('custDPays').innerHTML = `
        <div class="table-wrap cust-d-table">
            <table class="cust-d-os">
                <thead><tr><th>Date</th><th>Amount</th><th>Method</th><th>Note</th></tr></thead>
                <tbody>${rows}</tbody>
            </table>
        </div>`;
}

function paintCustDNotes(row) {
    const list = Array.isArray(row.notes) ? row.notes : [];
    const items = list.map((n) => `<li>
        <small>${custDDay(n.at)}</small>
        <p>${escapeHtml(n.text)}</p>
    </li>`).join('') || '<li class="empty">No notes yet.</li>';
    document.getElementById('custDNotes').innerHTML = `
        <form id="custDNoteForm" autocomplete="off">
            <label>Add Note</label>
            <textarea id="custDNoteText" name="custDNoteText" rows="3" autocomplete="off"
                placeholder="Write a follow-up note..."></textarea>
            <button type="submit" class="os-ord-submit">Save Note</button>
        </form>
        <ul class="cust-d-notes">${items}</ul>`;
    const form = document.getElementById('custDNoteForm');
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        custSaveNote().catch((err) => showToast(err.message));
    });
}

async function custSaveNote() {
    const row = custFind(custDetailId);
    const text = document.getElementById('custDNoteText').value.trim();
    if (!row || !text) {
        showToast('Write a note first.');
        return;
    }
    const data = await api.put('/api/retail/customers/' + row.id, Object.assign({}, row, { note: text }));
    showToast(data.message || 'Note saved.');
    await loadCustDash({ keepPage: true });
    custDetailTab = 'notes';
    paintCustDetail(custFind(custDetailId));
}

function custShowNoteTab() {
    custDetailTab = 'notes';
    paintCustDetail(custFind(custDetailId));
    const box = document.getElementById('custDNoteText');
    if (box) box.focus();
}
