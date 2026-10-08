function osPriceField(id, label, opts = {}) {
    const req = opts.required ? ' <span class="os-req">*</span>' : '';
    const extra = opts.readonly ? ' readonly' : '';
    const type = opts.readonly ? 'text' : 'number';
    const step = opts.readonly ? '' : ` min="${opts.min != null ? opts.min : 0}" step="${opts.step || '0.01'}"`;
    const ph = opts.placeholder ? ` placeholder="${opts.placeholder}"` : '';
    const unit = opts.unit != null ? opts.unit : '/ Gaz';
    const unitAttr = opts.fixedUnit ? '' : ' data-osunit';
    const value = opts.value != null ? ` value="${opts.value}"` : '';
    return `<div class="field">
        <label for="${id}">${label}${req}</label>
        <div class="os-price-wrap">
            <input id="${id}" name="${id}" type="${type}"${step}${extra}${ph}${value} autocomplete="off">
            <span class="os-price-unit"${unitAttr}>${unit}</span>
        </div>
    </div>`;
}

function storeEditPriceMarkup() {
    return `
    <section class="os-edit-sec">
        <div class="os-edit-sec-head">
            <span class="os-step">3</span>
            <div>
                <strong>Online Pricing</strong>
                <p>Set the prices for your website (in selling unit).</p>
            </div>
        </div>
        <div class="os-edit-controls">
            ${osPriceField('osEditOrig', 'Original Price (Auto)', { readonly: true })}
            ${osPriceField('osEditOnline', 'Online Selling Price', { required: true })}
            ${osPriceField('osEditDiscount', 'Discount Price')}
            <div class="field">
                <label for="osEditPct">Discount %</label>
                <input id="osEditPct" name="osEditPct" readonly autocomplete="off">
            </div>
            ${osPriceField('osEditWholesale', 'Wholesale Price (Per Unit)', {
                placeholder: 'e.g. 180'
            })}
            ${osPriceField('osEditMoq', 'Min Wholesale Quantity (Pcs)', {
                placeholder: 'e.g. 10',
                value: '10',
                step: '1',
                min: 1,
                unit: 'Pcs',
                fixedUnit: true
            })}
        </div>
    </section>`;
}

function osEditSellUnit(row) {
    return row.sellUnit || row.stockUnit || 'Gaz';
}

function paintOsEditUnits(unit) {
    document.querySelectorAll('[data-osunit]').forEach((el) => {
        el.textContent = '/ ' + unit;
    });
}

function paintOsEditPct() {
    const online = Number(document.getElementById('osEditOnline')?.value || 0);
    const discount = Number(document.getElementById('osEditDiscount')?.value || 0);
    const box = document.getElementById('osEditPct');
    if (!box) return;
    if (discount > 0 && online > discount) {
        box.value = ((discount / online) * 100).toFixed(1);
        return;
    }
    box.value = '0';
}

function fillOsEditPrice(row) {
    const orig = Number(row.retailPrice || 0);
    const origEl = document.getElementById('osEditOrig');
    if (origEl) origEl.value = orig ? `Rs. ${orig.toLocaleString()}` : '—';
    const online = document.getElementById('osEditOnline');
    const disc = document.getElementById('osEditDiscount');
    const wholesale = document.getElementById('osEditWholesale');
    const moq = document.getElementById('osEditMoq');
    if (online) online.value = row.onlinePrice || 0;
    if (disc) disc.value = row.discountPrice || 0;
    if (wholesale) wholesale.value = row.wholesalePrice != null ? row.wholesalePrice : 0;
    if (moq) {
        const qty = Number(row.minWholesaleQty);
        moq.value = qty > 0 ? qty : 10;
    }
    paintOsEditUnits(osEditSellUnit(row));
    paintOsEditPct();
}
