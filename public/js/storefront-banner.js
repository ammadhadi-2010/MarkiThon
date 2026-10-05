function storefrontBannerMarkup(shop) {
    const b = shop && shop.banner;
    if (!b || !b.enabled) return '';
    const sub = b.sub || 'LIMITED TIME OFFER';
    const head = b.headline || 'Save Up to 30%';
    const desc = b.description || 'On Selected Bedding & Towels';
    const cta = b.ctaText || 'Shop Sale';
    const link = b.ctaLink || 'sale';
    const img = b.imageUrl
        ? `style="background-image:linear-gradient(90deg,rgba(11,17,32,.86),rgba(22,31,54,.4)),url('${String(b.imageUrl).replace(/'/g, '%27')}')"`
        : '';
    return `
        <section class="sf-banner">
            <div class="sf-banner-hero"${img}>
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
