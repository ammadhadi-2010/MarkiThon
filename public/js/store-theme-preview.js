function osThemePreviewMarkup(themeId, assets, shopName) {
    const name = shopName || 'Ammad Hadi Stor';
    const logo = assets.logo
        ? `<img class="sf-logo" src="${assets.logo}" alt="">`
        : '<div class="sf-logo sf-mark">M</div>';
    const hero = assets.hero
        ? ` style="background-image:linear-gradient(100deg,rgba(11,17,32,.82),rgba(22,31,54,.28)),url('${String(assets.hero).replace(/'/g, '%27')}')"`
        : '';
    const shot = (url, label) => url
        ? `<div class="sf-shot" style="background-image:url('${String(url).replace(/'/g, '%27')}')"></div>`
        : `<div class="sf-shot sf-shot-empty">${label}</div>`;
    return `
        <header class="sf-head"${hero}>
            ${logo}
            <div>
                <p class="sf-kicker">${osThemeById(themeId).name}</p>
                <h1>${name}</h1>
                <p>Main Market, Punjab</p>
            </div>
        </header>
        <section class="sf-showcase">
            ${shot(assets.showcaseA, 'Collection')}
            ${shot(assets.showcaseB, 'Showcase')}
        </section>
        <section class="sf-grid os-th-demo">
            <article class="sf-card"><div class="os-th-ph"></div><div class="sf-meta"><h2>Sample Lawn</h2><p>Rs. 1,100</p></div></article>
            <article class="sf-card"><div class="os-th-ph"></div><div class="sf-meta"><h2>Sample Set</h2><p>Rs. 2,500</p></div></article>
            <article class="sf-card"><div class="os-th-ph"></div><div class="sf-meta"><h2>Sample Silk</h2><p>Rs. 1,100</p></div></article>
        </section>`;
}

function paintOsThemePreview() {
    const box = document.getElementById('osThemePreview');
    if (!box) return;
    const themeId = osSelectedThemeId();
    box.setAttribute('data-sf-theme', themeId);
    box.innerHTML = osThemePreviewMarkup(themeId, osThemeAssetsRead());
}

function paintOsThemeSlots(themeId) {
    const slotBox = document.getElementById('osThemeSlots');
    if (!slotBox) return;
    const keep = osThemeAssetsRead();
    slotBox.innerHTML = osThemeSlotsMarkup(themeId);
    Object.keys(keep).forEach((key) => paintOsThemeAsset(key, keep[key]));
    if (typeof bindOsThemeUploads === 'function') bindOsThemeUploads();
    paintOsThemePreview();
}
