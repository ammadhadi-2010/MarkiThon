function vpEsc(value) {
    return String(value || '').replace(/[&<>"']/g, (ch) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[ch]));
}

function vendorProfileMarkup() {
    return `
    <section class="vp-wrap" id="vpRoot">
        <div class="vp-head">
            <div>
                <h2>Shopkeeper Profile</h2>
                <p>Manage your MarkiThon inventory account, password, and thumb scan login.</p>
            </div>
            <button class="vp-btn ghost" type="button" id="vpSignOut" hidden>Sign Out</button>
        </div>
        <div class="vp-gate" id="vpGate">
            <p>Sign in with your shopkeeper account to edit profile and security settings.</p>
            <a class="vp-btn" href="/vendor/login">Shopkeeper Login</a>
            <p class="vp-hint">Demo Active account: shopkeeper@markithon.com / Shopkeeper@123</p>
        </div>
        <div class="vp-grid" id="vpPanels" hidden>
            <form class="vp-card" id="vpProfileForm" autocomplete="off">
                <h3>Profile Settings</h3>
                <div class="vp-avatar-row">
                    <div class="vp-avatar" id="vpAvatarPreview">SK</div>
                    <div>
                        <label class="vp-file">Upload Profile Image
                            <input id="vpImageFile" type="file" accept="image/png,image/jpeg,image/webp" autocomplete="off">
                        </label>
                        <input id="vpImageUrl" type="hidden" value="">
                        <p class="vp-hint">PNG, JPG, or WebP up to 2 MB.</p>
                    </div>
                </div>
                <label>Full Name<input id="vpOwnerName" name="vpOwnerName" autocomplete="off" required></label>
                <label>Shopkeeper ID Number<input id="vpShopkeeperId" name="vpShopkeeperId" autocomplete="off" readonly></label>
                <label>Store Name<input id="vpShopName" name="vpShopName" autocomplete="off" required></label>
                <label>Contact Phone<input id="vpPhone" name="vpPhone" autocomplete="off" required></label>
                <label>Business Address<textarea id="vpAddress" name="vpAddress" autocomplete="off" required></textarea></label>
                <p class="vp-note" id="vpProfileNote"></p>
                <button class="vp-btn" type="submit">Save Profile</button>
            </form>
            <form class="vp-card" id="vpPassForm" autocomplete="off">
                <h3>Password Management</h3>
                <label>Current Password<input id="vpCurrentPass" name="vpCurrentPass" type="password" autocomplete="off" required></label>
                <label>New Password<input id="vpNewPass" name="vpNewPass" type="password" autocomplete="off" required></label>
                <label>Confirm Password<input id="vpConfirmPass" name="vpConfirmPass" type="password" autocomplete="off" required></label>
                <p class="vp-note" id="vpPassNote"></p>
                <button class="vp-btn" type="submit">Update Password</button>
            </form>
            <section class="vp-card" id="vpBioCard">
                <h3>Thumb Scan Login</h3>
                <p class="vp-hint">Enable Thumb Scan Login / Quick Access with your phone fingerprint or device biometrics (WebAuthn).</p>
                <label class="vp-switch">Enable Thumb Scan Login / Quick Access
                    <input id="vpBioToggle" type="checkbox" autocomplete="off">
                    <span></span>
                </label>
                <p class="vp-note" id="vpBioNote"></p>
                <button class="vp-btn ghost" type="button" id="vpBioRegister">Register Thumb Scan</button>
            </section>
        </div>
        <div class="vp-setup-label"><h3>Store Setup Wizard</h3><p>Continue the shop onboarding steps below.</p></div>
    </section>`;
}
