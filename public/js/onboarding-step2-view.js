const OB_PRODUCT_TYPES = [
    ['Fabric / Kapra', 'Meter / Thaan / Roll', '🧵'],
    ['Ready-Made Suits', 'Size / Color / Pieces', '👗'],
    ['Bedsheet', 'Size / Set / Pieces', '🛏️'],
    ['Blanket / Kambal', 'Size / Weight / Pieces', '🛌'],
    ['Takiya / Pillow', 'Size / Filling / Pieces', '🛋️'],
    ['Quilt / Razai', 'Size / Material / Pieces', '🧣'],
    ['Garments', 'Size / Color / Pieces', '👕'],
    ['Mobile Accessories', 'Piece / Set / Pack', '📱'],
    ['Other Products', 'Custom Fields', '📦']
];

function onboardingStep2Markup() {
    const cards = OB_PRODUCT_TYPES.map(([name, hint, icon]) => `
        <button type="button" class="ob-type" data-ptype="${name}" autocomplete="off">
            <span class="ob-tick">✓</span>
            <span class="ob-type-icon">${icon}</span>
            <strong>${name}</strong>
            <small>${hint}</small>
        </button>`).join('');
    return `
        <form id="obForm2" class="ob-panel" data-obstep="2" hidden autocomplete="off">
            <div class="ob-type-grid" id="obTypeGrid">${cards}</div>
            <p class="ob-label">Select one or more types. Bedsheet can be used alone or together with Fabric / Kapra.</p>
            <div class="ob-selected">
                <p class="ob-label" id="obSelectedLabel">Selected Categories (0)</p>
                <div class="ob-tags" id="obTags"></div>
            </div>
            <div class="ob-actions spread">
                <button type="button" class="ghost" id="obBack">← Back</button>
                <div class="ob-actions-right">
                    <button type="button" class="ghost" id="obCancel2">Cancel</button>
                    <button type="submit" class="primary" id="obNext2">Next →</button>
                </div>
            </div>
        </form>`;
}
