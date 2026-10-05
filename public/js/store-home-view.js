function storeHomeSwitch(id, label) {
    return `
        <label class="os-home-tile">
            <span>${label}</span>
            <span class="osc-switch">
                <input id="${id}" name="${id}" type="checkbox" role="switch" checked autocomplete="off">
                <span></span>
            </span>
        </label>`;
}

function storeHomeMarkup() {
    return `
        <section class="card os-card" id="osHomeCard">
            <div class="os-card-head">
                <div class="card-title">Homepage Control</div>
            </div>
            <p class="wl-hint">Choose what to show on your store homepage and manage product order.</p>
            <div class="os-home-grid">
                ${storeHomeSwitch('osHomeFeatured', 'Featured Products')}
                ${storeHomeSwitch('osHomeNew', 'New Arrivals')}
                ${storeHomeSwitch('osHomeSale', 'Sale Products')}
                ${storeHomeSwitch('osHomeCats', 'Categories')}
            </div>
        </section>`;
}
