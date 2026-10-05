let mpCmsRows = null;
let mpAdIds = null;
let mpAdRows = null;

function mpAdImage(url) {
    const value = String(url || '').trim();
    if (/^data:image\/(png|jpeg|jpg|webp);base64,[a-z0-9+/=\s]+$/i.test(value)) return value;
    if (/^https?:\/\//i.test(value)) return value.replace(/["\\]/g, '');
    if (/^\/uploads\/[a-z0-9./_-]+$/i.test(value)) return value;
    return '';
}

function mpJoinCmsPromos(rows) {
    mpCmsRows = Array.isArray(rows) ? rows : [];
    mpPaintJoinedPromos();
}

function mpRememberFeaturedAds(ids) {
    mpAdIds = (ids || []).map(String);
    if (mpCmsRows != null) mpPaintJoinedPromos();
}

function mpRememberCampaigns(rows) {
    mpAdRows = Array.isArray(rows) ? rows : [];
    if (mpCmsRows != null) mpPaintJoinedPromos();
}

function mpJoinedCards() {
    const themes = ['red', 'glass', 'blue'];
    const admin = (mpCmsRows || []).map((row, index) => {
        const base = MP_DEFAULT_PROMOS[index % 3];
        const image = row.image || base.image;
        return {
            title: row.title || base.title,
            text: row.text || base.text,
            href: row.href || base.href,
            image: image || base.image,
            theme: themes[index % 3]
        };
    });
    const chosen = new Set(mpAdIds || []);
    const extra = (mpAdRows || []).filter((row) => chosen.has(String(row.shopId))).map((row, index) => {
        const at = admin.length + index;
        const base = MP_DEFAULT_PROMOS[at % 3];
        return {
            title: row.headline || base.title,
            text: row.description || row.shopName || '',
            href: row.href || base.href,
            image: mpAdImage(row.imageUrl) || base.image,
            theme: themes[at % 3]
        };
    });
    return admin.concat(extra);
}

function mpPaintJoinedPromos() {
    const slot = document.getElementById('mpPromos');
    const track = slot && slot.querySelector('.mp-promos');
    if (!track || mpCmsRows == null) return;
    const cards = mpJoinedCards();
    if (!cards.length) return;
    track.innerHTML = `<div class="mp-promo-set">${cards.map(mpPromoCard).join('')}</div>`;
    const root = document.getElementById('mpRoot');
    if (root && typeof mpBindPromoLoop === 'function') mpBindPromoLoop(root);
    if (typeof mpSyncPromoLoop === 'function') mpSyncPromoLoop(slot);
}
