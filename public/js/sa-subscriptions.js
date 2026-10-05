let saSubPlans = [];
let saSubRow = null;

function saSubReadPlans() {
    return [...document.querySelectorAll('.sa-sub-plan')].map((node) => ({
        id: node.querySelector('.sa-sub-id').value.trim(),
        label: node.querySelector('.sa-sub-label').value.trim(),
        icon: node.querySelector('.sa-sub-icon').value.trim(),
        monthlyPrice: Number(node.querySelector('.sa-sub-monthly').value) || 0,
        yearlyPrice: Number(node.querySelector('.sa-sub-yearly').value) || 0,
        productLimit: Number(node.querySelector('.sa-sub-products').value) || 0,
        orderLimit: Number(node.querySelector('.sa-sub-orders').value) || 0,
        popular: node.querySelector('.sa-sub-popular').checked,
        features: node.querySelector('.sa-sub-features').value.split('\n').map((s) => s.trim()).filter(Boolean)
    }));
}

function saSubPaintPlans(plans) {
    saSubPlans = plans || [];
    const host = document.getElementById('saSubPlans');
    if (!host) return;
    host.innerHTML = saSubPlans.map((plan, i) => saSubPlanFields(plan, i)).join('');
}

function saSubPaintPending(rows) {
    const host = document.getElementById('saSubPending');
    if (!host) return;
    const list = Array.isArray(rows) ? rows : [];
    if (!list.length) {
        host.innerHTML = '<p class="sa-muted">No pending manual payments.</p>';
        return;
    }
    host.innerHTML = list.map((row) => `
        <div class="sa-sub-pending">
            <p><strong>${saText(row.selectedPackage)}</strong> · ${saText(row.paymentMethod)} · TRX ${saText(row.transactionReference || '—')}</p>
            <button type="button" class="sa-add" data-sa-approve="1">Approve payment</button>
        </div>`).join('');
}

async function saSubFetch() {
    const [plansRes, shopRes, pendingRes] = await Promise.all([
        fetch('/api/subscription/plans', { credentials: 'include' }),
        fetch('/api/subscription/shop', { credentials: 'include' }),
        fetch('/api/subscription/pending-payments', { credentials: 'include' })
    ]);
    const plans = await plansRes.json();
    const shop = await shopRes.json();
    const pending = pendingRes.ok ? await pendingRes.json() : { rows: [] };
    saSubRow = shop.subscription || null;
    saSubPaintPlans(plans.plans || []);
    saSubPaintPending(pending.rows || []);
    if (saSubRow) {
        const extraP = document.getElementById('saSubExtraProducts');
        const extraO = document.getElementById('saSubExtraOrders');
        const note = document.getElementById('saSubExtensionNote');
        if (extraP) extraP.value = saSubRow.limitOverrideProducts || 0;
        if (extraO) extraO.value = saSubRow.limitOverrideOrders || 0;
        if (note) note.value = saSubRow.extensionNote || '';
        document.getElementById('saSubEffective').textContent = saSubRow.productLimit || 0;
        document.getElementById('saSubEffectiveOrders').textContent = saSubRow.orderLimit || 0;
    }
}

async function saSubSavePlans() {
    const note = document.getElementById('saSubNote');
    const response = await fetch('/api/subscription/plans', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ plans: saSubReadPlans() })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Could not save plans.');
    if (note) note.textContent = data.message || 'Subscription plans saved.';
    saSubPaintPlans(data.plans || saSubReadPlans());
}

async function saSubSaveLimits(event) {
    event.preventDefault();
    const note = document.getElementById('saSubLimitNote');
    const response = await fetch('/api/subscription/shop-limits', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
            limitOverrideProducts: document.getElementById('saSubExtraProducts').value,
            limitOverrideOrders: document.getElementById('saSubExtraOrders').value,
            extensionNote: document.getElementById('saSubExtensionNote').value
        })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Could not update limits.');
    saSubRow = data.subscription;
    document.getElementById('saSubEffective').textContent = saSubRow.productLimit || 0;
    document.getElementById('saSubEffectiveOrders').textContent = saSubRow.orderLimit || 0;
    if (note) note.textContent = data.message || 'Shop limits updated.';
}

async function saSubApprove() {
    const response = await fetch('/api/subscription/approve-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: '{}'
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Could not approve payment.');
    await saSubFetch();
}

function saMountSubscriptions() {
    saSubFetch().catch(() => {
        const note = document.getElementById('saSubNote');
        if (note) note.textContent = 'Could not load subscription settings.';
    });
    document.getElementById('saSubSave').addEventListener('click', () => {
        saSubSavePlans().catch((err) => {
            document.getElementById('saSubNote').textContent = err.message;
        });
    });
    document.getElementById('saSubLimitsForm').addEventListener('submit', (event) => {
        saSubSaveLimits(event).catch((err) => {
            document.getElementById('saSubLimitNote').textContent = err.message;
        });
    });
    document.getElementById('saSubPending').addEventListener('click', (event) => {
        if (event.target.closest('[data-sa-approve]')) {
            saSubApprove().catch((err) => {
                const note = document.getElementById('saSubNote');
                if (note) note.textContent = err.message;
            });
        }
    });
}
