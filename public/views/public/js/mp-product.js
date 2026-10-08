function mpReadCart() {
    try {
        const rows = JSON.parse(localStorage.getItem('mpCart') || '[]');
        return Array.isArray(rows) ? rows : [];
    } catch (error) {
        return [];
    }
}

function mpCartCount() {
    return mpReadCart().reduce((sum, row) => sum + (Number(row.qty) || 1), 0);
}

function mpPaintCartBadge(root) {
    const badge = root.querySelector('#mpCartBadge');
    if (badge) badge.textContent = String(mpCartCount());
}

function mpCartSource(id) {
    const lists = [];
    if (typeof mpLiveProducts !== 'undefined') lists.push(mpLiveProducts);
    if (typeof MP_PRODUCTS !== 'undefined') lists.push(MP_PRODUCTS);
    for (let i = 0; i < lists.length; i += 1) {
        const hit = lists[i].find((row) => String(row.id) === String(id));
        if (hit) return hit;
    }
    return null;
}

function mpAddToCart(id, qty) {
    const amount = Number(qty) || 1;
    const product = mpCartSource(id);
    const price = product ? Number(product.salePrice || product.retailPrice || 0) : 0;
    const image = product ? ((product.images && product.images[0]) || product.imageUrl || '') : '';
    const title = product && product.title ? product.title : 'Product';
    const cart = mpReadCart();
    const hit = cart.find((row) => String(row.id) === String(id));
    if (hit) {
        hit.qty = (Number(hit.qty) || 1) + amount;
        hit.title = hit.title || title;
        hit.price = hit.price || price;
        hit.image = hit.image || image;
    } else {
        cart.push({ id, title, price, image, qty: amount });
    }
    localStorage.setItem('mpCart', JSON.stringify(cart));
    if (typeof mpOpenCart === 'function') mpOpenCart();
}

function mpToggleWish(root) {
    const wish = root.querySelector('#mpWish');
    if (!wish) return;
    wish.classList.toggle('on');
    wish.textContent = wish.classList.contains('on') ? '♥' : '♡';
}

function mpShowSlide(root, btn, total) {
    const img = root.querySelector('#mpMainImg');
    img.src = btn.dataset.src;
    root.querySelectorAll('#mpThumbs button').forEach((el) => el.classList.toggle('on', el === btn));
    const count = root.querySelector('#mpCount');
    const index = Number(btn.dataset.mpi) + 1;
    if (count) count.textContent = `${index}/${total}`;
}

function mpBindProduct(root, id) {
    const row = mpFindProduct(id);
    const zoom = root.querySelector('#mpZoom');
    const img = root.querySelector('#mpMainImg');
    if (zoom && img) {
        zoom.addEventListener('mousemove', (event) => {
            const box = zoom.getBoundingClientRect();
            const x = ((event.clientX - box.left) / box.width) * 100;
            const y = ((event.clientY - box.top) / box.height) * 100;
            img.style.transformOrigin = x + '% ' + y + '%';
            img.classList.add('zoom');
        });
        zoom.addEventListener('mouseleave', () => img.classList.remove('zoom'));
    }
    const thumbs = root.querySelector('#mpThumbs');
    if (thumbs) {
        thumbs.addEventListener('click', (event) => {
            const more = event.target.closest('[data-mpmore]')
                || event.target.closest('button')?.querySelector('[data-mpmore]');
            if (more) {
                thumbs.innerHTML = row.images.map((src, i) =>
                    `<button type="button" class="${i === 3 ? 'on' : ''}" data-src="${mpEscape(src)}" data-mpi="${i}"><img src="${mpEscape(src)}" alt=""></button>`
                ).join('');
                const current = thumbs.querySelector('[data-mpi="3"]');
                if (current) mpShowSlide(root, current, row.images.length);
                return;
            }
            const btn = event.target.closest('[data-src]');
            if (btn) mpShowSlide(root, btn, row.images.length);
        });
    }
    const qtyInput = root.querySelector('#mpQty');
    function qty() {
        const next = Math.max(1, Number(qtyInput && qtyInput.value) || 1);
        if (qtyInput) qtyInput.value = String(next);
        return next;
    }
    root.querySelector('#mpQtyMinus')?.addEventListener('click', () => {
        if (qtyInput) qtyInput.value = String(Math.max(1, qty() - 1));
    });
    root.querySelector('#mpQtyPlus')?.addEventListener('click', () => {
        if (qtyInput) qtyInput.value = String(qty() + 1);
    });
    root.querySelector('#mpAddCart')?.addEventListener('click', () => {
        mpAddToCart(id, qty());
        mpPaintCartBadge(root);
        root.querySelector('#mpAddCart').textContent = 'Added';
    });
    root.querySelector('#mpBuyNow')?.addEventListener('click', () => {
        mpAddToCart(id, qty());
        mpPaintCartBadge(root);
        window.location.href = '/contact';
    });
    root.querySelector('#mpWish')?.addEventListener('click', () => mpToggleWish(root));
    root.querySelector('#mpWishLink')?.addEventListener('click', () => mpToggleWish(root));
    root.addEventListener('click', (event) => {
        if (event.target.closest('#mpWrite') && typeof mpOpenReview === 'function') mpOpenReview(root, id);
    });
    root.querySelector('#mpShare')?.addEventListener('click', async () => {
        const share = root.querySelector('#mpShare');
        const url = location.href;
        try {
            await navigator.clipboard.writeText(url);
        } catch (error) {
            const box = document.createElement('input');
            box.value = url;
            box.setAttribute('autocomplete', 'off');
            document.body.appendChild(box);
            box.select();
            document.execCommand('copy');
            box.remove();
        }
        share.textContent = 'Link copied';
    });
}

function mpBindHearts(root) {
    if (typeof mpPaintHearts === 'function') mpPaintHearts(root);
    root.querySelectorAll('[data-wish]').forEach((btn) => {
        btn.addEventListener('click', (event) => {
            event.preventDefault();
            if (typeof mpToggleWish === 'function') {
                mpToggleWish(btn).catch(() => {});
                return;
            }
            btn.classList.toggle('on');
            btn.textContent = btn.classList.contains('on') ? '♥' : '♡';
        });
    });
}
