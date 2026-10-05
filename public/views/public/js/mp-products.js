function mpEscape(value) {
    return String(value == null ? '' : value)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

const MP_PRODUCT_FALLBACK =
    'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=400&q=80';

function mpOffPercent(item) {
    const sale = Number(item.salePrice || item.retailPrice || 0);
    const retail = Number(item.retailPrice || sale);
    if (!retail || sale >= retail) return 0;
    return Math.round((1 - sale / retail) * 100);
}

function mpProductCard(item) {
    const sale = Number(item.salePrice || item.retailPrice || 0);
    const retail = Number(item.retailPrice || sale);
    const img = (item.images && item.images[0]) || item.imageUrl || MP_PRODUCT_FALLBACK;
    const id = item.id || 'lawn-suit';
    const off = mpOffPercent(item);
    const count = item.reviews ? `<span>(${item.reviews})</span>` : '';
    return `
        <article class="mp-tcard" data-mpopen="${mpEscape(id)}">
            <a href="/product/${mpEscape(id)}">
                <img src="${mpEscape(img)}" alt="" loading="lazy"
                    onerror="this.onerror=null;this.src='${MP_PRODUCT_FALLBACK}'">
                ${off ? `<span class="mp-off">-${off}%</span>` : ''}
            </a>
            <button type="button" class="mp-heart" data-wish="${mpEscape(id)}" aria-label="Wishlist">♡</button>
            <div>
                <h3><a href="/product/${mpEscape(id)}">${mpEscape(item.title)}</a></h3>
                <p class="mp-shop-sub">${mpEscape(item.shopName || 'MarkiThon')}</p>
                <p class="mp-stars">★ ${mpEscape(item.rating || '4.6')} ${count}</p>
                <p class="mp-price">Rs. ${sale.toLocaleString()}${retail > sale ? ` <s>Rs. ${retail.toLocaleString()}</s>` : ''}</p>
                <button type="button" class="mp-add" data-add="${mpEscape(id)}">Add to Cart</button>
            </div>
        </article>`;
}

function mpTrendItems() {
    const source = typeof mpLiveProducts !== 'undefined' ? mpLiveProducts : [];
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
