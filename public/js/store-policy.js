function storePolicyMarkup() {
    return `
    <section class="card os-card" id="osPolicyCard">
        <div class="card-title">Store Policy Defaults</div>
        <p class="os-policy-note">Used on product pages when a product leaves a policy field blank.</p>
        <form id="osPolicyForm" autocomplete="off">
            <p class="os-policy-note">Product highlights / quality checked points</p>
            <div class="os-policy-grid">${osPolicyPointRows('osPolicyPoint')}</div>
            ${osPolicyFields({
                time: 'osPolicyTime',
                charge: 'osPolicyCharge',
                detail: 'osPolicyDetail',
                returns: 'osPolicyReturn'
            })}
            <button type="submit" class="os-save-btn" id="osPolicySave">Save Store Policies</button>
        </form>
    </section>`;
}

function fillStorePolicy(row) {
    osFillPoints('osPolicyPoint', row.policyHighlights);
    const time = document.getElementById('osPolicyTime');
    const charge = document.getElementById('osPolicyCharge');
    const detail = document.getElementById('osPolicyDetail');
    const returns = document.getElementById('osPolicyReturn');
    if (time) time.value = row.policyDeliveryTime || '';
    if (charge) charge.value = row.policyDeliveryCharge || '';
    if (detail) detail.value = row.policyDeliveryDetail || '';
    if (returns) returns.value = row.policyReturn || '';
}

async function loadStorePolicy() {
    if (!document.getElementById('osPolicyForm')) return;
    const row = await api.get('/api/settings/store-policies');
    fillStorePolicy(row || {});
}

async function saveStorePolicy(event) {
    event.preventDefault();
    const button = document.getElementById('osPolicySave');
    if (button) button.disabled = true;
    try {
        const data = await api.put('/api/settings/store-policies', {
            policyHighlights: osReadPoints('osPolicyPoint'),
            policyDeliveryTime: document.getElementById('osPolicyTime')?.value || '',
            policyDeliveryCharge: document.getElementById('osPolicyCharge')?.value || '',
            policyDeliveryDetail: document.getElementById('osPolicyDetail')?.value || '',
            policyReturn: document.getElementById('osPolicyReturn')?.value || ''
        });
        fillStorePolicy(data || {});
        showToast(data.message || 'Store policies saved.');
    } catch (error) {
        showToast(error.message || 'Could not save store policies.');
    } finally {
        if (button) button.disabled = false;
    }
}

function bindStorePolicy() {
    const form = document.getElementById('osPolicyForm');
    if (!form || form.dataset.bound) return;
    form.dataset.bound = '1';
    form.addEventListener('submit', (event) => {
        saveStorePolicy(event).catch((error) => showToast(error.message));
    });
}
