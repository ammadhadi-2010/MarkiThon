function mpOrderWhen(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function mpOrderButton(order) {
    const number = mpSafe(order.orderNumber || order.id);
    const id = mpSafe(order.id);
    return `<button type="button" class="rpt-btn" data-report="order" data-role="Customer" data-target="${number}" data-order="${number}" data-order-id="${id}">Report Issue / Dispute Order</button>`;
}

function mpOrderListCard(order) {
    const delivery = order.delivery || {};
    const items = (order.items || []).map((item) => `${item.title} × ${item.qty}`).join(', ');
    return `<article class="mp-order">
        <a href="/profile/orders/${mpSafe(order.id)}"><strong>${mpSafe(order.orderNumber)}</strong></a>
        <span class="mp-status">${mpSafe(order.status)}</span>
        <p>${mpSafe(items) || 'Items unavailable'}</p>
        <p>${mpMoney(order.total)} · ${mpSafe(order.payment)} · ${mpSafe(mpOrderWhen(order.createdAt))}</p>
        <p>${mpSafe(delivery.method || 'Delivery')} · ${mpSafe(delivery.eta || 'Timing shared by the shop')}</p>
        ${mpOrderButton(order)}
    </article>`;
}

function mpOrderDetail(order) {
    const delivery = order.delivery || {};
    const items = (order.items || []).map((item) =>
        `<li>${mpSafe(item.title)} × ${mpSafe(item.qty)} · ${mpMoney(item.total)}</li>`
    ).join('') || '<li>Items unavailable</li>';
    return `<p><a href="/profile/orders">Back to order history</a></p>
        <article class="mp-order">
            <h1>Order ${mpSafe(order.orderNumber)}</h1>
            <span class="mp-status">${mpSafe(order.status)}</span>
            <p>Order ID ${mpSafe(order.id)} · ${mpSafe(mpOrderWhen(order.createdAt))}</p>
            <ul>${items}</ul>
            <p>${mpMoney(order.total)} · ${mpSafe(order.payment)}</p>
            <p>${mpSafe(delivery.method || 'Delivery')} · ${mpSafe(delivery.eta || 'Timing shared by the shop')}</p>
            <p>${mpSafe(delivery.address || 'Address on file with the shop')}</p>
            ${delivery.trackingNumber && delivery.trackingNumber !== 'N/A'
                ? `<p>Tracking: ${mpSafe(delivery.trackingNumber)}</p>` : ''}
            ${mpOrderButton(order)}
        </article>`;
}

function mpOrdersGuest() {
    return `<h1>Order History</h1>
        <p>Sign in to see orders placed with this account and report a delayed, damaged, or incorrect item.</p>
        <button type="button" class="mp-cta" id="mpOrdersSign">Sign In</button>`;
}

async function mpMountOrders(id) {
    const page = document.getElementById('mpOrdersPage');
    if (!page) return;
    if (typeof mpLoadBuyer === 'function') await mpLoadBuyer();
    if (!mpBuyer) {
        page.innerHTML = mpOrdersGuest();
        const sign = document.getElementById('mpOrdersSign');
        if (sign) sign.addEventListener('click', () => mpOpenAuth('login'));
        return;
    }
    page.innerHTML = '<p class="mp-auth-note">Loading orders...</p>';
    try {
        const data = await mpBuyerFetch('/orders');
        const rows = data.orders || [];
        if (id) {
            const order = rows.find((row) => String(row.id) === String(id));
            page.innerHTML = order ? mpOrderDetail(order) : '<h1>Order History</h1><p>That order is not on this account.</p><p><a href="/profile/orders">Back to order history</a></p>';
            return;
        }
        page.innerHTML = `<h1>Order History</h1>
            <p>Report a delayed, damaged, or incorrect item from the order it belongs to.</p>
            ${rows.length ? rows.map(mpOrderListCard).join('') : '<p class="mp-auth-note">No orders yet. Orders placed with this phone number appear here.</p>'}`;
    } catch (error) {
        page.innerHTML = `<h1>Order History</h1><p class="mp-auth-error">${mpSafe(error.message)}</p>`;
    }
}
