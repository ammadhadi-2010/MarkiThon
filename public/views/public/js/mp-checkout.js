let mpCheckStep = 1;
let mpCheckPay = 'COD';
let mpShip = { name: '', phone: '', address: '', city: '' };
let mpPlacing = false;

function mpCheckEsc(value) {
    return typeof mpEscape === 'function' ? mpEscape(value) : String(value || '');
}

function mpCheckoutMarkup() {
    return `
    <div class="mp-check-back" id="mpCheckBack" hidden>
        <form class="mp-check-card" id="mpCheckForm" autocomplete="off">
            <div class="mp-check-head">
                <h2>Checkout</h2>
                <button type="button" id="mpCheckClose" aria-label="Close">×</button>
            </div>
            <div class="mp-steps" id="mpSteps">
                <span class="on">Shipping</span>
                <span>Payment</span>
                <span>Review</span>
            </div>
            <div id="mpCheckBody"></div>
            <p class="mp-check-note" id="mpCheckNote" hidden></p>
            <div class="mp-check-actions">
                <button type="button" id="mpCheckBackBtn">Back</button>
                <button type="button" class="mp-checkout" id="mpCheckNext">Continue</button>
            </div>
        </form>
    </div>`;
}

function mpCheckField(id, label, value, placeholder) {
    return `<label>${label}<input id="${id}" name="${id}" autocomplete="off" value="${mpCheckEsc(value)}" placeholder="${placeholder}"></label>`;
}

function mpCheckShip() {
    const buyer = typeof mpBuyer !== 'undefined' && mpBuyer ? mpBuyer : {};
    return `
        ${mpCheckField('mpShipName', 'Full name', mpShip.name || buyer.name || '', 'Your name')}
        ${mpCheckField('mpShipPhone', 'Phone', mpShip.phone || buyer.phone || '', '03xx')}
        ${mpCheckField('mpShipAddress', 'Street address', mpShip.address, 'House, street')}
        ${mpCheckField('mpShipCity', 'City', mpShip.city, 'City')}`;
}

function mpCheckPayMarkup() {
    const cod = mpCheckPay === 'COD' ? ' checked' : '';
    const wallet = mpCheckPay === 'Mobile Wallet' ? ' checked' : '';
    return `
        <label class="mp-pay"><input type="radio" name="mpPay" value="COD" autocomplete="off"${cod}> Cash on Delivery</label>
        <label class="mp-pay"><input type="radio" name="mpPay" value="Mobile Wallet" autocomplete="off"${wallet}> Mobile Wallet</label>`;
}

function mpCheckReview() {
    const rows = typeof mpReadCart === 'function' ? mpReadCart() : [];
    const lines = rows.map((row) => {
        const qty = Number(row.qty) || 1;
        return `<li>${mpCheckEsc(row.title)} × ${qty} — ${mpCartMoney((Number(row.price) || 0) * qty)}</li>`;
    }).join('');
    const total = rows.reduce((sum, row) => sum + (Number(row.price) || 0) * (Number(row.qty) || 1), 0);
    return `
        <ul class="mp-review">${lines}</ul>
        <p><strong>${mpCheckEsc(mpShip.name)}</strong><br>${mpCheckEsc(mpShip.phone)}<br>${mpCheckEsc(mpShip.address)}, ${mpCheckEsc(mpShip.city)}</p>
        <p>Payment: ${mpCheckEsc(mpCheckPay)}</p>
        <p class="mp-review-total">Subtotal ${mpCartMoney(total)}</p>`;
}

function mpPaintCheckout() {
    const body = document.getElementById('mpCheckBody');
    const next = document.getElementById('mpCheckNext');
    const back = document.getElementById('mpCheckBackBtn');
    document.querySelectorAll('#mpSteps span').forEach((step, index) => {
        step.classList.toggle('on', index + 1 === mpCheckStep);
    });
    if (mpCheckStep === 1) body.innerHTML = mpCheckShip();
    else if (mpCheckStep === 2) body.innerHTML = mpCheckPayMarkup();
    else body.innerHTML = mpCheckReview();
    back.hidden = mpCheckStep === 1;
    next.textContent = mpCheckStep === 3 ? 'Place Order' : 'Continue';
}

function mpReadShip() {
    return {
        name: document.getElementById('mpShipName').value.trim(),
        phone: document.getElementById('mpShipPhone').value.trim(),
        address: document.getElementById('mpShipAddress').value.trim(),
        city: document.getElementById('mpShipCity').value.trim()
    };
}

function mpCheckNote(text) {
    const note = document.getElementById('mpCheckNote');
    note.hidden = !text;
    note.textContent = text || '';
}

function mpShipValid(ship) {
    if (ship.name.length < 2) return 'Enter your full name.';
    if (ship.phone.replace(/\D/g, '').length < 7) return 'Enter a phone number.';
    if (ship.address.length < 4 || ship.city.length < 2) return 'Enter the street address and city.';
    return '';
}

