function osPolicyPointRows(prefix) {
    return [0, 1, 2, 3].map((index) => `
        <div class="os-point">
            <input id="${prefix}Title${index}" name="${prefix}Title${index}" maxlength="80" placeholder="e.g. Fast Charging" autocomplete="off">
            <input id="${prefix}Detail${index}" name="${prefix}Detail${index}" maxlength="160" placeholder="e.g. Supports up to 65W PD" autocomplete="off">
        </div>`).join('');
}

function osPolicyFields(ids) {
    return `
        <div class="field">
            <label for="${ids.time}">Estimated delivery time</label>
            <input id="${ids.time}" name="${ids.time}" maxlength="120" placeholder="2 - 4 Working Days" autocomplete="off">
        </div>
        <div class="field">
            <label for="${ids.charge}">Delivery charges</label>
            <input id="${ids.charge}" name="${ids.charge}" maxlength="160" placeholder="Free delivery on orders above Rs. 5,000" autocomplete="off">
        </div>
        <div class="field">
            <label for="${ids.detail}">Delivery details</label>
            <textarea id="${ids.detail}" name="${ids.detail}" rows="2" maxlength="500" autocomplete="off"></textarea>
        </div>
        <div class="field">
            <label for="${ids.returns}">Return and exchange policy</label>
            <textarea id="${ids.returns}" name="${ids.returns}" rows="3" maxlength="500" autocomplete="off"></textarea>
        </div>`;
}

function storeEditPolicyMarkup() {
    return `
    <section class="os-edit-sec">
        ${osEditSecHead('8', 'Product Page Policies', 'These appear in the three cards beside this product. Leave a field blank to use your store default.')}
        <p class="os-policy-note">Highlights / Key Bullet Points</p>
        <div class="os-policy-grid">${osPolicyPointRows('osEditPoint')}</div>
        ${osPolicyFields({
            time: 'osEditShipTime',
            charge: 'osEditShipCharge',
            detail: 'osEditShipDetail',
            returns: 'osEditReturn'
        })}
    </section>`;
}

function osReadPoints(prefix) {
    const points = [0, 1, 2, 3].map((index) => ({
        title: String(document.getElementById(prefix + 'Title' + index)?.value || '').trim(),
        detail: String(document.getElementById(prefix + 'Detail' + index)?.value || '').trim()
    })).filter((item) => item.title || item.detail);
    return JSON.stringify(points);
}

function osFillPoints(prefix, raw) {
    let points = [];
    try { points = JSON.parse(raw || '[]'); } catch (error) { points = []; }
    if (!Array.isArray(points)) points = [];
    [0, 1, 2, 3].forEach((index) => {
        const item = points[index] || {};
        const title = document.getElementById(prefix + 'Title' + index);
        const detail = document.getElementById(prefix + 'Detail' + index);
        if (title) title.value = item.title || '';
        if (detail) detail.value = item.detail || '';
    });
}

function fillOsEditPolicy(row) {
    osFillPoints('osEditPoint', row.storeHighlights);
    const time = document.getElementById('osEditShipTime');
    const charge = document.getElementById('osEditShipCharge');
    const detail = document.getElementById('osEditShipDetail');
    const returns = document.getElementById('osEditReturn');
    if (time) time.value = row.storeDeliveryTime || '';
    if (charge) charge.value = row.storeDeliveryCharge || '';
    if (detail) detail.value = row.storeDeliveryDetail || '';
    if (returns) returns.value = row.storeReturnPolicy || '';
}

function osEditPolicyPayload() {
    return {
        storeHighlights: osReadPoints('osEditPoint'),
        storeDeliveryTime: String(document.getElementById('osEditShipTime')?.value || '').trim(),
        storeDeliveryCharge: String(document.getElementById('osEditShipCharge')?.value || '').trim(),
        storeDeliveryDetail: String(document.getElementById('osEditShipDetail')?.value || '').trim(),
        storeReturnPolicy: String(document.getElementById('osEditReturn')?.value || '').trim()
    };
}
