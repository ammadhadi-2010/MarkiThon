function onboardingStep6Markup() {
    return `
        <form id="obForm6" class="ob-panel" data-obstep="6" hidden autocomplete="off">
            <div class="ob-final-grid">
                <div class="ob-social-col">
                    <p class="ob-label">Website & Social Links</p>
                    <label class="ob-social">
                        <span class="ob-ico globe">🌐</span>
                        <div>
                            <small>Website / Online Store</small>
                            <input id="obWebsiteUrl" name="obWebsiteUrl" readonly
                                placeholder="https://markithon.com/ammadhadistor" autocomplete="off">
                        </div>
                        <span class="ob-ok">✓</span>
                    </label>
                    <label class="ob-social">
                        <span class="ob-ico fb">f</span>
                        <div>
                            <small>Facebook Page</small>
                            <input id="obFacebook" name="obFacebook" placeholder="https://facebook.com/ammadhadistor" autocomplete="off">
                        </div>
                        <span class="ob-ok">✓</span>
                    </label>
                    <label class="ob-social">
                        <span class="ob-ico ig">📷</span>
                        <div>
                            <small>Instagram</small>
                            <input id="obInstagram" name="obInstagram" placeholder="https://instagram.com/ammadhadistor" autocomplete="off">
                        </div>
                        <span class="ob-ok">✓</span>
                    </label>
                    <label class="ob-social">
                        <span class="ob-ico yt">▶</span>
                        <div>
                            <small>YouTube Channel</small>
                            <input id="obYoutube" name="obYoutube" placeholder="https://youtube.com/@ammadhadistor" autocomplete="off">
                        </div>
                        <span class="ob-ok">✓</span>
                    </label>
                    <label class="ob-terms">
                        <input id="obTerms" name="obTerms" type="checkbox" autocomplete="off">
                        I agree to the Terms & Conditions and Privacy Policy
                    </label>
                </div>
                <div class="ob-side-col">
                    <p class="ob-label">Store Location (Optional)</p>
                    <button type="button" class="ob-detect" id="obDetectLocation">Detect Live Location</button>
                    <div class="ob-map-box">
                        <iframe id="obMapEmbed" class="ob-map-embed" title="Store location preview" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
                    </div>
                    <p class="ob-map-hint" id="obMapLabel">Use live GPS or paste a Google Maps link.</p>
                    <label class="ob-social ob-maps" id="obMapsRow">
                        <span class="ob-ico globe">📍</span>
                        <div>
                            <small>Google Maps Share Link / Plus Code</small>
                            <input id="obMapsLink" name="obMapsLink" placeholder="Paste your Google Maps share link here (e.g. https://maps.app.goo.gl/...)" autocomplete="off">
                        </div>
                        <span class="ob-ok">✓</span>
                    </label>
                    <input id="obLatitude" name="obLatitude" type="hidden" autocomplete="off">
                    <input id="obLongitude" name="obLongitude" type="hidden" autocomplete="off">
                    <div class="field">
                        <label>Market Location Position</label>
                        <select id="obMarketPosition" name="obMarketPosition" autocomplete="off">
                            <option value="">Select position</option>
                            <option>Market Entrance/Front</option>
                            <option>Middle Corridor</option>
                            <option>End of Market/Back Gate</option>
                            <option>Basement</option>
                        </select>
                    </div>
                    <div class="field">
                        <label>Landmark Note</label>
                        <input id="obLandmarkNote" name="obLandmarkNote" placeholder="Opposite Main Stairs" autocomplete="off">
                    </div>
                    <div class="ob-store-link">
                        <p class="ob-label">Live Store Link</p>
                        <input id="obStoreLink" name="obStoreLink" readonly autocomplete="off">
                        <div class="ob-store-actions">
                            <button type="button" class="primary" id="obCopyStore">Copy Store Link</button>
                            <a id="obOpenStore" class="ghost ob-open-store" href="/ammadhadistor" target="_blank" rel="noopener">Open Store</a>
                        </div>
                    </div>
                    <div class="ob-summary">
                        <p class="ob-label">Setup Summary</p>
                        <div class="ob-sum-row"><span>Shop Name</span><strong id="obSumName">Ammad Hadi Stor</strong></div>
                        <div class="ob-sum-row"><span>Shop Type</span><strong id="obSumType">-</strong></div>
                        <div class="ob-sum-row"><span>Package</span><strong id="obSumPackage">Business</strong></div>
                    </div>
                </div>
            </div>
            <div class="ob-actions spread">
                <button type="button" class="ghost" id="obBack6">← Back</button>
                <button type="submit" class="primary" id="obNext6">Next →</button>
            </div>
        </form>`;
}
