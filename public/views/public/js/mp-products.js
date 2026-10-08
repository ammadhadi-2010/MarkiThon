function mpEscape(value) {
    return String(value == null ? '' : value)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

const MP_PRODUCT_FALLBACK =
    'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=400&q=80';

function mpPriceParts(item) {
    const online = Number(item.onlineSellingPrice != null ? item.onlineSellingPrice : item.retailPrice) || 0;
    const discount = Number(item.discountPrice || 0) || 0;
    let pct = Number(item.discountPercent || 0);
    let finalPrice = Number(item.finalPrice != null ? item.finalPrice : item.salePrice) || 0;
    if (online > 0 && discount > 0 && discount < online) {
        finalPrice = Math.max(0, online - discount);
        if (!(pct > 0)) pct = Math.round((discount / online) * 100);
    } else if (!(finalPrice > 0) && online > 0) {
        finalPrice = online;
    }
    const hasDiscount = online > 0 && finalPrice > 0 && finalPrice < online;
    if (hasDiscount && !(pct > 0)) pct = Math.round(((online - finalPrice) / online) * 100);
    return {
        online: hasDiscount ? online : finalPrice,
        finalPrice: hasDiscount ? finalPrice : (finalPrice || online),
        hasDiscount,
        off: hasDiscount ? pct : 0,
        unit: item.unit || item.stockUnit || 'Pcs'
    };
}

function mpOffPercent(item) {
    return mpPriceParts(item).off;
}

function mpProductCard(item) {
    const parts = mpPriceParts(item);
    const img = (item.images && item.images[0]) || item.imageUrl || MP_PRODUCT_FALLBACK;
    const id = item.id || 'lawn-suit';
    const count = item.reviews ? `<span>(${item.reviews})</span>` : '';
    const priceHtml = parts.hasDiscount
        ? `<div class="mp-price-block">
                <div class="mp-price-now">Rs. ${parts.finalPrice.toLocaleString()}</div>
                <div class="mp-price-sub">
                    <span class="mp-price-was">Rs. ${parts.online.toLocaleString()}</span>
                    <span class="mp-price-off">-${parts.off}%</span>
                </div>
           </div>`
        : `<div class="mp-price-block">
                <div class="mp-price-now is-plain">Rs. ${parts.finalPrice.toLocaleString()}</div>
           </div>`;
    return `
        <article class="mp-tcard" data-mpopen="${mpEscape(id)}">
            <a href="/product/${mpEscape(id)}">
                <img src="${mpEscape(img)}" alt="" loading="lazy"
                    onerror="this.onerror=null;this.src='${MP_PRODUCT_FALLBACK}'">
            </a>
            <button type="button" class="mp-heart" data-wish="${mpEscape(id)}" aria-label="Wishlist">♡</button>
            <div>
                <h3><a href="/product/${mpEscape(id)}">${mpEscape(item.title)}</a></h3>
                <p class="mp-shop-sub">${mpEscape(item.shopName || 'MarkiThon')}</p>
                <p class="mp-stars">★ ${mpEscape(item.rating || '4.6')} ${count}</p>
                ${priceHtml}
                <button type="button" class="mp-add" data-add="${mpEscape(id)}">Add to Cart</button>
            </div>
        </article>`;
}

function mpTrendItems() {
    const raw = typeof mpLiveProducts !== 'undefined' ? mpLiveProducts : [];
    const source = typeof mpDedupeProducts === 'function'
        ? mpDedupeProducts(raw)
        : Array.from(new Map(
            raw.map((item) => [String(item.title || '').trim().toLowerCase(), item])
        ).values());
    const featured = source.filter((row) => row.storeFeatured || row.tag === 'best');
    return (featured.length ? featured : source).slice(0, 12);
}

function mpTrendingMarkup() {
    return `
    <section class="mp-block mp-tight" id="trending">
        <div class="mp-head">
            <div>
                <h2>🔥 Trending on MarkiThon</h2>
            </div>
            <div class="mp-tabs">
                <button type="button" class="on" data-mptab="best" aria-pressed="true">Best Sellers</button>
            </div>
        </div>
        <div class="mp-tgrid" id="mpTrendGrid"><p class="mp-empty">Loading products...</p></div>
    </section>`;
}

function mpPaintTrendGrid(root) {
    const grid = root.querySelector('#mpTrendGrid');
    if (!grid) return;
    const cards = mpTrendItems().map(mpProductCard).join('');
    grid.innerHTML = cards || '<p class="mp-empty">No active products available yet.</p>';
    mpBindHearts(root);
    grid.querySelectorAll('[data-add]').forEach((btn) => {
        btn.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            mpAddToCart(btn.dataset.add, 1);
            mpPaintCartBadge(root);
            btn.textContent = 'Added';
        });
    });
}

async function mpLoadTrending(root) {
    if (typeof mpLoadCatalog === 'function') {
        try { await mpLoadCatalog(); } catch (error) { /* keep empty state */ }
    }
    mpPaintTrendGrid(root);
}
