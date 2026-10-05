function saCmsShopAds(pack) {
    const selected = new Set((pack.cms.featuredShopAdIds || []).map(String));
    const rows = pack.shopAds || [];
    const boxes = rows.map((row) => {
        const on = selected.has(String(row.id)) ? ' checked' : '';
        const extra = [row.sub, row.headline, row.owner].filter(Boolean).join(' · ');
        const find = saCmsHay([row.shopName, row.owner, row.headline, row.sub, row.id]);
        const state = row.live ? 'Live on shop' : 'Draft';
        return `<label class="sa-cms-pick" data-find="${find}"><input type="checkbox" data-cms-ad="${saText(row.id)}" autocomplete="off"${on}><span>${saText(row.shopName)}<em>${saText(extra)}</em></span><small>${state}</small></label>`;
    }).join('');
    const list = rows.length
        ? `<input id="saCmsAdSearch" class="sa-cms-search" type="search" autocomplete="off" placeholder="Search shop name, owner, or offer..."><div class="sa-cms-picks" id="saCmsAdList">${boxes}</div><p class="sa-muted" id="saCmsAdEmpty" hidden>No matches.</p>`
        : '<p class="sa-muted">No shopkeeper ads have been uploaded yet.</p>';
    return `<div id="saCmsAdManager"><h3>Shopkeeper Custom Ads Manager</h3><p class="sa-muted">Attach a shopkeeper promo to the rounded homepage cards. It runs with the promos you create above. Only ads that are live on the shop are included.</p>${list}</div>`;
}
