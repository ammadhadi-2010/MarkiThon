function storefrontHeroSlides(shop) {
    const assets = (shop && shop.themeAssets) || {};
    const seen = new Set();
    return []
        .concat(Array.isArray(shop.heroBanners) ? shop.heroBanners : [])
        .concat([assets.hero, shop.coverBanner])
        .map((url) => String(url || '').trim())
        .filter((url) => {
            if (!url || seen.has(url)) return false;
            seen.add(url);
            return true;
        });
}

function storefrontHeroMarkup(shop, logo, socials) {
    const slides = storefrontHeroSlides(shop);
    const frames = slides.length
        ? slides.map((url, i) => `
            <div class="sf-slide${i === 0 ? ' on' : ''}">
                <img src="${escapeHtml(url)}" alt="">
            </div>`).join('')
        : '<div class="sf-slide on"></div>';
    const multi = slides.length > 1;
    const arrows = multi
        ? `<button type="button" class="sf-hero-arrow prev" data-sfdir="-1" aria-label="Previous slide">‹</button>
           <button type="button" class="sf-hero-arrow next" data-sfdir="1" aria-label="Next slide">›</button>`
        : '';
    const dots = multi
        ? `<div class="sf-dots">${slides.map((_, i) =>
            `<button type="button" class="sf-dot${i === 0 ? ' on' : ''}" data-sfslide="${i}" aria-label="Slide ${i + 1}"></button>`
        ).join('')}</div>`
        : '';
    return `
        <section class="sf-hero" id="sfHero">
            <div class="sf-slider">${frames}</div>
            ${arrows}
            ${dots}
            <div class="sf-shop-badge">
                ${logo}
                <div>
                    <p class="sf-kicker">MarkiThon Store</p>
                    <h1>${escapeHtml(shop.shopName || 'Ammad Hadi Stor')}</h1>
                    <p>${escapeHtml(shop.shopAddress || shop.marketName || '')}</p>
                    <div class="sf-social">${socials || '<span>Social links coming soon</span>'}</div>
                </div>
            </div>
        </section>`;
}

function storefrontMarkup(shop, categories) {
    const assets = shop.themeAssets || {};
    const logoSrc = assets.logo || shop.imageUrl;
    const logo = logoSrc
        ? `<img class="sf-logo" src="${escapeHtml(logoSrc)}" alt="">`
        : '<div class="sf-logo sf-mark">M</div>';
    const socials = [
        shop.facebookPage && `<a href="${escapeHtml(shop.facebookPage)}" target="_blank" rel="noopener">Facebook</a>`,
        shop.instagramHandle && `<a href="${escapeHtml(shop.instagramHandle)}" target="_blank" rel="noopener">Instagram</a>`,
        shop.youtubeChannel && `<a href="${escapeHtml(shop.youtubeChannel)}" target="_blank" rel="noopener">YouTube</a>`,
        shop.websiteUrl && `<a href="${escapeHtml(shop.websiteUrl)}" target="_blank" rel="noopener">Website</a>`,
        shop.storeLocation && `<a href="${escapeHtml(mapHref(shop))}" target="_blank" rel="noopener">Map</a>`
    ].filter(Boolean).join('');
    const chips = ['All', 'Sale'].concat(categories).map((name) => {
        const key = name === 'Sale' ? 'sale' : name;
        return `<button type="button" class="sf-chip${name === 'All' ? ' on' : ''}" data-sfcat="${escapeHtml(key)}">${escapeHtml(name)}</button>`;
    }).join('');
    const bio = String(shop.shopDescription || '').trim();
    const themeId = shop.themeId || 'standard-retail';
    return `
        <div class="sf-shell" data-sf-theme="${escapeHtml(themeId)}">
        <header class="sf-top"><div class="mp-auth" id="mpAuthSlot"></div></header>
        ${storefrontHeroMarkup(shop, logo, socials)}
        ${typeof storefrontShowcaseMarkup === 'function' ? storefrontShowcaseMarkup(shop) : ''}
        <div class="sf-filters" id="sfFilters">${chips}</div>
        <section id="sfGridTop" class="sf-grid" hidden></section>
        <div id="sfBannerSlot" class="sf-banner-slot" hidden></div>
        <section id="sfGrid" class="sf-grid"></section>
        ${bio ? `<footer class="sf-foot">${escapeHtml(bio)}</footer>` : ''}
        </div>`;
}

function storefrontCardMarkup(product) {
    const price = Number(product.retailPrice || 0).toLocaleString();
    const unit = product.stockUnit || 'Meter';
    const id = escapeHtml(product.id);
    return `
        <article class="sf-card" data-sfopen="${id}">
            <a class="sf-open" href="/product/${id}">
                <img src="${escapeHtml(product.imageUrl || '')}" alt="" onerror="this.style.opacity=0.2">
                <div class="sf-meta">
                    <h2>${escapeHtml(product.title)}</h2>
                    <p>Rs. ${price} / ${escapeHtml(unit)}</p>
                </div>
            </a>
            <button type="button" class="sf-wa" data-sfwa="${id}">Order via WhatsApp</button>
        </article>`;
}
