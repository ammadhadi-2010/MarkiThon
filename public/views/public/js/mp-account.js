function mpSafe(value) {
    return String(value || '').replace(/[&<>"']/g, (ch) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[ch]));
}

function mpMoney(value) {
    return 'Rs. ' + Number(value || 0).toLocaleString();
}

function mpOrderMarkup(order) {
    const delivery = order.delivery || {};
    const items = (order.items || []).map((item) => `${item.title} × ${item.qty}`).join(', ');
    return `
        <article class="mp-order">
            <strong>${mpSafe(order.orderNumber)}</strong>
            <span class="mp-status">${mpSafe(order.status)}</span>
            <p>${mpSafe(items) || 'Items unavailable'}</p>
            <p>${mpMoney(order.total)} · ${mpSafe(order.payment)}</p>
            <p>${mpSafe(delivery.method || 'Delivery')} · ${mpSafe(delivery.eta || 'Timing shared by the shop')}</p>
            <p>${mpSafe(delivery.address || 'Address on file with the shop')}</p>
            <a href="/profile/orders/${mpSafe(order.id)}">View order</a>
            ${delivery.trackingNumber && delivery.trackingNumber !== 'N/A'
                ? `<p>Tracking: ${mpSafe(delivery.trackingNumber)}</p>` : ''}
        </article>`;
}

async function mpPaintOrders() {
    const body = document.getElementById('mpAccountBody');
    body.innerHTML = '<p class="mp-auth-note">Loading orders...</p>';
    try {
        const data = await mpBuyerFetch('/orders');
        const rows = data.orders || [];
        body.innerHTML = rows.length
            ? rows.map(mpOrderMarkup).join('')
            : '<p class="mp-auth-note">No orders yet. Orders placed with this phone number appear here.</p>';
    } catch (error) {
        body.innerHTML = `<p class="mp-auth-error">${error.message}</p>`;
    }
}

function mpWishTitle(id) {
    const live = typeof mpLiveProducts !== 'undefined' ? mpLiveProducts : [];
    const store = typeof sfProducts !== 'undefined' ? sfProducts : [];
    const row = live.concat(store).find((item) => String(item.id) === String(id));
    return row && row.title ? row.title : 'Saved product';
}

function mpPaintWishlist() {
    const ids = (mpBuyer.preferences && mpBuyer.preferences.wishlist) || [];
    const body = document.getElementById('mpAccountBody');
    body.innerHTML = ids.length
        ? `<ul>${ids.map((id) => `<li>${mpSafe(mpWishTitle(id))}</li>`).join('')}</ul>`
        : '<p class="mp-auth-note">Your wishlist is empty. Tap the heart on a product to save it.</p>';
}

function mpPaintSettings() {
    const prefs = mpBuyer.preferences || {};
    const body = document.getElementById('mpAccountBody');
    body.innerHTML = `
        <form id="mpPrefForm" autocomplete="off">
            <label>Display name
                <input id="mpPrefName" name="prefName" autocomplete="off" value="${mpSafe(mpBuyer.name)}">
            </label>
            <label>Delivery note
                <textarea id="mpPrefNote" name="prefNote" autocomplete="off" rows="3">${mpSafe(prefs.deliveryNote)}</textarea>
            </label>
            <label><input id="mpPrefNotify" name="prefNotify" type="checkbox" autocomplete="off" ${prefs.notifyOrders !== false ? 'checked' : ''}> Email or phone updates for order status</label>
            <button type="submit" class="mp-cta">Save preferences</button>
            <p class="mp-auth-error" id="mpPrefError" hidden></p>
        </form>`;
    body.querySelector('#mpPrefForm').addEventListener('submit', mpSavePrefs);
}

async function mpSavePrefs(event) {
    event.preventDefault();
    const error = document.getElementById('mpPrefError');
    try {
        const data = await mpBuyerFetch('/me', {
            method: 'PATCH',
            body: JSON.stringify({
                name: document.getElementById('mpPrefName').value,
                deliveryNote: document.getElementById('mpPrefNote').value,
                notifyOrders: document.getElementById('mpPrefNotify').checked
            })
        });
        mpBuyer = data.buyer;
        document.getElementById('mpAccountWho').textContent = mpBuyer.name;
        error.hidden = true;
    } catch (err) {
        error.hidden = false;
        error.textContent = err.message;
    }
}

function mpPaintWallet() {
    const body = document.getElementById('mpAccountBody');
    body.innerHTML = `
        <p class="mp-auth-note">MarkiThon Wallet</p>
        <p><strong>Available balance</strong></p>
        <p class="mp-auth-note">Rs. 0</p>
        <p class="mp-auth-note">Wallet credits from refunds and shop offers will appear here.</p>`;
}

function mpOpenAccount(panel) {
    if (!mpBuyer) {
        mpOpenAuth('login');
        return;
    }
    const titles = {
        orders: 'My Orders',
        wishlist: 'Wishlist',
        settings: 'Account Settings',
        wallet: 'Wallet'
    };
    document.getElementById('mpAccountTitle').textContent = titles[panel] || 'My Orders';
    const who = [mpBuyer.name, mpBuyer.email, mpBuyer.phone].filter(Boolean).join(' · ');
    document.getElementById('mpAccountWho').textContent = who;
    document.getElementById('mpAccountDrawer').hidden = false;
    if (panel === 'wishlist') mpPaintWishlist();
    else if (panel === 'settings') mpPaintSettings();
    else if (panel === 'wallet') mpPaintWallet();
    else mpPaintOrders();
}

function mpCloseAccount() {
    const drawer = document.getElementById('mpAccountDrawer');
    if (drawer) drawer.hidden = true;
}

function mpBindAccountDrawer() {
    document.getElementById('mpAccountClose').addEventListener('click', mpCloseAccount);
    document.getElementById('mpAccountDrawer').addEventListener('click', (event) => {
        if (event.target.id === 'mpAccountDrawer') mpCloseAccount();
    });
}

function mpPaintHearts(root) {
    const ids = (mpBuyer && mpBuyer.preferences && mpBuyer.preferences.wishlist) || [];
    (root || document).querySelectorAll('[data-wish]').forEach((btn) => {
        const on = ids.includes(btn.getAttribute('data-wish'));
        btn.classList.toggle('on', on);
        btn.textContent = on ? '♥' : '♡';
    });
}

async function mpToggleWish(btn) {
    if (!mpBuyer) {
        mpOpenAuth('login');
        return;
    }
    const id = btn.getAttribute('data-wish');
    const current = (mpBuyer.preferences && mpBuyer.preferences.wishlist) || [];
    const wishlist = current.includes(id) ? current.filter((item) => item !== id) : current.concat(id);
    const data = await mpBuyerFetch('/me', { method: 'PATCH', body: JSON.stringify({ wishlist }) });
    mpBuyer = data.buyer;
    mpPaintHearts(document);
}
