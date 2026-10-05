function osOrdDrawerOpen(id) {
    const row = osOrders.find((item) => String(item.id) === String(id));
    const wrap = document.getElementById('osOrdDrawer');
    if (!row || !wrap) return;
    osOrdOpenId = row.id;
    paintOsOrdDetail(row);
    wrap.hidden = false;
    wrap.classList.add('open');
    paintOsOrders();
}

function osOrdDrawerClose() {
    const wrap = document.getElementById('osOrdDrawer');
    if (wrap) {
        wrap.hidden = true;
        wrap.classList.remove('open');
    }
    osOrdOpenId = '';
    paintOsOrders();
}

async function saveOsOrdStatus(status) {
    if (!osOrdOpenId || !status) return;
    const data = await api.put('/api/online-store/orders/' + encodeURIComponent(osOrdOpenId), { status });
    const next = data.order;
    osOrders = osOrders.map((row) => (String(row.id) === String(next.id) ? next : row));
    showToast(data.message);
    osOrdDrawerOpen(next.id);
}

function osOrdPrintCurrent() {
    const row = osOrders.find((item) => String(item.id) === String(osOrdOpenId));
    if (!row) return;
    if (typeof printDraftInvoice !== 'function') {
        showToast('Invoice printer is not ready.');
        return;
    }
    printDraftInvoice({
        number: row.orderNumber,
        createdAt: row.createdAt,
        paymentMethod: row.payment === 'COD' ? 'Cash on Delivery' : row.payment === 'Mobile Wallet' ? 'Mobile Wallet' : 'Paid',
        customerName: row.customerName,
        customerPhone: row.customerPhone,
        items: (row.items || []).map((item) => ({
            title: item.title,
            quantitySold: item.qty,
            sellUnit: 'pcs',
            rate: item.price,
            total: item.total
        })),
        subTotal: row.subtotal,
        discount: row.discount,
        tax: row.deliveryCharges,
        grandTotal: row.total,
        amountPaid: row.paymentStatus === 'Paid' ? row.total : 0
    });
}

function bindOsOrdDrawer() {
    const wrap = document.getElementById('osOrdDrawer');
    const close = document.getElementById('osOrdDrawerClose');
    const printBtn = document.getElementById('osOdPrint');
    if (wrap && !wrap.dataset.bound) {
        wrap.dataset.bound = '1';
        wrap.addEventListener('click', (event) => {
            if (event.target === wrap) osOrdDrawerClose();
            const act = event.target.closest('[data-osordact]');
            if (act && !act.disabled) {
                saveOsOrdStatus(act.dataset.osordact).catch((err) => showToast(err.message));
            }
        });
    }
    if (close && !close.dataset.bound) {
        close.dataset.bound = '1';
        close.addEventListener('click', osOrdDrawerClose);
    }
    if (printBtn && !printBtn.dataset.bound) {
        printBtn.dataset.bound = '1';
        printBtn.addEventListener('click', osOrdPrintCurrent);
    }
    if (typeof bindOsOdCustomer === 'function') bindOsOdCustomer();
}
