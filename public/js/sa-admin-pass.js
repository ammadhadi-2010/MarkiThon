function saAdminPassMarkup() {
    return `<section class="sa-card sa-pass-card">
        <h3>Admin Profile</h3>
        <p class="sa-note">Update Super Admin identity and password for this panel.</p>
        <form id="saAdminProfileForm" class="sa-pass-form" autocomplete="off">
            <label>Display name
                <input id="saAdminName" name="saAdminName" autocomplete="off" placeholder="Super Admin" required>
            </label>
            <label>Email
                <input id="saAdminEmail" name="saAdminEmail" type="email" autocomplete="off" placeholder="admin@markithon.com" required>
            </label>
            <button class="sa-add" type="submit">Save Profile</button>
            <p class="sa-note" id="saProfileNote"></p>
        </form>
        <form id="saAdminPassForm" class="sa-pass-form" autocomplete="off">
            <label>New Password
                <input id="saNewPass" name="saNewPass" type="password" autocomplete="off" placeholder="At least 6 characters" required>
            </label>
            <label>Confirm Password
                <input id="saConfirmPass" name="saConfirmPass" type="password" autocomplete="off" placeholder="Re-enter new password" required>
            </label>
            <button class="sa-add" type="submit">Update Password</button>
            <p class="sa-note" id="saPassNote"></p>
        </form>
    </section>`;
}

async function saAdminProfileSubmit(event) {
    event.preventDefault();
    const note = document.getElementById('saProfileNote');
    if (note) note.textContent = '';
    try {
        const response = await fetch('/api/auth/admin/profile', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                name: document.getElementById('saAdminName').value.trim(),
                email: document.getElementById('saAdminEmail').value.trim()
            })
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.message || 'Could not update the profile.');
        if (data.token) localStorage.setItem('mtAuthToken:admin', data.token);
        if (data.user) {
            document.getElementById('saAdminName').value = data.user.name || '';
            document.getElementById('saAdminEmail').value = data.user.email || '';
        }
        if (note) note.textContent = 'Admin profile saved.';
        if (typeof saPaintTop === 'function') saPaintTop();
    } catch (error) {
        if (note) note.textContent = error.message || 'Could not update the profile.';
    }
}

async function saAdminPassSubmit(event) {
    event.preventDefault();
    const note = document.getElementById('saPassNote');
    const next = document.getElementById('saNewPass').value;
    const confirm = document.getElementById('saConfirmPass').value;
    if (note) note.textContent = '';
    try {
        const response = await fetch('/api/auth/admin/password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ newPassword: next, confirmPassword: confirm })
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.message || 'Could not update the password.');
        document.getElementById('saNewPass').value = '';
        document.getElementById('saConfirmPass').value = '';
        if (note) note.textContent = data.message || 'Admin password updated.';
    } catch (error) {
        if (note) note.textContent = error.message || 'Could not update the password.';
    }
}

async function saLoadAdminProfile() {
    try {
        const response = await fetch('/api/auth/admin/me', { credentials: 'include' });
        if (!response.ok) return;
        const data = await response.json();
        const user = data.user || {};
        const name = document.getElementById('saAdminName');
        const email = document.getElementById('saAdminEmail');
        if (name) name.value = user.name || '';
        if (email) email.value = user.email || '';
    } catch (error) {
        /* Profile fields stay empty until reload. */
    }
}

function saMountAdminPass() {
    const profile = document.getElementById('saAdminProfileForm');
    if (profile) profile.addEventListener('submit', saAdminProfileSubmit);
    const form = document.getElementById('saAdminPassForm');
    if (form) form.addEventListener('submit', saAdminPassSubmit);
    saLoadAdminProfile();
}
