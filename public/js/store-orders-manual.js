function osOrdManualOpen() {
    const box = document.getElementById('osOrdManual');
    if (!box) return;
    box.hidden = false;
    box.classList.add('open');
}

function osOrdManualClose() {
    const box = document.getElementById('osOrdManual');
    const form = document.getElementById('osOrdManualForm');
    if (form) form.reset();
    if (box) {
        box.hidden = true;
        box.classList.remove('open');
    }
}

async function saveOsOrdManual(event) {
    event.preventDefault();
    const qty = Math.max(1, Number(document.getElementById('osManQty').value) || 1);
    const total = Number(document.getElementById('osManTotal').value) || 0;
    const title = document.getElementById('osManItem').value.trim() || 'Manual order';
    const data = await api.post('/api/online-store/orders', {
        customerName: document.getElementById('osManName').value.trim(),
        customerPhone: document.getElementById('osManPhone').value.trim(),
        items: [{ title, qty, price: total / qty }],
        itemCount: qty,
        total,
        payment: document.getElementById('osManPay').value,
        status: 'New'
    });
    if (data.order) osOrders.unshift(data.order);
    osOrdTab = 'All';
    osOrdPage = 1;
    osOrdManualClose();
    paintOsOrders();
    showToast(data.message);
}

function bindOsOrdManual() {
    const open = document.getElementById('osOrdCreate');
    const cancel = document.getElementById('osManCancel');
    const form = document.getElementById('osOrdManualForm');
    const back = document.getElementById('osOrdManual');
    if (open && !open.dataset.bound) {
        open.dataset.bound = '1';
        open.addEventListener('click', osOrdManualOpen);
    }
    if (cancel && !cancel.dataset.bound) {
        cancel.dataset.bound = '1';
        cancel.addEventListener('click', osOrdManualClose);
    }
    if (form && !form.dataset.bound) {
        form.dataset.bound = '1';
        form.addEventListener('submit', (event) => {
            saveOsOrdManual(event).catch((err) => showToast(err.message));
        });
    }
    if (back && !back.dataset.bound) {
        back.dataset.bound = '1';
        back.addEventListener('click', (event) => {
            if (event.target === back) osOrdManualClose();
        });
    }
}
