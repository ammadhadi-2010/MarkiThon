function saVendorRow(row) {
    return `<tr>
        <td><strong>${saText(row.shopName)}</strong><div class="sa-muted">${saText(row.ownerName)}</div></td>
        <td>${saText(row.shopkeeperId || '—')}<div class="sa-muted">${saText(row.email)}</div></td>
        <td>${saText(row.phone)}</td>
        <td>${saStatus(row.status === 'Pending Admin Approval' ? 'Pending' : row.status)}</td>
        <td><div class="sa-actions">
            <button type="button" class="sa-add" data-vendor-status="Active" data-vendor-id="${saText(row.id)}">Approve</button>
            <button type="button" data-vendor-status="Suspended" data-vendor-id="${saText(row.id)}">Suspend</button>
        </div></td>
    </tr>`;
}

function saPaintVendors(rows) {
    const host = document.getElementById('saVendors');
    if (!host) return;
    host.innerHTML = `<section class="sa-card sa-shop-board">
        <div class="sa-head"><h3>Shopkeeper accounts</h3><span class="sa-muted">Vendor login accounts linked to admin oversight</span></div>
        <div class="sa-scroll"><table class="sa-table sa-shop-table">
            <thead><tr><th>Store / Owner</th><th>ID / Email</th><th>Phone</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>${(rows || []).map(saVendorRow).join('') || '<tr><td colspan="5">No shopkeeper accounts yet.</td></tr>'}</tbody>
        </table></div>
        <p class="sa-note-line" id="saVendorNote"></p>
    </section>`;
    host.querySelectorAll('[data-vendor-id]').forEach((btn) => {
        btn.addEventListener('click', () => {
            saVendorSave(btn.dataset.vendorId, btn.dataset.vendorStatus).catch((err) => {
                const note = document.getElementById('saVendorNote');
                if (note) note.textContent = err.message;
            });
        });
    });
}

async function saVendorSave(id, status) {
    const response = await fetch('/api/platform/vendors/' + encodeURIComponent(id), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Could not update shopkeeper status.');
    await saMountVendors();
}

async function saMountVendors() {
    if (!document.getElementById('saVendors')) return;
    const response = await fetch('/api/platform/vendors', { credentials: 'include' });
    if (!response.ok) {
        document.getElementById('saVendors').innerHTML = '<p class="sa-note-line">Could not load shopkeeper accounts.</p>';
        return;
    }
    const data = await response.json();
    saPaintVendors(data.vendors || []);
}
