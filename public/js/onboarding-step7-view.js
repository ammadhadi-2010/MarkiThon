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
                <div>
                    <h3 class="ob-qr-shop-title" id="obQrShopTitle">Ammad Hadi Stor</h3>
                    <div class="ob-qr-cards" id="obQrCards"></div>
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
                        <div class="ob-sum-row"><span>Business Type</span><strong id="obVerifyBiz">Both</strong></div>
                    </div>
                </div>
            </div>
            <div class="ob-actions spread">
                <button type="button" class="ghost" id="obBack7">← Back</button>
                <button type="submit" class="ob-complete" id="obComplete">✓ Complete Setup ✓</button>
            </div>
        </form>`;
}
