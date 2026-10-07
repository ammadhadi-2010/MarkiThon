function applyShopProfile(row) {
    if (!row) return;
    const shop = document.getElementById('shopName');
    if (shop && row.shopName) shop.textContent = row.shopName;
    const owner = document.querySelector('.profile strong');
    if (owner && row.ownerName) owner.textContent = row.ownerName;
    const role = document.querySelector('.profile span');
    if (role) role.textContent = 'Shopkeeper';
    const avatar = document.querySelector('.profile .avatar');
    if (avatar && row.ownerName) avatar.textContent = String(row.ownerName).trim().charAt(0).toUpperCase();
    const title = document.querySelector('title');
    if (title && row.shopName) title.textContent = 'MarkiThon — ' + row.shopName;
}

async function loadShopProfile() {
    const row = await api.get('/api/profile');
    applyShopProfile(row);
    return row;
}

document.addEventListener('DOMContentLoaded', () => {
    loadShopProfile().catch((err) => {
        if (typeof showToast === 'function') showToast(err.message);
    });
});
