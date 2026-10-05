let lastInvoice = null;
let invoicePrintBound = false;
let invoicePreviewState = false;

function billMenuHtml(id, type) {
    return `
        <div class="action-menu">
            <button type="button" class="dots" data-menu="1" title="Actions">⋮</button>
            <div class="action-drop">
                <button type="button" data-bill-act="view" data-id="${id}" data-type="${type}">View Bill</button>
                <button type="button" data-bill-act="edit" data-id="${id}" data-type="${type}">Edit Bill</button>
                <button type="button" data-bill-act="print" data-id="${id}" data-type="${type}">Print Receipt</button>
                <button type="button" data-bill-act="pdf" data-id="${id}" data-type="${type}">Download PDF</button>
                <button type="button" class="danger" data-bill-act="delete" data-id="${id}" data-type="${type}">Delete / Cancel Order</button>
            </div>
        </div>`;
}

function moneyInv(value) {
    return Number(value || 0).toLocaleString();
}

function formatInvDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleString('en-GB');
}

async function applyShopHeader() {
    const nameEl = document.getElementById('invShopName');
    const contactEl = document.getElementById('invShopContact');
    const shop = document.getElementById('shopName');
    if (shop && nameEl) nameEl.textContent = shop.textContent || 'Ammad Hadi Stor';
    try {
        const row = await api.get('/api/settings');
        if (nameEl) nameEl.textContent = row.shopName || 'Ammad Hadi Stor';
        const phones = [row.phone, row.whatsappNumber].filter(Boolean);
        if (contactEl) {
            contactEl.textContent = [row.address, phones.join(' / ')].filter(Boolean).join('  ·  ');
        }
    } catch (error) {
        if (contactEl) contactEl.textContent = '';
    }
}

async function loadInvoice(type, id) {
    const bill = await api.get(`/api/bills/${encodeURIComponent(id)}?type=${encodeURIComponent(type)}`);
    await applyShopHeader();
    paintInvoice(bill);
    return bill;
}

async function openSavedInvoice(type, id) {
    await loadInvoice(type, id);
    if (typeof bindInvFormat === 'function') bindInvFormat();
    openInvoicePreview();
}

async function editSavedBill(type, id) {
    const bill = await loadInvoice(type, id);
    closeInvoice();
    if (type === 'wholesale') {
        showView('wholesale', { skipRefresh: true });
        if (typeof loadWholesaleBillForEdit !== 'function') return;
        await loadWholesaleBillForEdit(bill);
    } else {
        showView('billing', { skipRefresh: true });
        if (typeof loadRetailBillForEdit !== 'function') return;
        await loadRetailBillForEdit(bill);
    }
    showToast('Bill loaded for editing. Save to apply changes.');
}

function openInvoicePreview() {
    const back = document.getElementById('invoiceBack');
    if (!back) return;
    back.classList.add('open');
    invoicePreviewState = true;
}

function closeInvoice() {
    const back = document.getElementById('invoiceBack');
    if (back) back.classList.remove('open');
    invoicePreviewState = false;
    if (typeof clearInvFormatClass === 'function') clearInvFormatClass();
}

function handleInvoiceClose(event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    closeInvoice();
}

function printInvoiceSheet(event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    const mode = typeof currentInvFormat === 'function' ? currentInvFormat() : 'thermal';
    if (typeof applyInvFormat === 'function') applyInvFormat(mode);
    const node = document.getElementById('printable-receipt');
    if (typeof printIsolatedNode === 'function') {
        printIsolatedNode(node, {
            mode,
            title: (lastInvoice && lastInvoice.number) || 'Receipt'
        });
        return;
    }
    showToast('Print helper is not ready.');
}

function printDraftInvoice(bill) {
    applyShopHeader().then(() => {
        paintInvoice(Object.assign({
            number: 'DRAFT',
            createdAt: new Date().toISOString(),
            paymentMethod: 'Cash',
            items: []
        }, bill));
        if (typeof bindInvFormat === 'function') bindInvFormat();
        openInvoicePreview();
    }).catch((error) => showToast(error.message));
}

async function handleBillAction(act, type, id, event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    if (act === 'view' || act === 'print' || act === 'pdf') {
        await openSavedInvoice(type, id);
        if (act === 'pdf') showToast('Choose a format, then Print and pick Save as PDF.');
        return;
    }
    if (act === 'edit') return editSavedBill(type, id);
    if (act !== 'delete') return;
    if (!confirm('Delete / cancel this order?')) return;
    const url = type === 'wholesale' ? `/api/wholesale/${id}` : `/api/retail/${id}`;
    showToast((await api.del(url)).message);
    if (type === 'wholesale' && typeof refreshWholesaleView === 'function') await refreshWholesaleView();
    if (type === 'retail' && typeof loadRtBills === 'function') await loadRtBills();
}

document.addEventListener('DOMContentLoaded', () => {
    document.body.insertAdjacentHTML('beforeend', invoiceModalMarkup());
    if (typeof bindInvFormat === 'function') bindInvFormat();
    document.getElementById('invClose').addEventListener('click', handleInvoiceClose);
    document.getElementById('invCloseX')?.addEventListener('click', handleInvoiceClose);
    document.getElementById('invPrint').addEventListener('click', printInvoiceSheet);
    document.getElementById('invoiceBack').addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (event.target.id === 'invoiceBack') closeInvoice();
    });
    document.querySelector('#invoiceBack .invoice-frame')?.addEventListener('click', (event) => {
        event.stopPropagation();
    });
    document.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape') return;
        if (!invoicePreviewState) return;
        event.preventDefault();
        event.stopPropagation();
        closeInvoice();
    });
    window.addEventListener('popstate', () => {
        if (invoicePreviewState) closeInvoice();
    });
    if (!invoicePrintBound) {
        invoicePrintBound = true;
        document.addEventListener('click', (event) => {
            const btn = event.target.closest('[data-bill-act]');
            if (!btn) return;
            handleBillAction(btn.dataset.billAct, btn.dataset.type, btn.dataset.id, event)
                .catch((error) => showToast(error.message));
        });
    }
});
