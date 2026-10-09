function inventoryMarkup() {
    return `
    <div id="catalogWrap">
    <div class="split">
        <div class="card">
            <div class="card-title"><span class="plus">+</span> Master Product Catalog</div>
            <p class="wl-hint">Identity only: name, brand, category, type, and units. Colors are added when you receive stock.</p>
            <form id="invForm" autocomplete="off">
                <div class="tabs">
                    <button type="button" class="tab active" data-tab="basic">Basic Info</button>
                    <button type="button" class="tab" data-tab="images">Images</button>
                </div>
                <div class="panel active" data-panel="basic">
                    <div class="field"><label>Product Name *</label>
                        <input id="invTitle" name="invTitle" required placeholder="Product name" autocomplete="off"></div>
                    <div class="field"><label>Brand</label>
                        <input id="invBrand" name="invBrand" placeholder="Brand name" list="invBrandList" autocomplete="off">
                        <datalist id="invBrandList"></datalist></div>
                    <div class="grid-2">
                        <div class="field"><label>Category *</label>
                            <select id="invCategory" name="invCategory" autocomplete="off"></select></div>
                        <div class="field" id="invSubWrap"><label>Sub Category</label>
                            <input id="invSubCategory" name="invSubCategory" placeholder="Sub category" autocomplete="off"></div>
                    </div>
                    <div class="field" id="invFabricWrap"><label>Fabric Type</label>
                        <input id="invFabricType" name="invFabricType" placeholder="Material / type" autocomplete="off"></div>
                    ${typeof invMobileFieldsMarkup === 'function' ? invMobileFieldsMarkup() : ''}
                    ${typeof invBedsheetFieldsMarkup === 'function' ? invBedsheetFieldsMarkup() : ''}
                    ${typeof invBlanketFieldsMarkup === 'function' ? invBlanketFieldsMarkup() : ''}
                    <div class="grid-2">
                        <div class="field"><label>Barcode</label>
                            <input id="invBarcode" name="invBarcode" placeholder="896542310001" autocomplete="off"></div>
                        <div class="field"><label>SKU / Code</label>
                            <input id="invSku" name="invSku" placeholder="Leave blank to auto-generate" autocomplete="off"></div>
                    </div>
                    <div class="field"><label>Unit</label>
                        <select id="invUnit" name="invUnit" autocomplete="off">
                            <option>Pcs</option>
                            <option>Suit</option>
                            <option selected>Meter</option>
                            <option>Gaz</option>
                            <option>Yard</option>
                            <option>Kg</option>
                            <option>Pack</option>
                            <option>Thaan</option>
                            <option>Set</option>
                            <option>Piece</option>
                        </select></div>
                    <div class="field" id="invSizesWrap">
                        <label>Sizes / Variants <span class="wl-hint">(Optional)</span></label>
                        <div class="inv-size-box" id="invSizeBox">
                            <div class="inv-size-presets" id="invSizePresets"></div>
                            <div class="inv-size-tags" id="invSizeTags"></div>
                            <input id="invSizeInput" name="invSizeInput" autocomplete="off"
                                placeholder="Type custom size and press Enter">
                        </div>
                        <p class="wl-hint">Leave blank for products that do not need sizing.</p>
                    </div>
                    <input type="hidden" id="invSellUnit" name="invSellUnit" value="Meter">
                    <input type="hidden" id="invConvert" name="invConvert" value="1">
                    <div class="field">
                        <label>Default Supplier</label>
                        <select id="invSupplierId" name="invSupplierId" autocomplete="off">
                            <option value="">Select supplier</option>
                        </select>
                    </div>
                    <p id="invOnHand" class="wl-hint" hidden>On-hand: 0</p>
                </div>
                <div class="panel" data-panel="images">
                    <div class="image-box">
                        <img id="invPreview" alt="Product preview" hidden>
                        <div id="invImageHint">+ Add Image</div>
                    </div>
                    <div class="field"><label>Image URL</label>
                        <input id="invImageUrl" name="invImageUrl" placeholder="https://..." autocomplete="off"></div>
                    <div class="field"><label>Upload preview</label>
                        <input id="invImageFile" name="invImageFile" type="file" accept="image/*" autocomplete="off"></div>
                </div>
                <input type="hidden" id="invEditId" name="invEditId">
                <div class="actions">
                    <button type="button" class="ghost" id="invCancel">Cancel</button>
                    <button type="button" class="primary" id="invNext">Next →</button>
                </div>
            </form>
        </div>
        <div class="card">
            <div class="card-title">Catalog Notes</div>
            <div id="invOpeningWrap" class="field">
                <label>Initial Stock / Opening Stock</label>
                <input id="invOpening" name="invOpening" type="number" min="0" step="0.01" value="0" form="invForm" autocomplete="off">
                <p class="wl-hint">Optional for new products. Later additions use Stock Movement → Stock In.</p>
            </div>
            <div class="field">
                <label>Target / Min Selling Rate</label>
                <input id="invMinRate" name="invMinRate" type="number" min="0" step="0.01" placeholder="Optional" form="invForm" autocomplete="off">
                <p class="wl-hint">Shown on POS as a bargaining floor. Selling below it still works, with a warning.</p>
            </div>
            <p class="wl-hint">Set purchase cost and wholesale/retail selling rates when you receive stock.</p>
            <div class="actions">
                <button type="submit" form="invForm" class="primary inv-save-btn" id="invSave">
                    <span class="inv-save-label">Save Catalog Product</span>
                </button>
            </div>
        </div>
    </div>
    </div>
    <div class="card" id="invCatalogTableCard" style="margin-top:18px">
        <div class="card-title">Master Catalog</div>
        <div class="table-wrap catalog-wrap">
            <table class="catalog-table">
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>SKU</th>
                        <th>Stock</th>
                        <th>Unit</th>
                        <th class="col-actions">Action</th>
                    </tr>
                </thead>
                <tbody id="invTable"></tbody>
            </table>
        </div>
    </div>
    <div id="invShareModal" class="share-modal" hidden>
        <div class="share-card">
            <h3>Share Product</h3>
            <p class="share-sub">Preview caption for Facebook and WhatsApp.</p>
            <pre id="invShareText"></pre>
            <button type="button" class="primary" id="invCopyCaption">Copy Caption & Details</button>
            <button type="button" class="ghost" id="invOpenFacebook">Open Facebook Page</button>
            <button type="button" class="share-wa" id="invShareWhatsApp">Share via WhatsApp</button>
            <button type="button" class="ghost" id="invShareClose">Close</button>
        </div>
    </div>
    ${typeof invAddSupplierMarkup === 'function' ? invAddSupplierMarkup() : ''}`;
}
