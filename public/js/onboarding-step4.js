let obPlanCatalog = [];
let obBillingCycle = 'monthly';
let obSelectedPlan = 'Basic';
let obPayMethod = 'JazzCash';

function obPlanPrice(plan) {
    if (!plan) return 0;
    return obBillingCycle === 'yearly' ? Number(plan.yearlyPrice) : Number(plan.monthlyPrice);
}

function paintPackageCards() {
    const grid = document.getElementById('obPlanGrid');
    if (!grid) return;
    grid.innerHTML = obPlanCatalog.map((plan) => {
        const price = obPlanPrice(plan);
        const cycle = obBillingCycle === 'yearly' ? 'year' : 'month';
        const label = plan.label || plan.id;
        return `
        <article class="ob-plan${plan.popular ? ' popular' : ''}${plan.id === obSelectedPlan ? ' on' : ''}" data-plan="${plan.id}">
            ${plan.popular ? '<span class="ob-popular">Most Popular</span>' : ''}
            <div class="ob-plan-icon">${plan.icon || '📦'}</div>
            <h3>${label}</h3>
            <p class="ob-plan-price">Rs. ${price.toLocaleString()} <small>/ ${cycle}</small></p>
            <p class="ob-plan-limits">${plan.productLimit} products · ${plan.orderLimit} orders</p>
            <ul>${(plan.features || []).map((f) => `<li>${f}</li>`).join('')}</ul>
            <button type="button" class="ob-plan-btn" data-select-plan="${plan.id}">${plan.id === obSelectedPlan ? 'Selected' : 'Select Plan'}</button>
        </article>`;
    }).join('');
    const field = document.getElementById('obSelectedPackage');
    if (field) field.value = obSelectedPlan;
    const cycleField = document.getElementById('obBillingCycle');
    if (cycleField) cycleField.value = obBillingCycle;
}

function paintPackage(name) {
    obSelectedPlan = name || obSelectedPlan || 'Basic';
    paintPackageCards();
}

function fillPackage(row) {
    if (!row) return;
    obSelectedPlan = row.selectedPackage || 'Basic';
    obBillingCycle = row.billingCycle === 'yearly' ? 'yearly' : 'monthly';
    document.querySelectorAll('#obBillToggle button').forEach((btn) => {
        btn.classList.toggle('on', btn.dataset.bill === obBillingCycle);
    });
    paintPackage(obSelectedPlan);
}

async function loadPlanCatalog() {
    const data = await api.get('/api/subscription/plans');
    obPlanCatalog = Array.isArray(data.plans) ? data.plans : [];
    if (!obPlanCatalog.some((p) => p.id === obSelectedPlan)) {
        obSelectedPlan = obPlanCatalog[0]?.id || 'Basic';
    }
    paintPackageCards();
}

function selectedPlanRow() {
    return obPlanCatalog.find((p) => p.id === obSelectedPlan) || obPlanCatalog[0];
}

function openPayModal(amount) {
    document.getElementById('obPayAmount').textContent = 'Amount due: Rs. ' + amount.toLocaleString();
    document.getElementById('obTrxId').value = '';
    document.getElementById('obPayModal').classList.add('open');
    toggleTrxField();
}

function toggleTrxField() {
    const field = document.getElementById('obTrxField');
    if (field) field.hidden = obPayMethod === 'Card';
}

async function submitSubscription(extra) {
    const data = await api.post('/api/onboarding/step-4/subscribe', {
        selectedPackage: obSelectedPlan,
        billingCycle: obBillingCycle,
        paymentMethod: extra.paymentMethod,
        transactionReference: extra.transactionReference || ''
    });
    showToast(data.message);
    fillPackage(data.profile);
    document.getElementById('obPayModal').classList.remove('open');
    showObStep(5);
    if (typeof loadStaffStep === 'function') loadStaffStep().catch(() => {});
}

async function saveOnboardingStep4(event) {
    event.preventDefault();
    const plan = selectedPlanRow();
    const amount = obPlanPrice(plan);
    if (amount > 0) {
        openPayModal(amount);
        return;
    }
    await submitSubscription({ paymentMethod: 'Free', transactionReference: '' });
}

function bindOnboardingStep4() {
    document.getElementById('obBillToggle').addEventListener('click', (event) => {
        const btn = event.target.closest('[data-bill]');
        if (!btn) return;
        obBillingCycle = btn.dataset.bill;
        document.querySelectorAll('#obBillToggle button').forEach((node) => {
            node.classList.toggle('on', node === btn);
        });
        paintPackageCards();
    });
    document.getElementById('obPlanGrid').addEventListener('click', (event) => {
        const card = event.target.closest('[data-plan]');
        if (card) paintPackage(card.dataset.plan);
    });
    document.getElementById('obPayMethods').addEventListener('click', (event) => {
        const chip = event.target.closest('[data-pay]');
        if (!chip) return;
        obPayMethod = chip.dataset.pay;
        document.querySelectorAll('#obPayMethods .ob-pay-chip').forEach((node) => {
            node.classList.toggle('on', node === chip);
        });
        toggleTrxField();
    });
    document.getElementById('obPayCancel').addEventListener('click', () => {
        document.getElementById('obPayModal').classList.remove('open');
    });
    document.getElementById('obPayConfirm').addEventListener('click', () => {
        submitSubscription({
            paymentMethod: obPayMethod,
            transactionReference: document.getElementById('obTrxId').value.trim()
        }).catch((err) => showToast(err.message));
    });
    document.getElementById('obBack4').addEventListener('click', () => showObStep(2));
    document.getElementById('obCancel4').addEventListener('click', () => {
        loadPlanCatalog().catch((err) => showToast(err.message));
    });
    document.getElementById('obForm4').addEventListener('submit', (event) => {
        saveOnboardingStep4(event).catch((err) => showToast(err.message));
    });
    loadPlanCatalog().catch(() => {});
}
