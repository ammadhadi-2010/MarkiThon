function waDigits(phone) {
    let digits = String(phone || '').replace(/\D/g, '');
    if (digits.startsWith('00')) digits = digits.slice(2);
    if (digits.startsWith('0')) digits = '92' + digits.slice(1);
    return digits;
}

function productShareCaption(product, shop) {
    const name = (shop && shop.shopName) || 'Ammad Hadi Stor';
    const price = Number((product && (product.retailPrice || product.wholesalePrice)) || 0);
    const unit = (product && product.stockUnit) || 'Meter';
    const phone = waDigits((shop && (shop.whatsappNumber || shop.phoneNumber)) || '');
    const order = phone ? 'https://wa.me/' + phone : 'WhatsApp not set';
    const address = (shop && (shop.shopAddress || shop.storeLocation)) || '';
    return name
        + '\n\nTitle: ' + (product.title || '-')
        + '\nPrice: Rs. ' + price.toLocaleString() + ' / ' + unit
        + '\nWhatsApp order: ' + order
        + '\nShop Address: ' + address;
}

function closeShareModal() {
    const modal = document.getElementById('invShareModal');
    if (modal) modal.hidden = true;
}

async function openShareModal(product) {
    const modal = document.getElementById('invShareModal');
    if (!modal || !product) return;
    const shop = await api.get('/api/onboarding/step-1');
    const caption = productShareCaption(product, shop || {});
    document.getElementById('invShareText').textContent = caption;
    modal.dataset.facebook = (shop && shop.facebookPage) || '';
    modal.hidden = false;
}

async function copyShareCaption() {
    const text = document.getElementById('invShareText').textContent;
    await navigator.clipboard.writeText(text);
    showToast('Caption copied to clipboard.');
}

function openShopFacebook() {
    const url = document.getElementById('invShareModal').dataset.facebook;
    if (!url) return showToast('Facebook page is not saved in shop setup.');
    window.open(url, '_blank', 'noopener');
}

function shareViaWhatsApp() {
    const text = document.getElementById('invShareText').textContent;
    window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank', 'noopener');
}

function bindInventoryShare() {
    const modal = document.getElementById('invShareModal');
    if (!modal) return;
    document.getElementById('invCopyCaption').addEventListener('click', () => {
        copyShareCaption().catch(() => showToast('Could not copy caption.'));
    });
    document.getElementById('invOpenFacebook').addEventListener('click', openShopFacebook);
    document.getElementById('invShareWhatsApp').addEventListener('click', shareViaWhatsApp);
    document.getElementById('invShareClose').addEventListener('click', closeShareModal);
    modal.addEventListener('click', (event) => {
        if (event.target === modal) closeShareModal();
    });
}
