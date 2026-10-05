function onboardingStep7Markup() {
    return `
        <form id="obForm7" class="ob-panel" data-obstep="7" hidden autocomplete="off">
            <div class="ob-verify-head">
                <span class="ob-verify-badge wait" id="obVerifyBadge">Pending Admin Approval</span>
                <p class="ob-verify-copy" id="obVerifyCopy">
                    Your store profile is in review. Sharing, QR downloads, and the digital business card stay locked until an admin approves Ammad Hadi Stor.
                </p>
            </div>
            <div class="ob-verify-grid">
                <div class="ob-qr-card ob-qr-lock" id="obQrCard">
                    <p class="ob-label">Branded Store QR Code</p>
                    <div class="ob-qr-wrap">
                        <canvas id="obBrandQr" class="ob-store-qr" width="280" height="280" aria-label="Branded store QR code"></canvas>
                        <div class="ob-qr-lock-note" id="obQrLockNote">Locked until admin approval</div>
                    </div>
                    <button type="button" class="primary" id="obDownloadQr" disabled>Download QR Code</button>
                </div>
                <div class="ob-verify-actions">
                    <p class="ob-label">Digital Assets</p>
                    <button type="button" class="ghost" id="obShareStore" disabled>Share Store</button>
                    <button type="button" class="ghost" id="obDownloadVcf" disabled>Download Digital Business Card (.vcf)</button>
                    <p class="ob-verify-hint">These actions unlock when status is Store Live &amp; Verified.</p>
                    <div class="ob-summary">
                        <p class="ob-label">Setup Summary</p>
                        <div class="ob-sum-row"><span>Shop Name</span><strong id="obVerifyName">Ammad Hadi Stor</strong></div>
                        <div class="ob-sum-row"><span>Live URL</span><strong id="obVerifyUrl">https://markithon.com/ammadhadistor</strong></div>
                    </div>
                </div>
            </div>
            <section class="ob-pass-card" id="obPassCard">
                <p class="ob-label">Password Management</p>
                <div id="obPassForm" autocomplete="off">
                    <label>Current Password<input id="obCurrentPass" name="obCurrentPass" type="password" autocomplete="off"></label>
                    <label>New Password<input id="obNewPass" name="obNewPass" type="password" autocomplete="off"></label>
                    <label>Confirm Password<input id="obConfirmPass" name="obConfirmPass" type="password" autocomplete="off"></label>
                    <p class="ob-pass-note" id="obPassNote"></p>
                    <button class="primary" type="button" id="obPassSave">Update Password</button>
                </div>
            </section>
            <div class="ob-actions spread">
                <button type="button" class="ghost" id="obBack7">← Back</button>
                <button type="submit" class="ob-complete" id="obComplete">✓ Complete Setup ✓</button>
            </div>
        </form>`;
}
