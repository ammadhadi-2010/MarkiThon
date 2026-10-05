function saCmsCheck(name, on) {
    return `<input type="checkbox" autocomplete="off"${on ? ' checked' : ''}>`;
}

function saCmsShopField(row) {
    const shops = (saCmsPack && saCmsPack.shops) || [];
    const options = [['', 'Custom link']].concat(shops.map((shop) => [String(shop.id), saText(shop.name)]));
    return `<label>Link to Shop</label><select data-banner="shop" autocomplete="off">${saShopOptions(options, String(row.shopId || ''))}</select>`;
}

function saCmsBannerForm(row) {
    const image = saCmsUrl(row.image);
    const label = row.cta || 'Shop Now';
    return `<article class="sa-card sa-cms-edit">
        <label>Title</label><input data-banner="title" autocomplete="off" value="${saText(row.title)}">
        <label>Subtitle</label><input data-banner="text" autocomplete="off" value="${saText(row.text)}">
        <label>Image file</label><input data-banner="file" type="file" accept="image/png,image/jpeg,image/webp" autocomplete="off">
        <label>Image URL</label><input data-banner="image" autocomplete="off" value="${saText(image)}">
        ${saCmsShopField(row)}
        <label>Custom link</label><input data-banner="link" autocomplete="off" value="${saText(row.link || '')}" placeholder="/#categories">
        <label>Button label</label><input data-banner="cta" autocomplete="off" maxlength="24" value="${saText(label)}">
        <label class="sa-switch-row">Enabled ${saCmsCheck('enabled', row.enabled)}</label>
        <button class="sa-cms-copy" type="button" data-cms-drop="${saText(row.id)}">Remove</button>
    </article>`;
}

function saCmsBanners(pack) {
    const rows = pack.cms.banners || [];
    const forms = `<section class="sa-card"><div class="sa-head"><h3>Banners & Slider</h3><button class="sa-cms-visit" id="saCmsAddBanner" type="button">+ Add Banner</button></div>
        <div class="sa-cms-edits" id="saCmsBannerList">${rows.map(saCmsBannerForm).join('') || '<p class="sa-muted">No banners yet.</p>'}</div>
        <button class="sa-cms-visit" id="saCmsSaveBanners" type="button">Save Banners</button>
    </section>`;
    return `<div class="sa-cms-banner-layout">${saCmsPreviewShell()}${forms}</div>`;
}

function saCmsHay(parts) {
    return saText(parts.map((part) => String(part || '')).join(' ').toLowerCase());
}

function saCmsPicks(pack, kind) {
    const selected = new Set((kind === 'shops' ? pack.cms.featuredShopIds : pack.cms.featuredProductIds) || []);
    const rows = kind === 'shops' ? pack.shops : pack.products;
    const boxes = rows.map((row) => {
        const label = kind === 'shops' ? row.name : row.title;
        const extra = kind === 'shops' ? [row.owner, row.id] : [row.sku, row.shop];
        const on = selected.has(String(row.id)) ? ' checked' : '';
        return `<label class="sa-cms-pick" data-find="${saCmsHay([label].concat(extra))}"><input type="checkbox" data-cms-pick="${saText(row.id)}" autocomplete="off"${on}><span>${saText(label)}<em>${saText(extra.filter(Boolean).join(' · '))}</em></span><small>${saText(row.status)}</small></label>`;
    }).join('');
    const title = kind === 'shops' ? 'Featured Shops' : 'Featured Products';
    const hint = kind === 'shops' ? 'Search shop name, owner, or ID...' : 'Search product name, SKU, or shop...';
    return `<section class="sa-card"><h3>${title}</h3><input id="saCmsPickSearch" class="sa-cms-search" type="search" autocomplete="off" placeholder="${hint}"><p class="sa-muted">Leave every box clear to feature the first live matches.</p><div class="sa-cms-picks" id="saCmsPickList">${boxes}</div><p class="sa-muted" id="saCmsPickEmpty" hidden>No matches.</p><button class="sa-cms-visit" type="button" data-cms-save-picks="${kind}">Save Selection</button></section>`;
}

