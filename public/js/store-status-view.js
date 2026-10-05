function storeStatusMarkup() {
    return `
        <section class="card os-card" id="osStatusCard">
            <div class="os-card-head">
                <div class="card-title">Store Status</div>
            </div>
            <div class="os-status-row">
                <span class="os-live-dot" aria-hidden="true"></span>
                <span class="os-live-label">Website Online</span>
            </div>
            <div class="os-verify-row">
                <span class="ob-verify-badge wait" id="osVerifyBadge">Pending Admin Approval</span>
                <button type="button" class="primary" id="osApproveStore">Approve Store</button>
            </div>
            <div class="field"><label>Store Name</label>
                <input id="osStoreName" name="osStoreName" readonly autocomplete="off" value="Ammad Hadi Stor"></div>
            <div class="field"><label>Store URL</label>
                <div class="os-url-row">
                    <input id="osStoreLink" name="osStoreLink" readonly autocomplete="off"
                        value="https://markithon.com/ammadhadistor">
                    <button type="button" class="ghost" id="osCopyLink">Copy Link</button>
                </div>
            </div>
            <div class="actions">
                <a class="primary os-open-btn" id="osOpenLink" href="/ammadhadistor" target="_blank" rel="noopener">Open Store</a>
            </div>
        </section>`;
}
