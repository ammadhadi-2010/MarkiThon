function mpCheckList(items) {
    return items.map((item) => `<li><span aria-hidden="true">✓</span>${mpEscape(item)}</li>`).join('');
}

function mpPdpLowerMarkup() {
    return `
    <section class="mp-tabs-wrap" id="mpTabs">
        <div class="mp-tabs" role="tablist">
            <button type="button" class="on" role="tab" data-mptab="desc" aria-selected="true">Product Description</button>
            <button type="button" role="tab" data-mptab="spec" aria-selected="false">Specifications</button>
            <button type="button" role="tab" data-mptab="ship" aria-selected="false">Shipping &amp; Delivery</button>
            <button type="button" role="tab" id="mpTabReviews" data-mptab="reviews" aria-selected="false">Reviews (0)</button>
        </div>
        <div class="mp-tab on" data-mppanel="desc" id="mpPDesc"></div>
        <div class="mp-tab" data-mppanel="spec" id="mpSpec" hidden></div>
        <div class="mp-tab" data-mppanel="ship" id="mpShipPanel" hidden></div>
        <div class="mp-tab" data-mppanel="reviews" hidden>
            <div class="mp-reviews" id="mpPReviews"></div>
        </div>
    </section>
    <section class="mp-also" aria-label="You May Also Like">
        <div class="mp-also-head">
            <div>
                <h2>You May Also Like</h2>
                <p>Customers who viewed this item also viewed</p>
            </div>
            <div class="mp-also-nav">
                <button type="button" id="mpAlsoPrev" aria-label="Previous products">‹</button>
                <button type="button" id="mpAlsoNext" aria-label="Next products">›</button>
            </div>
        </div>
        <div class="mp-also-row" id="mpAlsoRow"></div>
    </section>
    <div class="mp-dock" id="mpDock" hidden>
        <img id="mpDockImg" alt="">
        <div class="mp-dock-copy">
            <strong id="mpDockName"></strong>
            <p id="mpDockPrice"></p>
        </div>
        <div class="mp-step mp-dock-qty">
            <button type="button" id="mpDockMinus" aria-label="Decrease quantity">−</button>
            <input id="mpDockQty" name="mpDockQty" inputmode="numeric" value="1" autocomplete="off">
            <button type="button" id="mpDockPlus" aria-label="Increase quantity">+</button>
        </div>
        <button type="button" class="mp-addcart" id="mpDockCart">Add to Cart</button>
        <button type="button" class="mp-buynow" id="mpDockBuy">Buy Now</button>
        <a class="mp-dock-chat" href="/contact">Chat with Store</a>
    </div>`;
}

function mpSpecPanel(row) {
    const rows = [
        ['Category', row.category],
        ['Shop', row.shopName || 'Ammad Hadi Stor'],
        ['Options', (row.variants || []).filter(Boolean).join(', ')]
    ].filter((pair) => pair[1]);
    return `<article class="mp-panel mp-spec">${rows.map((pair) =>
        `<div><span>${mpEscape(pair[0])}</span><strong>${mpEscape(pair[1])}</strong></div>`
    ).join('')}</article>`;
}

function mpShipPanel(row) {
    const lines = [
        row.deliveryTime ? `Estimated Delivery: ${row.deliveryTime}` : '',
        row.deliveryCharges || '',
        row.deliveryDetails || '',
        row.returns ? `Return & Exchange: ${row.returns}` : ''
    ].filter(Boolean);
    return `<article class="mp-panel"><ul class="mp-checks">${mpCheckList(lines.length ? lines : ['Delivery details will be confirmed by the shop.'])}</ul></article>`;
}

function mpPriceBits(item) {
    const sale = Number(item.salePrice || item.retailPrice || 0);
    const retail = Number(item.retailPrice || sale);
    const off = typeof mpOffPercent === 'function' ? mpOffPercent(item) : 0;
    return { sale, retail, off };
}

function mpPaintLower(row) {
    const desc = document.getElementById('mpPDesc');
    if (desc) desc.innerHTML = mpDescPanel(row);
    const spec = document.getElementById('mpSpec');
    if (spec) spec.innerHTML = mpSpecPanel(row);
    const ship = document.getElementById('mpShipPanel');
    if (ship) ship.innerHTML = mpShipPanel(row);
    const prices = mpPriceBits(row);
    const name = document.getElementById('mpDockName');
    const price = document.getElementById('mpDockPrice');
    const img = document.getElementById('mpDockImg');
    if (name) name.textContent = row.title || '';
    if (price) {
        price.innerHTML = `Rs. ${prices.sale.toLocaleString()}${prices.retail > prices.sale ? ` <s>Rs. ${prices.retail.toLocaleString()}</s>` : ''}`;
    }
    if (img) {
        const src = (row.images && row.images[0]) || row.imageUrl || '';
        if (src) img.src = src;
        img.alt = row.title || '';
    }
}

function mpAlsoCard(item) {
    const prices = mpPriceBits(item);
    const img = (item.images && item.images[0]) || item.imageUrl || '';
    const id = item.id;
    return `
        <a class="mp-also-card" href="/product/${mpEscape(id)}">
            <span class="mp-also-shot">${img ? `<img src="${mpEscape(img)}" alt="">` : ''}${prices.off ? `<em>-${prices.off}%</em>` : ''}</span>
            <strong>${mpEscape(item.title)}</strong>
            <span class="mp-also-rate">★ ${mpEscape(item.rating || '4.8')}</span>
            <span class="mp-also-price">Rs. ${prices.sale.toLocaleString()}${prices.retail > prices.sale ? ` <s>Rs. ${prices.retail.toLocaleString()}</s>` : ''}${prices.off ? ` <b>${prices.off}% OFF</b>` : ''}</span>
        </a>`;
}

async function mpLoadAlsoLike(row) {
    const slot = document.getElementById('mpAlsoRow');
    if (!slot) return;
    try {
        if (typeof mpLiveProducts === 'undefined' || mpLiveProducts.length < 2) {
            if (typeof mpLoadCatalog === 'function') await mpLoadCatalog();
        }
    } catch (error) {
        /* related products stay empty if the catalog cannot load */
    }
    const others = (typeof mpLiveProducts === 'undefined' ? [] : mpLiveProducts)
        .filter((item) => String(item.id) !== String(row.id))
        .slice(0, 8);
    slot.innerHTML = others.length
        ? others.map(mpAlsoCard).join('')
        : '<p class="mp-review-empty">No related products yet.</p>';
}
