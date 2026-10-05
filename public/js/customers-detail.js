function custOpenDetail(row, tab) {
    if (!row) return;
    custDetailId = String(row.id);
    custDetailTab = tab || 'orders';
    custDetailAll = false;
    paintCustDetail(row);
    const modal = document.getElementById('custDetail');
    modal.hidden = false;
    modal.scrollTop = 0;
}

function custCloseDetail() {
    const modal = document.getElementById('custDetail');
    if (!modal) return;
    modal.hidden = true;
    custDetailId = '';
}

function custDetailCall(row) {
    if (row.phone) window.location.href = 'tel:' + row.phone;
    else showToast('No phone number on file.');
}

function custDetailWa(row, text) {
    const href = custWaHref(row.whatsapp || row.phone);
    if (!href) {
        showToast('No WhatsApp number on file.');
        return;
    }
    window.open(text ? href + '?text=' + encodeURIComponent(text) : href, '_blank', 'noopener');
}

async function custBlockCustomer(row) {
    const ok = await openConfirmDelete({
        title: 'Block customer',
        detail: row.name,
        warning: 'This customer will be marked inactive and blocked from new store credit.',
        yesLabel: 'Block Customer'
    });
    if (!ok) return;
    await api.put('/api/retail/customers/' + row.id, Object.assign({}, row, { status: 'Inactive' }));
    showToast('Customer blocked.');
    await loadCustDash({ keepPage: true });
    const next = custFind(custDetailId);
    if (next) paintCustDetail(next);
}

function custRunDetail(act) {
    const row = custFind(custDetailId);
    if (!row) return;
    if (act === 'call') custDetailCall(row);
    else if (act === 'wa') custDetailWa(row);
    else if (act === 'msg') {
        custDetailWa(row, 'Hello ' + row.name + ', this is Ammad Hadi Stor.');
    } else if (act === 'edit' && typeof custOpenForm === 'function') custOpenForm(row);
    else if (act === 'note') custShowNoteTab();
    else if (act === 'block') custBlockCustomer(row);
    else if (act === 'allorders') {
        custDetailAll = !custDetailAll;
        paintCustDOrders(row);
    }
}

function bindCustDetail() {
    const modal = document.getElementById('custDetail');
    const close = document.getElementById('custDClose');
    const tabs = document.getElementById('custDTabs');
    if (!modal || modal.dataset.bound) return;
    modal.dataset.bound = '1';
    close.addEventListener('click', custCloseDetail);
    modal.addEventListener('click', (event) => {
        if (event.target === modal) custCloseDetail();
        const act = event.target.closest('[data-cdact]');
        if (act) custRunDetail(act.dataset.cdact);
    });
    tabs.addEventListener('click', (event) => {
        const btn = event.target.closest('[data-cdtab]');
        if (!btn) return;
        custDetailTab = btn.dataset.cdtab;
        paintCustDetail(custFind(custDetailId));
    });
}
