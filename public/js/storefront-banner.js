function sfPromoDefaults() {
    return [
        {
            tone: 'delivery',
            sub: 'SHIPPING',
            head: 'Fast Delivery',
            desc: 'Quick dispatch on every order',
            cta: 'Shop Now',
            link: 'All',
            imageUrl: ''
        },
        {
            tone: 'deal',
            sub: 'SPECIAL DEAL',
            head: 'Save Up to 30%',
            desc: 'Limited-time offers in store',
            cta: 'Shop Sale',
            link: 'sale',
            imageUrl: ''
        }
    ];
}

function sfPromoCards(shop) {
    const cards = sfPromoDefaults();
    const b = shop && shop.banner;
    if (b && b.enabled) {
        cards[1] = {
            tone: 'deal',
            sub: b.sub || cards[1].sub,
            head: b.headline || cards[1].head,
            desc: b.description || cards[1].desc,
            cta: b.ctaText || cards[1].cta,
            link: b.ctaLink || 'sale',
            imageUrl: String(b.imageUrl || '').trim()
        };
    }
    const assets = (shop && shop.themeAssets) || {};
    const extra = []
        .concat(Array.isArray(shop && shop.heroBanners) ? shop.heroBanners : [])
        .concat([assets.hero, shop && shop.coverBanner])
        .map((url) => String(url || '').trim())
        .filter(Boolean);
    if (!cards[0].imageUrl && extra[1]) cards[0].imageUrl = extra[1];
    if (!cards[1].imageUrl && extra[0]) cards[1].imageUrl = extra[0];
    return cards;
}

function sfPromoIcon(tone) {
    if (tone === 'delivery') {
        return '<svg class="sf-promo-icon" viewBox="0 0 48 48" aria-hidden="true"><path fill="currentColor" d="M4 14h26v16H4V14zm28 4h8l4 6v6h-3.1a5 5 0 0 1-9.8 0H16.9a5 5 0 0 1-9.8 0H4v-2h3.1a5 5 0 0 1 9.8 0H28V18zm-20 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm24 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/></svg>';
    }
    return '<svg class="sf-promo-icon" viewBox="0 0 48 48" aria-hidden="true"><path fill="currentColor" d="M24 6l3.2 7.4L35 16l-6.4 4.8L30.4 30 24 25.4 17.6 30l1.8-9.2L13 16l7.8-2.6L24 6zm-12 28h24v4H12v-4z"/></svg>';
}

function sfPromoCardMarkup(card) {
    const media = card.imageUrl
        ? `<img class="sf-promo-media" src="${escapeHtml(card.imageUrl)}" alt="" loading="lazy">`
        : '';
    return `
        <button type="button" class="sf-promo sf-promo-${escapeHtml(card.tone)}" data-sfbanner="${escapeHtml(card.link)}">
            ${media}
            <span class="sf-promo-copy">
                <span class="sf-promo-kicker">${escapeHtml(card.sub)}</span>
                <strong>${escapeHtml(card.head)}</strong>
                <span class="sf-promo-desc">${escapeHtml(card.desc)}</span>
            </span>
            ${sfPromoIcon(card.tone)}
        </button>`;
}

function storefrontBannerMarkup(shop) {
    return sfPromoCards(shop).map(sfPromoCardMarkup).join('');
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
