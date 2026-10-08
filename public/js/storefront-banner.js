function storefrontBannerMarkup(shop) {
    const b = shop && shop.banner;
    if (!b || !b.enabled) return '';
    const sub = b.sub || 'LIMITED TIME OFFER';
    const head = b.headline || 'Save Up to 30%';
    const desc = b.description || 'On Selected Bedding & Towels';
    const cta = b.ctaText || 'Shop Sale';
    const link = b.ctaLink || 'sale';
    const media = b.imageUrl
        ? `<img class="sf-banner-media" src="${escapeHtml(b.imageUrl)}" alt="" loading="lazy">`
        : '';
    return `
        <section class="sf-banner">
            <div class="sf-banner-hero">
                ${media}
                <div class="sf-banner-copy">
                    <span class="sf-banner-kicker">${escapeHtml(sub)}</span>
                    <h2>${escapeHtml(head)}</h2>
                    <p>${escapeHtml(desc)}</p>
                    <button type="button" class="sf-banner-cta" data-sfbanner="${escapeHtml(link)}">${escapeHtml(cta)}</button>
                </div>
            </div>
        </section>`;
}

function productOnSale(product) {
    return Boolean(product.storeSale) || Number(product.wasPrice) > Number(product.retailPrice);
}

function matchSfProduct(product) {
    if (sfCategory === 'All') return true;
    if (sfCategory === 'sale') {
        const tagged = sfProducts.some(productOnSale);
        if (tagged) return productOnSale(product);
        return Boolean(sfShop && sfShop.banner && sfShop.banner.enabled);
    }
    if (sfCategory === 'featured') return Boolean(product.storeFeatured);
    if (sfCategory === 'new') return Boolean(product.storeNewArrival);
    if (String(sfCategory).startsWith('cat:')) {
        return product.category === String(sfCategory).slice(4);
    }
    return product.category === sfCategory;
}
