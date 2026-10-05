function osDropBox(kind, title, hint, changeLabel) {
    const id = kind === 'logo' ? 'osLogo' : 'osCover';
    return `
        <div class="os-drop" id="${id}Drop" data-osdrop="${kind}">
            <img id="${id}Preview" alt="${title}" hidden>
            <div class="os-drop-hint" id="${id}Hint">${hint}</div>
            <button type="button" class="ghost os-drop-btn" id="${id}Change">${changeLabel}</button>
            <input id="${id}File" name="${id}File" type="file" accept="image/*" hidden autocomplete="off">
            <input id="${id}Url" name="${id}Url" type="hidden" autocomplete="off">
        </div>`;
}

function storeBrandMarkup() {
    return `
        <section class="card os-card" id="osBrandCard">
            <div class="os-card-head">
                <div class="card-title">Store Branding</div>
                <span class="os-step-pill">Step 1</span>
            </div>
            <p class="wl-hint">Logo, header cover, WhatsApp orders number, and shop bio for the public store.</p>
            <div class="os-brand-media">
                <div>
                    <p class="os-brand-label">Shop logo</p>
                    ${osDropBox('logo', 'Shop logo', 'Drop a logo or click to upload', 'Change Logo')}
                </div>
                <div>
                    <p class="os-brand-label">Main Cover Banner</p>
                    ${osDropBox('cover', 'Cover banner', 'Drop a header banner or click to upload', 'Change Cover')}
                </div>
            </div>
            <div class="os-brand-fields">
                <div class="field">
                    <label class="os-wa-label" for="osWhatsapp">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                            <path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6 19.8 19.8 0 01-3.1-8.7A2 2 0 014 2h3a2 2 0 012 1.7c.1.9.3 1.8.6 2.6a2 2 0 01-.4 2.1L8 9.9a16 16 0 006 6l1.5-1.1a2 2 0 012.1-.5c.8.3 1.7.5 2.6.6A2 2 0 0122 16.9z"/>
                        </svg>
                        WhatsApp Number (Orders)
                    </label>
                    <input id="osWhatsapp" name="osWhatsapp" type="tel" inputmode="numeric"
                        placeholder="0300-1234567" maxlength="12" autocomplete="off">
                </div>
                <div class="field">
                    <label for="osShopBio">Shop Description / Bio</label>
                    <textarea id="osShopBio" name="osShopBio" rows="3" maxlength="500"
                        placeholder="Premium bedding, towels, and home textiles from Ammad Hadi Stor."
                        autocomplete="off"></textarea>
                </div>
            </div>
            <div class="actions">
                <button type="button" class="primary" id="osBrandSave">Save Store Branding</button>
            </div>
        </section>`;
}
