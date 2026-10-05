let saCmsPack = null;
let saCmsTab = 'overview';
let saCmsNote = '';

const SA_CMS_TABS = [
    ['overview', 'Overview'],
    ['banners', 'Banners & Slider'],
    ['shops', 'Featured Shops'],
    ['products', 'Featured Products'],
    ['sections', 'Sections'],
    ['seo', 'SEO'],
    ['footer', 'Footer CMS'],
    ['settings', 'Settings']
];

function saCmsWhen(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Not saved yet';
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        + ' · ' + date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function saCmsUrl(image) {
    const url = String(image || '');
    if (/^https?:\/\//i.test(url)) return url.replace(/["'()\\]/g, '');
    if (/^\/uploads\/banners\/[a-z0-9._-]+$/i.test(url)) return url;
    return '';
}

function saCmsBannerHref(row) {
    const shops = (saCmsPack && saCmsPack.shops) || [];
    const shop = shops.find((item) => String(item.id) === String(row.shopId || ''));
    if (shop && shop.path) return shop.path;
    const link = String(row.link || '').trim();
    if (link.startsWith('/') || /^https?:\/\//i.test(link)) return link;
    return '/#shops';
}

function saCmsStats(stats) {
    const cards = [
        ['blue', 'Total Shops', stats.shops, 'Live directory'],
        ['green', 'Active Shops', stats.active, 'Approved shops'],
        ['purple', 'Total Products', stats.products, 'Catalog plus live'],
        ['orange', 'Total Orders', stats.orders, 'Marketplace orders'],
        ['cyan', 'Total Visitors', stats.visitors, 'Not tracked']
    ];
    const icon = saIcon('<path d="M4 20V9l8-5 8 5v11"/><path d="M9 20v-6h6v6"/>');
    return `<div class="sa-shop-stats sa-cms-stats">${cards.map(([tone, label, value, note]) => `
        <article class="sa-card sa-stat sa-tone-${tone}">
            <div class="sa-stat-top"><div class="sa-ico">${icon}</div><span>${label}</span></div>
            <strong>${saCount(value)}</strong>
            <div class="sa-trend"><em>${note}</em></div>
        </article>`).join('')}</div>`;
}

function saCmsBanner(row) {
    const image = saCmsUrl(row.image);
    const style = image ? ` style="background-image:url('${image}')"` : '';
    const label = saText(row.cta || 'Shop Now');
    return `<article class="sa-cms-banner"${style}><strong>${saText(row.title)}</strong><span>${saText(row.text)}</span><em>${label}</em></article>`;
}

function saCmsShop(row) {
    return `<article class="sa-cms-shop">
        <div class="sa-shop-logo">${saText(saShopInitials(row.name))}</div>
        <strong>${saText(row.name)}</strong>
        <span class="sa-pill">${saText(row.category)}</span>
        <small>${saText(row.status)}</small>
        <a class="sa-cms-visit" href="/#shops">Visit Shop</a>
    </article>`;
}

function saCmsProduct(row) {
    const badge = row.tag ? `<span class="sa-pill">${saText(row.tag)}</span>` : '';
    return `<article class="sa-cms-product">
        <div class="sa-prod-photo sa-cover-${saText(row.tone)}">${badge}</div>
        <strong>${saText(row.title)}</strong>
        <span>${saMoney(row.price)} / ${saText(row.unit)}</span>
    </article>`;
}

function saCmsStatus(cms) {
    const host = cms.domain || location.host;
    const on = cms.online ? ' checked' : '';
    return `<section class="sa-card">
        <h3>Marketplace Status</h3>
        <label class="sa-switch-row">Website Online
            <span class="sa-switch"><input id="saCmsOnline" type="checkbox" autocomplete="off"${on}><span></span></span>
        </label>
        <p class="sa-muted">Last updated<br>${saCmsWhen(cms.updatedAt)}</p>
        <p><span class="sa-muted">Domain</span><br><strong>${saText(host)}</strong></p>
        <a class="sa-cms-visit" href="/" target="_blank" rel="noopener">View Website</a>
        <button class="sa-cms-copy" id="saCmsCopy" type="button">Copy Link</button>
    </section>`;
}

function saCmsActivity(pack) {
    const feed = (pack.cms.activity || []).map((row) => `<li><strong>${saText(row.text)}</strong><small>${saCmsWhen(row.at)}</small></li>`).join('')
        || '<li><strong>No activity yet.</strong><small>Changes appear here.</small></li>';
    return `<section class="sa-card"><h3>Recent Activity</h3><ul class="sa-cms-feed">${feed}</ul></section>`;
}

function saCmsSide(pack) {
    const actions = [
        ['banners', 'Add Banner'],
        ['shops', 'Add Featured Shop'],
        ['products', 'Add Featured Product'],
        ['sections', 'Manage Sections'],
        ['seo', 'SEO Settings']
    ];
    return `<aside class="sa-cms-side">
        <section class="sa-card"><h3>Quick Actions</h3>
            ${actions.map(([id, label]) => `<button class="sa-cms-jump" type="button" data-cms-tab="${id}">${label}</button>`).join('')}
        </section>
        ${saCmsStatus(pack.cms)}
        ${saCmsActivity(pack)}
    </aside>`;
}

function saCmsOverview(pack) {
    const banners = (pack.cms.banners || []).filter((row) => row.enabled);
    return `<div class="sa-cms-grid">
        <div>
            <section class="sa-card">
                <div class="sa-head"><h3>Homepage Banners & Slider</h3><button class="sa-cms-visit" type="button" data-cms-tab="banners">+ Add Banner</button></div>
                <p class="sa-muted">Manage the main banner images on your marketplace homepage.</p>
                <div class="sa-cms-banners">${banners.map(saCmsBanner).join('') || '<p class="sa-muted">No banners are enabled.</p>'}</div>
            </section>
            <section class="sa-card">
                <div class="sa-head"><div><h3>Featured Shops</h3><p class="sa-muted">Showcase top shops on your marketplace.</p></div><button class="sa-cms-link" type="button" data-sa="shops">Manage Shops</button></div>
                <div class="sa-cms-shops">${pack.featuredShops.map(saCmsShop).join('') || '<p class="sa-muted">No active shops yet.</p>'}</div>
            </section>
            <section class="sa-card">
                <div class="sa-head"><div><h3>Featured Products</h3><p class="sa-muted">Highlight best selling or new products on the homepage.</p></div><button class="sa-cms-link" type="button" data-sa="products">Manage Products</button></div>
                <div class="sa-cms-products">${pack.featuredProducts.map(saCmsProduct).join('') || '<p class="sa-muted">No published products yet.</p>'}</div>
            </section>
        </div>
        ${saCmsSide(pack)}
    </div>`;
}

function saPaintCms() {
    const tabs = SA_CMS_TABS.map(([id, label]) =>
        `<button class="sa-pill-btn${id === saCmsTab ? ' is-on' : ''}" type="button" data-cms-tab="${id}">${label}</button>`
    ).join('');
    const mark = saIcon('<circle cx="12" cy="12" r="8"/><path d="M4 12h16M12 4a12 12 0 0 1 0 16M12 4a12 12 0 0 0 0 16"/>');
    const body = saCmsTab === 'overview' ? saCmsOverview(saCmsPack) : saCmsEditor(saCmsPack);
    document.getElementById('saCms').innerHTML = `
        <div class="sa-shop-head">
            <div class="sa-shop-title"><div class="sa-shop-mark">${mark}</div><div><h1>Website / Marketplace</h1><p class="sa-muted">Manage your marketplace website, banners, featured content and more.</p></div></div>
        </div>
        <div class="sa-pills">${tabs}</div>
        <p class="sa-note-line" id="saCmsNote">${saText(saCmsNote)}</p>
        ${saCmsStats(saCmsPack.stats)}
        ${body}`;
    if (saCmsTab === 'banners' && typeof saCmsPaintLive === 'function') saCmsPaintLive();
    if (saCmsTab === 'settings' && typeof saCmsHomePaint === 'function') saCmsHomePaint();
    if (saCmsTab === 'seo' && typeof saCmsSeoPaint === 'function') saCmsSeoPaint();
    if (saCmsTab === 'footer' && typeof saCmsPagePaint === 'function') saCmsPagePaint();
}

async function saMountCms() {
    const response = await fetch('/api/admin/cms');
    if (!response.ok) {
        document.getElementById('saCms').innerHTML = '<section class="sa-card"><h2>Marketplace settings are unavailable.</h2></section>';
        return;
    }
    saCmsPack = await response.json();
    saPaintCms();
}
