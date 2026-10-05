function storefrontShowcaseMarkup(shop) {
    const assets = (shop && shop.themeAssets) || {};
    const a = assets.showcaseA;
    const b = assets.showcaseB;
    if (!a && !b) return '';
    const cell = (url, label) => url
        ? `<div class="sf-shot" style="background-image:url('${String(url).replace(/'/g, '%27')}')" role="img" aria-label="${escapeHtml(label)}"></div>`
        : '';
    return `<section class="sf-showcase">${cell(a, 'Collection showcase')}${cell(b, 'Lookbook showcase')}</section>`;
}

function applySfTheme(shop) {
    const themeId = (shop && shop.themeId) || 'standard-retail';
    document.body.setAttribute('data-sf-theme', themeId);
    const root = document.getElementById('sfRoot');
    if (root) root.setAttribute('data-sf-theme', themeId);
}
