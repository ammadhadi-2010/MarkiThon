function storeBannerMarkup() {
    return `
        <section class="card os-card" id="osBannerCard">
            <div class="os-card-head">
                <div class="card-title">Promotional Banners &amp; Mid-Page Offers</div>
                <label class="os-home-tile os-banner-toggle">
                    <span>Show on homepage</span>
                    <span class="osc-switch">
                        <input id="osBannerOn" name="osBannerOn" type="checkbox" role="switch" autocomplete="off">
                        <span></span>
                    </span>
                </label>
            </div>
            <p class="wl-hint">Upload a banner, edit offer copy, and save. Disabled banners stay hidden on the public store.</p>
            <div class="os-banner-layout">
                <div class="os-banner-form">
                    <label>Banner image
                        <input id="osBannerFile" type="file" accept="image/*" autocomplete="off">
                    </label>
                    <input id="osBannerImage" type="hidden" autocomplete="off">
                    <button type="button" class="ghost" id="osBannerClear">Remove banner image</button>
                    <label>Sub-heading
                        <input id="osBannerSub" type="text" maxlength="80" placeholder="LIMITED TIME OFFER" autocomplete="off">
                    </label>
                    <label>Main headline
                        <input id="osBannerHead" type="text" maxlength="80" placeholder="Save Up to 30%" autocomplete="off">
                    </label>
                    <label>Description text
                        <textarea id="osBannerDesc" rows="2" maxlength="180" placeholder="On Selected Bedding &amp; Towels" autocomplete="off"></textarea>
                    </label>
                    <div class="os-banner-cta-row">
                        <label>CTA button text
                            <input id="osBannerCta" type="text" maxlength="40" placeholder="Shop Sale" autocomplete="off">
                        </label>
                        <label>Target link / category
                            <select id="osBannerLink" autocomplete="off">
                                <option value="home">Store homepage</option>
                                <option value="sale">Sale products</option>
                                <option value="featured">Featured products</option>
                                <option value="new">New arrivals</option>
                            </select>
                        </label>
                    </div>
                    <button type="button" class="os-banner-save" id="osBannerSave">Save Banner Settings</button>
                </div>
                <div>
                    <p class="os-banner-live-label">Live preview</p>
                    <div class="os-banner-preview" id="osBannerPreview"></div>
                </div>
            </div>
        </section>`;
}
