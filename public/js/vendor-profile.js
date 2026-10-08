const VP_TOKEN_KEY = 'mtAuthToken:vendor';

function vpToken() {
    return localStorage.getItem(VP_TOKEN_KEY) || localStorage.getItem('mtAuthToken') || '';
}

function vpHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    const token = vpToken();
    if (token) headers.Authorization = 'Bearer ' + token;
    return headers;
}

async function vpFetch(path, options) {
    const response = await fetch('/api/vendor' + path, Object.assign({
        credentials: 'include',
        headers: vpHeaders()
    }, options || {}));
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || 'Request failed.');
    return data;
}

function vpNote(id, message, bad) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = message || '';
    el.classList.toggle('is-bad', Boolean(bad));
}

function vpPaintAvatar(profile) {
    const box = document.getElementById('vpAvatarPreview');
    if (!box) return;
    const image = profile.imageUrl || '';
    if (image) {
        box.style.backgroundImage = 'url("' + image.replace(/"/g, '') + '")';
        box.textContent = '';
        return;
    }
    box.style.backgroundImage = '';
    box.textContent = String(profile.ownerName || 'SK').trim().charAt(0).toUpperCase() || 'SK';
}

function vpFillProfile(profile) {
    document.getElementById('vpOwnerName').value = profile.ownerName || '';
    document.getElementById('vpShopkeeperId').value = profile.shopkeeperId || '';
    document.getElementById('vpShopName').value = profile.shopName || '';
    document.getElementById('vpPhone').value = profile.phone || '';
    document.getElementById('vpAddress').value = profile.address || '';
    document.getElementById('vpImageUrl').value = profile.imageUrl || '';
    document.getElementById('vpBioToggle').checked = Boolean(profile.biometricEnabled);
    vpPaintAvatar(profile);
    if (typeof applyShopProfile === 'function') {
        applyShopProfile({ shopName: profile.shopName, ownerName: profile.ownerName });
    }
}

async function vpLoadProfile() {
    const gate = document.getElementById('vpGate');
    const panels = document.getElementById('vpPanels');
    const out = document.getElementById('vpSignOut');
    try {
        const data = await vpFetch('/profile');
        gate.hidden = true;
        panels.hidden = false;
        out.hidden = false;
        vpFillProfile(data.profile);
    } catch (error) {
        gate.hidden = false;
        panels.hidden = true;
        out.hidden = true;
    }
}

function vpReadFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Could not read the image.'));
        reader.readAsDataURL(file);
    });
}

function vpB64ToBuf(value) {
    const text = String(value || '').replace(/-/g, '+').replace(/_/g, '/');
    const pad = '='.repeat((4 - (text.length % 4)) % 4);
    const raw = atob(text + pad);
    const out = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i += 1) out[i] = raw.charCodeAt(i);
    return out.buffer;
}

function vpBufToB64(buffer) {
    const bytes = new Uint8Array(buffer);
    let text = '';
    bytes.forEach((item) => { text += String.fromCharCode(item); });
    return btoa(text).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

async function vpRegisterBio() {
    if (!window.PublicKeyCredential) throw new Error('This device does not support thumb scan login.');
    const begin = await vpFetch('/security/webauthn/begin', { method: 'POST', body: '{}' });
    const credential = await navigator.credentials.create({
        publicKey: {
            challenge: vpB64ToBuf(begin.challenge),
            rp: begin.rp,
            user: {
                id: vpB64ToBuf(begin.user.id),
                name: begin.user.name,
                displayName: begin.user.displayName
            },
            pubKeyCredParams: begin.pubKeyCredParams,
            authenticatorSelection: begin.authenticatorSelection,
            timeout: begin.timeout
        }
    });
    const payload = {
        id: credential.id,
        rawId: vpBufToB64(credential.rawId),
        type: credential.type,
        response: {
            clientDataJSON: vpBufToB64(credential.response.clientDataJSON),
            attestationObject: vpBufToB64(credential.response.attestationObject)
        }
    };
    const data = await vpFetch('/security/webauthn/finish', {
        method: 'POST',
        body: JSON.stringify(payload)
    });
    vpFillProfile(data.profile);
    vpNote('vpBioNote', data.message || 'Thumb scan login enabled.');
}

function bindVendorProfile() {
    const root = document.getElementById('vpRoot');
    if (!root || root.dataset.bound) return;
    root.dataset.bound = '1';
    document.getElementById('vpImageFile').addEventListener('change', async (event) => {
        const file = event.target.files && event.target.files[0];
        if (!file) return;
        try {
            const dataUrl = await vpReadFile(file);
            document.getElementById('vpImageUrl').value = dataUrl;
            vpPaintAvatar({ imageUrl: dataUrl, ownerName: document.getElementById('vpOwnerName').value });
        } catch (error) {
            vpNote('vpProfileNote', error.message, true);
        }
    });
    document.getElementById('vpProfileForm').addEventListener('submit', async (event) => {
        event.preventDefault();
        try {
            const data = await vpFetch('/profile', {
                method: 'PUT',
                body: JSON.stringify({
                    ownerName: document.getElementById('vpOwnerName').value,
                    shopName: document.getElementById('vpShopName').value,
                    phone: document.getElementById('vpPhone').value,
                    address: document.getElementById('vpAddress').value,
                    imageUrl: document.getElementById('vpImageUrl').value
                })
            });
            vpFillProfile(data.profile);
            vpNote('vpProfileNote', data.message || 'Profile updated.');
        } catch (error) {
            vpNote('vpProfileNote', error.message, true);
        }
    });
    document.getElementById('vpPassForm').addEventListener('submit', async (event) => {
        event.preventDefault();
        const form = document.getElementById('vpPassForm');
        try {
            const data = await vpFetch('/security', {
                method: 'PUT',
                body: JSON.stringify({
                    currentPassword: document.getElementById('vpCurrentPass').value,
                    newPassword: document.getElementById('vpNewPass').value,
                    confirmPassword: document.getElementById('vpConfirmPass').value
                })
            });
            if (typeof resetPasswordFields === 'function') resetPasswordFields(form);
            else form.reset();
            if (typeof bindPasswordToggles === 'function') bindPasswordToggles(form);
            vpNote('vpPassNote', data.message || 'Password updated.');
            if (typeof showToast === 'function') showToast(data.message || 'Password updated.');
        } catch (error) {
            vpNote('vpPassNote', error.message, true);
            if (typeof showToast === 'function') showToast(error.message);
        }
    });
    document.getElementById('vpBioRegister').addEventListener('click', () => {
        vpRegisterBio().catch((error) => vpNote('vpBioNote', error.message, true));
    });
    document.getElementById('vpBioToggle').addEventListener('change', async (event) => {
        try {
            const data = await vpFetch('/security', {
                method: 'PUT',
                body: JSON.stringify({ biometricEnabled: event.target.checked })
            });
            vpFillProfile(data.profile);
            vpNote('vpBioNote', data.message || 'Security settings updated.');
        } catch (error) {
            event.target.checked = !event.target.checked;
            vpNote('vpBioNote', error.message, true);
        }
    });
    document.getElementById('vpSignOut').addEventListener('click', async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST', credentials: 'include', body: '{}' });
        } catch (error) {
            /* Clear local token anyway. */
        }
        localStorage.removeItem(VP_TOKEN_KEY);
        localStorage.removeItem('mtAuthToken');
        location.assign('/vendor/login');
    });
    disableAutofill(root);
    if (typeof bindPasswordToggles === 'function') bindPasswordToggles(root);
    vpLoadProfile();
}

async function loadVendorProfileSettings() {
    bindVendorProfile();
    await vpLoadProfile();
}