function saCmsPromoForm(row, index) {
    const image = saCmsUrl(row.image);
    const shops = (saCmsPack && saCmsPack.shops) || [];
    const options = [['', 'Custom link']].concat(shops.map((shop) => [String(shop.id), saText(shop.name)]));
    const thumb = image ? `<img class="sa-cms-promo-thumb" alt="" src="${saText(image)}">` : '<img class="sa-cms-promo-thumb" alt="" hidden>';
    return `<article class="sa-card sa-cms-edit">
        <h4>Promo ${index + 1}</h4>
        ${thumb}
        <label>Title</label><input data-promo="title" autocomplete="off" value="${saText(row.title)}">
        <label>Subtitle / Discount</label><input data-promo="text" autocomplete="off" value="${saText(row.text)}">
        <label>Banner image file</label><input data-promo="file" type="file" accept="image/png,image/jpeg,image/webp" autocomplete="off">
        <label>Image URL</label><input data-promo="image" autocomplete="off" value="${saText(image)}">
        <label>Link to Shop</label><select data-promo="shop" autocomplete="off">${saShopOptions(options, String(row.shopId || ''))}</select>
        <label>Direct URL</label><input data-promo="link" autocomplete="off" value="${saText(row.link || '')}" placeholder="/#trending">
    </article>`;
}

function saCmsSections(pack) {
    const sections = pack.cms.sections || {};
    const promos = (pack.cms.promos || []).slice(0, 3);
    const rows = [
        ['banners', 'Homepage banners'],
        ['shops', 'Featured shops'],
        ['products', 'Featured products']
    ];
    return `<section class="sa-card"><h3>Homepage Sections</h3>
        ${rows.map(([id, label]) => `<label class="sa-switch-row">${label} ${saCmsCheck(id, sections[id] !== false).replace('<input', `<input data-cms-section="${id}"`)}</label>`).join('')}
        <h3>Middle Promo Banners</h3>
        <p class="sa-muted">These three cards sit under the homepage product row. A selected shop replaces the direct URL.</p>
        <div class="sa-cms-promos" id="saCmsPromoList">${promos.map(saCmsPromoForm).join('')}</div>
        ${typeof saCmsShopAds === 'function' ? saCmsShopAds(pack) : ''}
        <button class="sa-cms-visit" id="saCmsSaveSections" type="button">Save Sections</button>
    </section>`;
}

function saCmsSettings(pack) {
    const cms = pack.cms;
    return `<form class="sa-card" id="saCmsSettingsForm" autocomplete="off">
        <h3>Settings</h3>
        <label class="sa-switch-row">Website Online <span class="sa-switch"><input id="saCmsSetOnline" type="checkbox" autocomplete="off"${cms.online ? ' checked' : ''}><span></span></span></label>
        <label>Public domain</label><input id="saCmsDomain" autocomplete="off" value="${saText(cms.domain || '')}" placeholder="markithon.com">
        <button class="sa-cms-visit" type="submit">Save Settings</button>
    </form>`;
}

function saCmsEditor(pack) {
    let main = saCmsSettings(pack);
    if (saCmsTab === 'banners') main = saCmsBanners(pack);
    if (saCmsTab === 'shops') main = saCmsPicks(pack, 'shops');
    if (saCmsTab === 'products') main = saCmsPicks(pack, 'products');
    if (saCmsTab === 'sections') main = saCmsSections(pack);
    if (saCmsTab === 'seo' && typeof saCmsSeoLayout === 'function') return saCmsSeoLayout(pack);
    if (saCmsTab === 'footer' && typeof saCmsFooterTab === 'function') return saCmsFooterTab(pack);
    if (saCmsTab === 'banners') return main;
    if (saCmsTab === 'settings' && typeof saCmsHomeLayout === 'function') return saCmsHomeLayout(pack);
    return `<div class="sa-cms-grid"><div>${main}</div>${saCmsSide(pack)}</div>`;
}
