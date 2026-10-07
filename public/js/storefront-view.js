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

function sfSocialHref(kind, value) {
    const raw = String(value || '').trim();
    if (!raw) return '';
    if (/^https?:\/\//i.test(raw)) return raw;
    const handle = raw.replace(/^@/, '');
    if (kind === 'instagram') return 'https://instagram.com/' + encodeURIComponent(handle);
    if (kind === 'tiktok') return 'https://www.tiktok.com/@' + encodeURIComponent(handle);
    if (kind === 'facebook') return 'https://facebook.com/' + encodeURIComponent(handle);
    if (kind === 'youtube') return 'https://youtube.com/' + encodeURIComponent(handle);
    if (kind === 'whatsapp' && typeof waDigits === 'function') {
        const digits = waDigits(raw);
        return digits ? 'https://wa.me/' + digits : '';
    }
    return raw;
}

function sfSocialIcon(kind) {
    const icons = {
        facebook: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M14 9h3V6h-3c-1.7 0-3 1.3-3 3v2H8v3h3v7h3v-7h3l1-3h-4V9c0-.6.4-1 1-1z"/></svg>',
        instagram: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zm5 4.5A4.5 4.5 0 1 0 16.5 12 4.5 4.5 0 0 0 12 7.5zm5.8-.9a1.1 1.1 0 1 0 1.1 1.1 1.1 1.1 0 0 0-1.1-1.1z"/></svg>',
        whatsapp: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.7-1.2A9 9 0 1 0 12 3zm4.7 12.7c-.2.6-1.2 1.1-1.9 1.2-.5.1-1.1.2-3.2-.7-2.6-1.1-4.3-3.8-4.4-4-.1-.2-.9-1.2-.9-2.3s.6-1.6.8-1.8.4-.3.6-.3h.4c.1 0 .3 0 .4.3l.6 1.4c.1.2 0 .4-.1.5l-.3.4c-.1.1-.2.3-.1.5a6.5 6.5 0 0 0 1.9 2.3 5.7 5.7 0 0 0 2.4 1.1c.2 0 .4 0 .5-.2l.7-.8c.1-.2.3-.2.5-.1l1.5.7c.2.1.3.2.3.4s-.1 1.3-.7 1.8z"/></svg>',
        tiktok: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M16.5 4c.5 1.8 1.8 3.2 3.5 3.7v2.4a6.6 6.6 0 0 1-3.5-1v6.2a5.8 5.8 0 1 1-5.8-5.8c.3 0 .6 0 .9.1v2.6a3.2 3.2 0 1 0 2.3 3.1V4h2.6z"/></svg>',
        youtube: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M21.6 7.2a2.7 2.7 0 0 0-1.9-1.9C18 5 12 5 12 5s-6 0-7.7.3A2.7 2.7 0 0 0 2.4 7.2 28 28 0 0 0 2 12a28 28 0 0 0 .4 4.8 2.7 2.7 0 0 0 1.9 1.9C6 19 12 19 12 19s6 0 7.7-.3a2.7 2.7 0 0 0 1.9-1.9A28 28 0 0 0 22 12a28 28 0 0 0-.4-4.8zM10 15.5v-7l6 3.5-6 3.5z"/></svg>'
    };
    return icons[kind] || '';
}

function storefrontSocialMarkup(shop) {
    const rows = [
        ['facebook', 'Facebook', shop.facebookPage],
        ['instagram', 'Instagram', shop.instagramHandle],
        ['tiktok', 'TikTok', shop.tiktokHandle || shop.tiktokUrl],
        ['youtube', 'YouTube', shop.youtubeChannel]
    ];
    return rows.map(([kind, label, value]) => {
        const href = sfSocialHref(kind, value);
        if (!href) return '';
        return `<a class="sf-social-ico" href="${escapeHtml(href)}" target="_blank" rel="noopener" aria-label="${label}" title="${label}">${sfSocialIcon(kind)}</a>`;
    }).filter(Boolean).join('');
}

function storefrontShopCardMarkup(shop, logo, socials) {
    const socialRow = socials ? `<div class="sf-social">${socials}</div>` : '';
    return `
        <div class="sf-shop-badge">
            ${logo}
            <div>
                <p class="sf-kicker">MarkiThon Store</p>
                <h1>${escapeHtml(shop.shopName || 'Ammad Hadi Stor')}</h1>
                <p>${escapeHtml(shop.shopAddress || shop.marketName || '')}</p>
                ${socialRow}
            </div>
        </div>`;
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
            ${storefrontShopCardMarkup(shop, logo, socials)}
            ${arrows}
            ${dots}
        </section>`;
}

function storefrontMarkup(shop, categories) {
    const assets = shop.themeAssets || {};
    const logoSrc = assets.logo || shop.imageUrl;
    const logo = logoSrc
        ? `<img class="sf-logo" src="${escapeHtml(logoSrc)}" alt="">`
        : '<div class="sf-logo sf-mark">M</div>';
    const socials = storefrontSocialMarkup(shop);
    const chips = ['All', 'Sale'].concat(categories).map((name) => {
        const key = name === 'Sale' ? 'sale' : name;
        return `<button type="button" class="sf-chip${name === 'All' ? ' on' : ''}" data-sfcat="${escapeHtml(key)}">${escapeHtml(name)}</button>`;
    }).join('');
    const bio = String(shop.shopDescription || '').trim();
    const themeId = shop.themeId || 'standard-retail';
    return `
        <div class="sf-shell" data-sf-theme="${escapeHtml(themeId)}">
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
