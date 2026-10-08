const MP_SHOP_FALLBACK =
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80';

const MP_SHOPS = [
    ['Ammad Hadi Stor', '4.8', ['Bedsheets', 'Suits'], '/ammadhadistor',
        'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80'],
    ['Khan Fabrics', '4.6', ['Fabric', 'Lawn'], '/ammadhadistor',
        'https://images.unsplash.com/photo-1558171813-4d70ee78b90f?auto=format&fit=crop&w=600&q=80'],
    ['Al-Noor Bedsheets', '4.7', ['Bedsheets', 'Home'], '/ammadhadistor',
        'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=600&q=80'],
    ['Fashion Hub', '4.5', ['Suits', 'Ready-made'], '/ammadhadistor',
        'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=600&q=80']
];

function mpShopTags(tags) {
    return (tags || []).map((tag) => `<span class="mp-chip">${mpEscape(tag)}</span>`).join('');
}

function mpShopCard(row) {
    const name = row.name || row[0];
    const rate = row.rating || row[1] || '4.7';
    const tags = row.tags || row[2] || [];
    const href = row.path || row[3] || '/#shops';
    const image = row.image || row[4] || MP_SHOP_FALLBACK;
    return `
        <article class="mp-shop">
            <img src="${mpEscape(image)}" alt="" loading="lazy"
                onerror="this.onerror=null;this.src='${MP_SHOP_FALLBACK}'">
            <div>
                <h3>${mpEscape(name)} <span class="mp-verified" title="Verified">✓</span></h3>
                <p class="mp-shop-tags">${mpShopTags(tags)}</p>
                <p class="mp-rate">★ ${mpEscape(rate)}</p>
                <a class="mp-visit" href="${mpEscape(href)}">Visit Shop</a>
            </div>
        </article>`;
}

function mpShopsMarkup() {
    const cards = MP_SHOPS.map((row) => mpShopCard({
        name: row[0], rating: row[1], tags: row[2], path: row[3], image: row[4]
    })).join('');
    return `
    <section class="mp-block mp-tight-top" id="shops">
        <div class="mp-head">
            <div>
                <h2>Featured Shops</h2>
            </div>
            <a href="#shops">View All Shops</a>
        </div>
        <div class="mp-shops" id="mpShopGrid">${cards}</div>
    </section>`;
}


function mpPaintFeaturedShops(rows) {
    const grid = document.getElementById('mpShopGrid');
    if (!grid || !Array.isArray(rows) || !rows.length) return;
    grid.innerHTML = rows.map((row) => mpShopCard({
        name: row.name,
        rating: '4.8',
        tags: row.tags && row.tags.length ? row.tags : [row.category || 'Shop'],
        path: row.path || '/#shops',
        image: row.image || MP_SHOP_FALLBACK
    })).join('');
}
