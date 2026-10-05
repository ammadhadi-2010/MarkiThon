function osOdCustOpen() {
    const row = osOrders.find((item) => String(item.id) === String(osOrdOpenId));
    const box = document.getElementById('osOdCustModal');
    if (!row || !box) return;
    document.getElementById('osOdName').value = row.customerName || '';
    document.getElementById('osOdPhone').value = row.customerPhone || '';
    document.getElementById('osOdWhatsapp').value = row.whatsapp || row.customerPhone || '';
    document.getElementById('osOdAddress').value = row.address || '';
    box.hidden = false;
    box.classList.add('open');
}

function osOdCustClose() {
    const box = document.getElementById('osOdCustModal');
    if (!box) return;
    box.hidden = true;
    box.classList.remove('open');
}

async function osOdCustSave(event) {
    event.preventDefault();
    if (!osOrdOpenId) return;
    const data = await api.put('/api/online-store/orders/' + encodeURIComponent(osOrdOpenId), {
        customerName: document.getElementById('osOdName').value.trim(),
        customerPhone: document.getElementById('osOdPhone').value.trim(),
        whatsapp: document.getElementById('osOdWhatsapp').value.trim(),
        address: document.getElementById('osOdAddress').value.trim()
    });
    const next = data.order;
    osOrders = osOrders.map((row) => (String(row.id) === String(next.id) ? next : row));
    osOdCustClose();
    osOrdDrawerOpen(next.id);
    showToast(data.message);
}

function bindOsOdCustomer() {
    const open = document.getElementById('osOdEdit');
    const cancel = document.getElementById('osOdCustCancel');
    const form = document.getElementById('osOdCustForm');
    const back = document.getElementById('osOdCustModal');
    if (open && !open.dataset.bound) {
        open.dataset.bound = '1';
        open.addEventListener('click', osOdCustOpen);
    }
    if (cancel && !cancel.dataset.bound) {
        cancel.dataset.bound = '1';
        cancel.addEventListener('click', osOdCustClose);
    }
    if (form && !form.dataset.bound) {
        form.dataset.bound = '1';
        form.addEventListener('submit', (event) => {
            osOdCustSave(event).catch((err) => showToast(err.message));
        });
    }
    if (back && !back.dataset.bound) {
        back.dataset.bound = '1';
        back.addEventListener('click', (event) => {
            if (event.target === back) osOdCustClose();
        });
    }
}
