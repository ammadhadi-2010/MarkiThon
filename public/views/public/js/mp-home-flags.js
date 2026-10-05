function mpHideHome(selector, on) {
    const node = document.querySelector(selector);
    if (node) node.hidden = on === false;
}

function mpText(selector, value) {
    const node = document.querySelector(selector);
    if (node && value) node.textContent = value;
}

function mpRecentCards() {
    return mpRecentIds().map((id) => {
        const live = typeof mpLiveProducts !== 'undefined' ? mpLiveProducts.find((row) => String(row.id) === String(id)) : null;
        return live || MP_PRODUCTS.find((row) => row.id === id) || null;
    }).filter(Boolean);
}

function mpPaintRecent(on, label) {
    const slot = document.getElementById('mpRecent');
    const row = document.getElementById('mpRecentRow');
    if (!slot || !row) return;
    mpText('#mpRecentTitle', label);
    const cards = on === false ? [] : mpRecentCards();
    slot.hidden = !cards.length;
    row.innerHTML = cards.map((item) => `<article class="mp-quote"><div><strong>${mpEscape(item.title || 'Product')}</strong><p>${mpEscape(item.shop || '')}</p></div></article>`).join('');
}

function mpPaintHomeReviews(list) {
    const quotes = document.getElementById('mpQuotes');
    if (!quotes || !list.length) return;
    quotes.innerHTML = list.map((row, index) => {
        const avatar = MP_REVIEWS[index] ? MP_REVIEWS[index].avatar : '';
        return `<article class="mp-quote"><img src="${mpEscape(avatar)}" alt=""><div><strong>${mpEscape(row.name)}</strong><p class="mp-stars">★★★★★ <span>${mpEscape(row.stars)}</span></p><p>“${mpEscape(row.text)}”</p></div></article>`;
    }).join('');
}

function mpApplyHome(cms) {
    const home = cms.home || {};
    mpHideHome('#categories', home.categories);
    mpHideHome('#mpWhy', home.why);
    mpHideHome('#reviews', home.reviews);
    mpHideHome('#mpNews', home.newsletter);
    mpHideHome('#mpPromos', home.offers);
    mpText('#categories h2', home.categoriesLabel);
    mpText('#mpWhyTitle', home.whyTitle);
    mpText('#reviews h2', home.reviewsTitle);
    mpText('#mpNews h3', home.newsTitle);
    mpText('#mpNews p', home.newsText);
    const vals = document.querySelectorAll('#mpWhyVals article');
    (home.benefits || []).forEach((row, index) => {
        const node = vals[index];
        if (!node) return;
        if (node.querySelector('strong')) node.querySelector('strong').textContent = row.title;
        if (node.querySelector('span')) node.querySelector('span').textContent = row.text;
    });
    if (Array.isArray(home.quotes)) mpPaintHomeReviews(home.quotes);
    mpPaintRecent(home.recent, home.recentLabel);
}
