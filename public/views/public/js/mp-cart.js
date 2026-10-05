function mpCartMoney(value) {
    return 'Rs. ' + Number(value || 0).toLocaleString();
}

function mpWriteCart(rows) {
    localStorage.setItem('mpCart', JSON.stringify(rows));
    mpPaintCartDrawer();
    const root = document.getElementById('mpRoot');
    if (root && typeof mpPaintCartBadge === 'function') mpPaintCartBadge(root);
}

function mpCartPicture(row) {
    const live = typeof mpCartSource === 'function' ? mpCartSource(row.id) : null;
    const fresh = live ? ((live.images && live.images[0]) || live.imageUrl || '') : '';
    return fresh || row.image || '';
}

function mpCartThumb(row, title) {
    const image = typeof mpEscape === 'function' ? mpEscape(mpCartPicture(row)) : '';
    if (!image) {
        const letter = (title || 'P').trim().charAt(0).toUpperCase() || 'P';
        return `<span class="mp-cart-fallback">${letter}</span>`;
    }
    return `<img src="${image}" alt="">`;
}

function mpCartLineMarkup(row, index) {
    const title = typeof mpEscape === 'function' ? mpEscape(row.title || 'Product') : 'Product';
    const qty = Math.max(1, Number(row.qty) || 1);
    const line = (Number(row.price) || 0) * qty;
    return `
        <article class="mp-cart-line" data-line="${index}">
            ${mpCartThumb(row, row.title || 'Product')}
            <div>
                <strong>${title}</strong>
                <p>${mpCartMoney(line)}</p>
                <div class="mp-cart-qty">
                    <button type="button" data-qty="-1" aria-label="Decrease quantity">−</button>
                    <span>${qty}</span>
                    <button type="button" data-qty="1" aria-label="Increase quantity">+</button>
                    <button type="button" data-remove="1" aria-label="Remove item">🗑️</button>
                </div>
            </div>
        </article>`;
}

function mpCartDrawerMarkup() {
    return `
    <div class="mp-cart-back" id="mpCartBack" hidden>
        <aside class="mp-cart-drawer" role="dialog" aria-label="Shopping cart">
            <div class="mp-cart-head">
                <h2>Cart</h2>
                <button type="button" id="mpCartClose" aria-label="Close">×</button>
            </div>
            <div id="mpCartLines"></div>
            <div class="mp-cart-foot">
                <div><span>Subtotal</span><strong id="mpCartTotal">Rs. 0</strong></div>
                <button type="button" class="mp-checkout" id="mpCheckout">Proceed to Checkout</button>
            </div>
        </aside>
    </div>`;
}

function mpChangeCartLine(index, delta, remove) {
    const rows = typeof mpReadCart === 'function' ? mpReadCart() : [];
    const row = rows[index];
    if (!row) return;
    if (remove) rows.splice(index, 1);
    else {
        const next = (Number(row.qty) || 1) + delta;
        if (next < 1) rows.splice(index, 1);
        else rows[index].qty = next;
    }
    rows.forEach((item) => { item.image = mpCartPicture(item); });
    mpWriteCart(rows);
}

function mpBindCartLines(lines) {
    if (lines.dataset.bound) return;
    lines.dataset.bound = '1';
    lines.addEventListener('click', (event) => {
        const line = event.target.closest('[data-line]');
        if (!line) return;
        const index = Number(line.dataset.line);
        if (event.target.closest('[data-remove]')) {
            mpChangeCartLine(index, 0, true);
            return;
        }
        const step = event.target.closest('[data-qty]');
        if (step) mpChangeCartLine(index, Number(step.dataset.qty), false);
    });
    lines.addEventListener('error', (event) => {
        if (event.target.tagName !== 'IMG') return;
        const mark = document.createElement('span');
        mark.className = 'mp-cart-fallback';
        mark.textContent = 'P';
        event.target.replaceWith(mark);
    }, true);
}

function mpEnsureCart() {
    if (document.getElementById('mpCartBack')) return;
    document.body.insertAdjacentHTML('beforeend', mpCartDrawerMarkup());
    document.getElementById('mpCartClose').addEventListener('click', mpCloseCart);
    document.getElementById('mpCartBack').addEventListener('click', (event) => {
        if (event.target.id === 'mpCartBack') mpCloseCart();
    });
    document.getElementById('mpCheckout').addEventListener('click', () => {
        if (typeof mpOpenCheckout === 'function') mpOpenCheckout();
    });
    mpBindCartLines(document.getElementById('mpCartLines'));
}

function mpPaintCartDrawer() {
    mpEnsureCart();
    const rows = typeof mpReadCart === 'function' ? mpReadCart() : [];
    const lines = document.getElementById('mpCartLines');
    lines.innerHTML = rows.length
        ? rows.map(mpCartLineMarkup).join('')
        : '<p class="mp-cart-empty">Your cart is empty.</p>';
    const total = rows.reduce((sum, row) => sum + Number(row.price || 0) * (Number(row.qty) || 1), 0);
    document.getElementById('mpCartTotal').textContent = mpCartMoney(total);
    const go = document.getElementById('mpCheckout');
    if (go) go.disabled = !rows.length;
}

function mpOpenCart() {
    mpPaintCartDrawer();
    const root = document.getElementById('mpRoot');
    if (root && typeof mpPaintCartBadge === 'function') mpPaintCartBadge(root);
    document.getElementById('mpCartBack').hidden = false;
}

function mpCloseCart() {
    const back = document.getElementById('mpCartBack');
    if (back) back.hidden = true;
}

function mpBindCartDrawer(root) {
    mpEnsureCart();
    const btn = root.querySelector('#mpCartBtn');
    if (!btn || btn.dataset.cartBound) return;
    btn.dataset.cartBound = '1';
    btn.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        mpOpenCart();
    });
}
