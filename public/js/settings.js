function shopDisplayLabel(row) {
    if (!row) return '';
    return String(row.shopName || row.fullName || row.ownerName || row.name || '').trim();
}

function applyShopProfile(row) {
    if (!row) return;
    const label = shopDisplayLabel(row);
    const shop = document.getElementById('shopName');
    if (shop && (row.shopName || label)) shop.textContent = row.shopName || label;
    const owner = document.querySelector('.profile strong');
    if (owner && label) owner.textContent = label;
    const role = document.querySelector('.profile span');
    if (role) role.textContent = 'Shopkeeper';
    if (typeof topbarPaintAvatar === 'function') topbarPaintAvatar(row);
    else {
        const avatar = document.querySelector('.profile .avatar');
        const url = String(row.imageUrl || row.avatarUrl || row.avatar || row.profileImage || '').trim();
        if (avatar && url) {
            avatar.innerHTML = `<img class="avatar-img" src="${url.replace(/"/g, '&quot;')}" alt="">`;
        } else if (avatar && label) {
            avatar.textContent = label.charAt(0).toUpperCase();
        }
    }
    const title = document.querySelector('title');
    if (title && (row.shopName || label)) title.textContent = 'MarkiThon — ' + (row.shopName || label);
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
