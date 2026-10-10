function saAdminPassMarkup() {
    return `<section class="sa-card sa-pass-card">
        <h3>Profile Settings</h3>
        <p class="sa-note">Update Super Admin name, contact details, avatar, and password.</p>
        <div class="sa-profile-head">
            <div class="sa-profile-avatar" id="saAdminAvatar">A</div>
            <p class="sa-muted">Avatar preview updates when you save a valid image URL.</p>
        </div>
        <form id="saAdminProfileForm" class="sa-pass-form" autocomplete="off">
            <label>Full name
                <input id="saAdminName" name="saAdminName" autocomplete="name" placeholder="Super Admin" required>
            </label>
            <label>Email address
                <input id="saAdminEmail" name="saAdminEmail" type="email" autocomplete="username" required>
            </label>
            <label>Phone number
                <input id="saAdminPhone" name="saAdminPhone" type="tel" autocomplete="tel" placeholder="+92 300 0000000">
            </label>
            <label>Avatar image URL
                <input id="saAdminAvatarUrl" name="saAdminAvatarUrl" autocomplete="off" placeholder="https://...">
            </label>
            <button class="sa-add" type="submit">Save Profile</button>
            <p class="sa-note" id="saProfileNote"></p>
        </form>
        <h3 class="sa-pass-title">Change Password</h3>
        <form id="saAdminPassForm" class="sa-pass-form" autocomplete="off">
            <label>Current password
                <input id="saCurrentPass" name="saCurrentPass" type="password" autocomplete="current-password" required>
            </label>
            <label>New password
                <input id="saNewPass" name="saNewPass" type="password" autocomplete="new-password" required>
            </label>
            <label>Confirm new password
                <input id="saConfirmPass" name="saConfirmPass" type="password" autocomplete="new-password" required>
            </label>
            <button class="sa-add" type="submit">Update Password</button>
            <p class="sa-note" id="saPassNote"></p>
        </form>
    </section>`;
}

function saAdminPaintAvatar(user) {
    const box = document.getElementById('saAdminAvatar');
    if (!box) return;
    const url = (user && user.avatarUrl) || '';
    const name = (user && user.name) || 'Admin';
    if (url) {
        box.innerHTML = `<img src="${saText(url)}" alt="">`;
        return;
    }
    box.textContent = String(name).trim().charAt(0).toUpperCase() || 'A';
}

function saAdminApplyUser(user) {
    if (!user) return;
    saAdminUser = user;
    const name = document.getElementById('saAdminName');
    const email = document.getElementById('saAdminEmail');
    const phone = document.getElementById('saAdminPhone');
    const avatar = document.getElementById('saAdminAvatarUrl');
    if (name) name.value = user.name || '';
    if (email) email.value = user.email || '';
    if (phone) phone.value = user.phone || '';
    if (avatar) avatar.value = user.avatarUrl || '';
    saAdminPaintAvatar(user);
    if (typeof saPaintTop === 'function') saPaintTop();
}

async function saAdminProfileSubmit(event) {
    event.preventDefault();
    const note = document.getElementById('saProfileNote');
    if (note) note.textContent = '';
    try {
        const response = await fetch('/api/admin/profile', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                name: document.getElementById('saAdminName').value.trim(),
                email: document.getElementById('saAdminEmail').value.trim(),
                phone: document.getElementById('saAdminPhone').value.trim(),
                avatarUrl: document.getElementById('saAdminAvatarUrl').value.trim()
            })
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.message || 'Could not update the profile.');
        if (data.token) {
            localStorage.setItem('mtAuthToken:admin', data.token);
            localStorage.setItem('mtAuthToken', data.token);
        }
        saAdminApplyUser(data.user);
        if (note) note.textContent = 'Profile saved.';
    } catch (error) {
        if (note) note.textContent = error.message || 'Could not update the profile.';
    }
}

async function saAdminPassSubmit(event) {
    event.preventDefault();
    const note = document.getElementById('saPassNote');
    const current = document.getElementById('saCurrentPass').value;
    const next = document.getElementById('saNewPass').value;
    const confirm = document.getElementById('saConfirmPass').value;
    if (note) note.textContent = '';
    try {
        const response = await fetch('/api/admin/profile/password', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                currentPassword: current,
                newPassword: next,
                confirmPassword: confirm
            })
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.message || 'Could not update the password.');
        document.getElementById('saCurrentPass').value = '';
        document.getElementById('saNewPass').value = '';
        document.getElementById('saConfirmPass').value = '';
        if (note) note.textContent = data.message || 'Password updated.';
    } catch (error) {
        if (note) note.textContent = error.message || 'Could not update the password.';
    }
}

async function saLoadAdminProfile() {
    try {
        const response = await fetch('/api/admin/profile', { credentials: 'include' });
        if (!response.ok) return;
        const data = await response.json();
        saAdminApplyUser(data.user || {});
    } catch (error) {
        /* Fields stay empty until reload. */
    }
}

function saMountAdminPass() {
    const profile = document.getElementById('saAdminProfileForm');
    if (profile && !profile.dataset.bound) {
        profile.dataset.bound = '1';
        profile.addEventListener('submit', saAdminProfileSubmit);
    }
    const form = document.getElementById('saAdminPassForm');
    if (form && !form.dataset.bound) {
        form.dataset.bound = '1';
        form.addEventListener('submit', saAdminPassSubmit);
    }
    const avatarInput = document.getElementById('saAdminAvatarUrl');
    if (avatarInput && !avatarInput.dataset.bound) {
        avatarInput.dataset.bound = '1';
        avatarInput.addEventListener('input', () => {
            saAdminPaintAvatar({
                name: document.getElementById('saAdminName').value,
                avatarUrl: avatarInput.value.trim()
            });
        });
    }
    saLoadAdminProfile();
    if (typeof bindPasswordToggles === 'function') {
        bindPasswordToggles(document.getElementById('viewRoot') || document);
    }
}
