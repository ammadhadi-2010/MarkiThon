function storeMarkup() {
    return `
    <div class="os-manage">
        <div id="osDashTop" hidden>
            <div class="os-top-grid">
                ${typeof storeStatusMarkup === 'function' ? storeStatusMarkup() : ''}
                ${typeof storeHomeMarkup === 'function' ? storeHomeMarkup() : ''}
            </div>
            ${typeof storeBannerMarkup === 'function' ? storeBannerMarkup() : ''}
            ${typeof storeThemeMarkup === 'function' ? storeThemeMarkup() : ''}
            ${typeof storePolicyMarkup === 'function' ? storePolicyMarkup() : ''}
        </div>
        <div id="osPage-products">
            ${typeof storeProductsMarkup === 'function' ? storeProductsMarkup() : ''}
        </div>
        <div id="osPage-edit" hidden>
            ${typeof storeEditMarkup === 'function' ? storeEditMarkup() : ''}
        </div>
        <div id="osPage-orders" hidden>
            ${typeof storeOrdersMarkup === 'function' ? storeOrdersMarkup() : ''}
        </div>
    </div>`;
}
