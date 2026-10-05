function saBlank(value) {
    const text = String(value == null ? '' : value).trim();
    return text ? saText(text) : 'Not set';
}

function saProRow(label, value) {
    return `<div class="sa-pro-row"><span>${label}</span><strong>${saBlank(value)}</strong></div>`;
}

function saProMap(profile) {
    if (profile.latitude && profile.longitude) {
        const query = encodeURIComponent(profile.latitude + ',' + profile.longitude);
        return `<iframe class="sa-map" title="Shop location map" src="https://maps.google.com/maps?q=${query}&z=15&output=embed"></iframe>`;
    }
    if (profile.map) return `<p><a href="${saText(profile.map)}" target="_blank" rel="noopener">Open location map</a></p>`;
    return '<p class="sa-muted">Map is not set.</p>';
}

function saProWhatsapp(shop, profile) {
    let digits = String(profile.whatsapp || shop.phone || '').replace(/\D/g, '');
    if (digits.startsWith('0')) digits = '92' + digits.slice(1);
    if (!digits) return 'Not set';
    return `<a href="https://wa.me/${digits}" target="_blank" rel="noopener">${saBlank(profile.whatsapp || shop.phone)}</a>`;
}

function saProPackLabel(shop, profile) {
    const sub = profile.subscription || {};
    const pack = sub.selectedPackage || shop.package || 'Basic';
    const cycle = sub.billingCycle || 'monthly';
    const pay = sub.paymentStatus ? ' · ' + sub.paymentStatus : '';
    return pack + ' / ' + cycle + pay;
}

async function saProSave(shop, patch) {
    const response = await fetch('/api/platform/shops/' + encodeURIComponent(shop.id), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(patch)
    });
    const data = await response.json();
    if (!response.ok) {
        const note = document.getElementById('saProNote');
        if (note) note.textContent = data.message || 'Could not update this shop.';
        return;
    }
    saMountShopPage(shop.id);
}

function saPaintShopPage(shop, metrics) {
    const profile = shop.profile || {};
    const sub = profile.subscription || {};
    const metric = (value) => (metrics.tracked ? value : 'Not tracked');
    document.getElementById('saView').innerHTML = `
        <div class="sa-pro-top">
            <a class="sa-back" href="/admin#shops">← Back to Shops List</a>
            <div class="sa-pro-actions">
                <button type="button" data-pro="Active">Approve</button>
                <button type="button" data-pro="Suspended">Suspend</button>
                <button type="button" id="saEditPack">Edit Package</button>
            </div>
        </div>
        <h1>${saText(profile.storeName || shop.name)}</h1>
        <p class="sa-note-line" id="saProNote"></p>
        <div class="sa-pro-grid">
            <section class="sa-card"><h3>Store Details</h3>
                ${saProRow('Store Name', profile.storeName || shop.name)}
                ${saProRow('Shop SKU', profile.shopSku)}
                ${saProRow('Shop Type', profile.shopType)}
                ${saProRow('Business Type', profile.businessType)}
                ${saProRow('Status', shop.status)}
                ${saProRow('Setup', profile.setup)}
                ${saProRow('Admin Approval', profile.approved ? 'Approved' : 'Pending')}
            </section>
            <section class="sa-card"><h3>Owner Profile and CNIC</h3>
                ${saProRow('Owner Name', profile.ownerName || shop.owner)}
                ${saProRow('CNIC', profile.cnic)}
                ${saProRow('Shopkeeper ID', profile.shopkeeperId)}
                ${saProRow('Vendor Status', profile.vendorStatus)}
            </section>
            <section class="sa-card"><h3>Contact Channels</h3>
                ${saProRow('Phone', profile.phone || shop.phone)}
                <div class="sa-pro-row"><span>WhatsApp</span><strong>${saProWhatsapp(shop, profile)}</strong></div>
                ${saProRow('Email', profile.email)}
            </section>
            <section class="sa-card sa-pro-map"><h3>Physical Location</h3>
                ${saProRow('Address', profile.address)}
                ${saProRow('Market', profile.marketName)}
                ${saProRow('Shop Number', profile.shopNumber)}
                ${saProRow('Location', profile.location)}
                ${saProRow('Landmark', profile.landmark)}
                ${saProMap(profile)}
            </section>
            <section class="sa-card"><h3>Subscription Package</h3>
                ${saProRow('Active Package', saProPackLabel(shop, profile))}
                ${saProRow('Payment Method', sub.paymentMethod)}
                ${saProRow('TRX Reference', sub.transactionReference)}
                ${saProRow('Limits', (sub.productLimit || 0) + ' products · ' + (sub.orderLimit || 0) + ' orders')}
                <form id="saPackForm" class="sa-pack-form" autocomplete="off" hidden>
                    <label>Package</label>
                    <select id="saPagePack" autocomplete="off">
                        <option${shop.package === 'Basic' ? ' selected' : ''}>Basic</option>
                        <option${shop.package === 'Business' ? ' selected' : ''}>Business</option>
                        <option${shop.package === 'Premium' ? ' selected' : ''}>Premium</option>
                    </select>
                    <label>Billing cycle</label>
                    <select id="saPageCycle" autocomplete="off">
                        <option value="monthly"${(sub.billingCycle || 'monthly') === 'monthly' ? ' selected' : ''}>Monthly</option>
                        <option value="yearly"${sub.billingCycle === 'yearly' ? ' selected' : ''}>Yearly</option>
                    </select>
                    <button class="sa-add" type="submit">Save Package</button>
                </form>
            </section>
            <section class="sa-card"><h3>Store Performance</h3>
                ${saProRow('Products', metric(metrics.products))}
                ${saProRow('Orders', metric(metrics.orders))}
                ${saProRow('Sales', metrics.tracked ? saMoney(metrics.sales) : 'Not tracked')}
            </section>
        </div>`;
    document.getElementById('saEditPack').addEventListener('click', () => {
        document.getElementById('saPackForm').hidden = false;
    });
    document.getElementById('saPackForm').addEventListener('submit', (event) => {
        event.preventDefault();
        saProSave(shop, {
            selectedPackage: document.getElementById('saPagePack').value,
            billingCycle: document.getElementById('saPageCycle').value
        });
    });
    document.querySelectorAll('[data-pro]').forEach((button) => {
        button.addEventListener('click', () => saProSave(shop, { status: button.dataset.pro }));
    });
}

async function saMountShopPage(id) {
    saPaintNav('shops');
    saPaintTop();
    const response = await fetch('/api/platform/shops/' + encodeURIComponent(id), { credentials: 'include' });
    if (!response.ok) {
        document.getElementById('saView').innerHTML = '<section class="sa-card"><h2>Shop not found</h2><p><a class="sa-back" href="/admin#shops">← Back to Shops List</a></p></section>';
        return;
    }
    const data = await response.json();
    saPaintShopPage(data.shop, data.metrics || { tracked: false });
}