function mpWaLink(phone, text) {
    const digits = String(phone || '').replace(/\D/g, '');
    if (!digits) return '';
    const intl = digits.startsWith('0') ? '92' + digits.slice(1) : digits;
    return 'https://wa.me/' + intl + '?text=' + encodeURIComponent(text);
}

function mpOrderText(order, ship) {
    const rows = typeof mpReadCart === 'function' ? mpReadCart() : [];
    const lines = rows.map((row) => `${row.title} x ${row.qty} = ${mpCartMoney((Number(row.price) || 0) * row.qty)}`);
    return [
        'New MarkiThon order ' + order.orderNumber,
        'Customer: ' + ship.name,
        'Phone: ' + ship.phone,
        'Address: ' + ship.address + ', ' + ship.city,
        'Payment: ' + mpCheckPay
    ].concat(lines, ['Total: ' + mpCartMoney(order.total)]).join('\n');
}

async function mpPlaceOrder(popup) {
    if (mpPlacing) return;
    mpPlacing = true;
    const ship = mpShip;
    const rows = mpReadCart().map((row) => Object.assign({}, row, { image: mpCartPicture(row) }));
    const token = localStorage.getItem('mpBuyerToken') || '';
    const res = await fetch('/api/online-store/orders', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: token ? 'Bearer ' + token : ''
        },
        body: JSON.stringify({
            source: 'checkout',
            customerName: ship.name,
            customerPhone: ship.phone,
            address: ship.address + ', ' + ship.city,
            whatsapp: ship.phone,
            payment: mpCheckPay,
            status: 'New',
            note: 'Marketplace checkout',
            items: rows.map((row) => ({
                title: row.title, qty: Number(row.qty) || 1, price: Number(row.price) || 0,
                image: row.image || '', sku: String(row.id || '')
            }))
        })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Could not place the order.');
    let shopPhone = '';
    try {
        const brand = await fetch('/api/online-store/branding');
        const info = await brand.json();
        shopPhone = info.whatsappNumber || '';
    } catch (error) {
        shopPhone = '';
    }
    const link = mpWaLink(shopPhone, mpOrderText(data.order, ship));
    if (link && popup) popup.location = link;
    else if (popup) popup.close();
    mpWriteCart([]);
    mpCloseCart();
    document.getElementById('mpCheckBody').innerHTML = `
        <p class="mp-review-total">Order ${mpCheckEsc(data.order.orderNumber)} placed.</p>
        <p>The shopkeeper orders list now includes this order.</p>
        ${link ? `<a class="mp-wa" href="${link}" target="_blank" rel="noopener">Open WhatsApp summary</a>` : '<p>Add a shop WhatsApp number to send the summary.</p>'}`;
    document.getElementById('mpCheckNext').hidden = true;
    document.getElementById('mpCheckBackBtn').hidden = true;
    mpPlacing = false;
}

function mpCheckAdvance() {
    mpCheckNote('');
    if (mpCheckStep === 1) {
        mpShip = mpReadShip();
        const error = mpShipValid(mpShip);
        if (error) return mpCheckNote(error);
        mpCheckStep = 2;
        return mpPaintCheckout();
    }
    if (mpCheckStep === 2) {
        const picked = document.querySelector('input[name="mpPay"]:checked');
        mpCheckPay = picked ? picked.value : 'COD';
        mpCheckStep = 3;
        return mpPaintCheckout();
    }
    const popup = window.open('about:blank', '_blank');
    mpPlaceOrder(popup).catch((error) => {
        mpPlacing = false;
        if (popup) popup.close();
        mpCheckNote(error.message || 'Could not place the order.');
    });
}

function mpEnsureCheckout() {
    if (document.getElementById('mpCheckBack')) return;
    document.body.insertAdjacentHTML('beforeend', mpCheckoutMarkup());
    document.getElementById('mpCheckClose').addEventListener('click', mpCloseCheckout);
    document.getElementById('mpCheckBack').addEventListener('click', (event) => {
        if (event.target.id === 'mpCheckBack') mpCloseCheckout();
    });
    document.getElementById('mpCheckBackBtn').addEventListener('click', () => {
        mpCheckStep = Math.max(1, mpCheckStep - 1);
        mpCheckNote('');
        mpPaintCheckout();
    });
    document.getElementById('mpCheckForm').addEventListener('submit', (event) => {
        event.preventDefault();
        mpCheckAdvance();
    });
    document.getElementById('mpCheckNext').addEventListener('click', mpCheckAdvance);
}

function mpOpenCheckout() {
    const rows = typeof mpReadCart === 'function' ? mpReadCart() : [];
    if (!rows.length) return;
    mpCheckStep = 1;
    mpCheckPay = 'COD';
    mpEnsureCheckout();
    document.getElementById('mpCheckNext').hidden = false;
    mpCheckNote('');
    mpPaintCheckout();
    document.getElementById('mpCheckBack').hidden = false;
}

function mpCloseCheckout() {
    const back = document.getElementById('mpCheckBack');
    if (back) back.hidden = true;
}
