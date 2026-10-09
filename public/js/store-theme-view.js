function osThemeCardMarkup(row) {
    return `
        <label class="os-th-card">
            <input type="radio" name="osStoreTheme" value="${row.id}" autocomplete="off">
            <span class="os-th-thumb ${row.id}" aria-hidden="true">
                <span class="os-th-bar"></span>
                <span class="os-th-hero"></span>
                <span class="os-th-tiles"><i></i><i></i><i></i></span>
            </span>
            <strong>${row.name}</strong>
            <em>${row.blurb}</em>
        </label>`;
}

function osThemeSlotMarkup(slot) {
    return `
        <label class="os-th-slot">
            ${slot.label}
            <span class="os-th-file" id="osThWrap_${slot.key}">
                <img id="osThPrev_${slot.key}" alt="" hidden>
                <span id="osThHint_${slot.key}">Click to upload</span>
                <button type="button" class="os-th-clear" id="osThClear_${slot.key}"
                    data-thclear="${slot.key}" aria-label="Remove ${slot.label}" hidden>×</button>
                <input id="osThFile_${slot.key}" name="osThFile_${slot.key}" type="file"
                    accept="image/*" data-thfile="${slot.key}" autocomplete="off">
            </span>
            <input id="osTh_${slot.key}" name="osTh_${slot.key}" type="hidden" autocomplete="off">
        </label>`;
}

function osThemeSlotsMarkup(themeId) {
    const theme = osThemeById(themeId);
    return theme.slots.map(osThemeSlotMarkup).join('');
}

function storeThemeMarkup() {
    const cards = OS_STORE_THEMES.map(osThemeCardMarkup).join('');
    return `
        <section class="card os-card" id="osThemeCard">
            <div class="os-card-head">
                <div class="card-title">Theme &amp; Branding</div>
            </div>
            <p class="wl-hint">Pick a storefront theme, upload matching banners, and preview the public store in real time.</p>
            <div class="os-th-layout">
                <div>
                    <p class="os-banner-live-label">Store theme</p>
                    <div class="os-th-grid" id="osThemeGrid">${cards}</div>
                    <div class="os-th-slots" id="osThemeSlots">${osThemeSlotsMarkup('standard-retail')}</div>
                    <button type="button" class="os-banner-save" id="osThemeSave">Save Theme &amp; Branding</button>
                </div>
                <div>
                    <p class="os-banner-live-label">Live preview</p>
                    <div class="os-th-live" id="osThemePreview" data-sf-theme="standard-retail"></div>
                </div>
            </div>
        </section>`;
}
