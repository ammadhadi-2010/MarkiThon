function osEditActions(place) {
    return `<div class="os-edit-actions">
        <button type="button" class="os-save-btn" data-oseditsave="${place}">
            <span class="os-save-label">Save Changes</span>
        </button>
        <button type="button" class="ghost" data-oseditclose>Cancel / Back</button>
    </div>`;
}

function osEditRoField(id, label) {
    return `<div class="field"><label for="${id}">${label}</label>
        <input id="${id}" name="${id}" readonly autocomplete="off"></div>`;
}

function osEditSecHead(step, title, sub) {
    return `<div class="os-edit-sec-head">
        <span class="os-step">${step}</span>
        <div>
            <strong>${title}</strong>
            <p>${sub}</p>
        </div>
    </div>`;
}

function storeEditMarkup() {
    return `
    <section class="os-edit-page" id="osEditPage">
        <div class="os-edit-head">
            <div class="os-edit-title">
                <span class="os-edit-ico" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>
                    </svg>
                </span>
                <div>
                    <h3>Edit Online Product</h3>
                    <p>Manage how this product appears on your online store.</p>
                </div>
            </div>
            ${osEditActions('top')}
        </div>
        <form id="osEditForm" autocomplete="off">
            <section class="os-edit-sec">
                ${osEditSecHead('1', 'Product Info', 'Product details (read only - managed from inventory).')}
                <div class="os-edit-info">
                    <div class="os-edit-media">
                        ${typeof storeEditStickerStage === 'function' ? storeEditStickerStage() : '<img id="osEditHero" alt="Product">'}
                        <div id="osEditThumbs" class="os-edit-thumbs"></div>
                        ${typeof storeEditStickerPalette === 'function' ? storeEditStickerPalette() : ''}
                    </div>
                    <div class="os-edit-fields">
                        ${osEditRoField('osEditName', 'Product Name')}
                        ${osEditRoField('osEditCat', 'Category')}
                        ${osEditRoField('osEditSub', 'Sub Category')}
                        ${osEditRoField('osEditSku', 'SKU / Code')}
                        <div class="os-edit-stock">
                            ${osEditRoField('osEditStock', 'Current Stock')}
                            ${osEditRoField('osEditUnit', 'Stock Unit')}
                        </div>
                    </div>
                </div>
            </section>
            <section class="os-edit-sec">
                ${osEditSecHead('2', 'Website Settings', 'Control how this product appears on your website.')}
                ${typeof storeEditWebMarkup === 'function' ? storeEditWebMarkup() : ''}
            </section>
            ${typeof storeEditPriceMarkup === 'function' ? storeEditPriceMarkup() : ''}
            ${typeof storeEditHomePosMarkup === 'function' ? storeEditHomePosMarkup() : ''}
            ${typeof storeEditDescMarkup === 'function' ? storeEditDescMarkup() : ''}
            ${typeof storeEditStoryMarkup === 'function' ? storeEditStoryMarkup() : ''}
            ${typeof storeEditTagsMarkup === 'function' ? storeEditTagsMarkup() : ''}
            ${typeof storeEditPhotosMarkup === 'function' ? storeEditPhotosMarkup() : ''}
            ${typeof storeEditPolicyMarkup === 'function' ? storeEditPolicyMarkup() : ''}
            ${osEditActions('bottom')}
        </form>
    </section>`;
}
