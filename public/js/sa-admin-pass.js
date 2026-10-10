function saAdminPassMarkup() {
    return `<section class="sa-card sa-pass-card" id="saPassCard">
        <h3>Profile Settings</h3>
        <p class="sa-note">Update Super Admin name, contact details, avatar, and password.</p>
        <div class="sa-profile-head">
            <div class="sa-profile-avatar" id="saAdminAvatar">A</div>
            <div class="sa-profile-upload">
                <label class="sa-file-label">Profile photo
                    <input id="saAdminAvatarFile" type="file" accept="image/png,image/jpeg,image/jpg,image/webp">
                </label>
                <p class="sa-muted" id="saAvatarNote">PNG, JPG, or WebP up to 2 MB.</p>
            </div>
        </div>
        <form id="saAdminProfileForm" class="sa-pass-form" autocomplete="off">
            <label>Full name
                <input id="saAdminName" name="saAdminName" autocomplete="name" placeholder="Super Admin" required>
            </label>
            <label>Email address
                <input id="saAdminEmail" name="saAdminEmail" type="email" autocomplete="username" required>
            </label>
            <label>Phone number
                <input id="saAdminPhone" name="saAdminPhone" type="tel" autocomplete="tel" inputmode="tel">
            </label>
            <button class="sa-add" type="submit">Save Profile</button>
            <p class="sa-note" id="saProfileNote"></p>
        </form>
        <h3 class="sa-pass-title">Change Password</h3>
        <form id="saAdminPassForm" class="sa-pass-form sa-pass-form--secret" autocomplete="off">
            <label>Current password
                <input id="saCurrentPass" name="saCurrentPass" type="password" autocomplete="off" required>
            </label>
            <label>New password
                <input id="saNewPass" name="saNewPass" type="password" autocomplete="off" required>
            </label>
            <label>Confirm new password
                <input id="saConfirmPass" name="saConfirmPass" type="password" autocomplete="off" required>
            </label>
            <button class="sa-add" type="submit">Update Password</button>
            <p class="sa-pass-badge is-ok" id="saPassSuccess" hidden role="status">Password updated successfully</p>
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

function saAdminPhoneFromUser(user) {
    if (!user) return '';
    return String(user.phone || user.phoneNumber || '').trim();
}

function saAdminSyncFormFields(user) {
    if (!user) return;
    const name = document.getElementById('saAdminName');
    const email = document.getElementById('saAdminEmail');
    const phone = document.getElementById('saAdminPhone');
    if (name) name.value = user.name || '';
    if (email) email.value = user.email || '';
    if (phone) {
        phone.value = saAdminPhoneFromUser(user);
        phone.placeholder = phone.value ? '' : 'Add mobile number';
    }
    saAdminPaintAvatar(user);
}

let saPassBadgeTimer = 0;

function saShowPassSuccess() {
    const badge = document.getElementById('saPassSuccess');
    if (saPassBadgeTimer) window.clearTimeout(saPassBadgeTimer);
    if (badge) badge.hidden = false;
    if (typeof saShowToast === 'function') saShowToast('Password updated successfully', 'success');
    saPassBadgeTimer = window.setTimeout(() => {
        if (badge) badge.hidden = true;
        saPassBadgeTimer = 0;
    }, 4000);
}

function saAdminRefreshUser(user) {
    if (!user) return;
    saAdminUser = user;
    saAdminSyncFormFields(user);
    if (typeof saPaintTop === 'function' && document.getElementById('saTop')) saPaintTop();
}

function saAdminApplyUser(user) {
    saAdminRefreshUser(user);
}

async function saAdminProfileSubmit(event) {
    event.preventDefault();
    const note = document.getElementById('saProfileNote');
    if (note) note.textContent = '';
    try {
        const body = {
            name: document.getElementById('saAdminName').value.trim(),
            email: document.getElementById('saAdminEmail').value.trim(),
            phone: document.getElementById('saAdminPhone').value.trim()
        };
        if (saAdminUser && saAdminUser.avatarUrl) body.avatarUrl = saAdminUser.avatarUrl;
        const response = await fetch('/api/admin/profile', {
            method: 'PUT',
            credentials: 'include',
            body: JSON.stringify(body)
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.message || 'Could not update the profile.');
        if (data.token) {
            localStorage.setItem('mtAuthToken:admin', data.token);
            localStorage.setItem('mtAuthToken', data.token);
        }
        saAdminRefreshUser(data.user);
        if (note) note.textContent = 'Profile saved.';
        if (typeof saShowToast === 'function') saShowToast('Profile saved.', 'success');
    } catch (error) {
        if (note) note.textContent = error.message || 'Could not update the profile.';
    }
}

async function saAdminPassSubmit(event) {
    event.preventDefault();
    event.stopPropagation();
    const note = document.getElementById('saPassNote');
    const badge = document.getElementById('saPassSuccess');
    const form = document.getElementById('saAdminPassForm');
    const current = document.getElementById('saCurrentPass').value;
    const next = document.getElementById('saNewPass').value;
    const confirm = document.getElementById('saConfirmPass').value;
    if (note) note.textContent = '';
    if (badge) badge.hidden = true;
    try {
        const response = await fetch('/api/admin/profile/password', {
            method: 'PUT',
            credentials: 'include',
            body: JSON.stringify({
                currentPassword: current,
                newPassword: next,
                confirmPassword: confirm
            })
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.message || 'Could not update the password.');
        if (typeof resetPasswordFields === 'function' && form) resetPasswordFields(form);
        else {
            document.getElementById('saCurrentPass').value = '';
            document.getElementById('saNewPass').value = '';
            document.getElementById('saConfirmPass').value = '';
        }
        saShowPassSuccess();
    } catch (error) {
        if (badge) badge.hidden = true;
        if (note) note.textContent = error.message || 'Could not update the password.';
    }
}

async function saLoadAdminProfile() {
    try {
        const response = await fetch('/api/admin/profile', { credentials: 'include' });
        if (!response.ok) return;
        const data = await response.json();
        const user = data.user || data.profile || {};
        saAdminUser = Object.assign({}, saAdminUser || {}, user, {
            phone: saAdminPhoneFromUser(user)
        });
        saAdminSyncFormFields(saAdminUser);
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
    if (typeof saBindAdminAvatarInput === 'function') saBindAdminAvatarInput();
    saLoadAdminProfile();
    if (typeof bindPasswordToggles === 'function') {
        bindPasswordToggles(document.getElementById('saAdminPassForm'));
    }
}
