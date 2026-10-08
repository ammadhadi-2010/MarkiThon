function mpPdpColors(row) {
    return row.colors || [['Navy', '#1e3a5f'], ['Sand', '#c4a574'], ['Ivory', '#f8fafc']];
}

function mpPdpHighlights(row) {
    if (Array.isArray(row.highlights) && row.highlights.length) {
        return row.highlights.map((item) => (Array.isArray(item) ? item : [item.title, item.detail]));
    }
    return [
        ['Quality Checked', 'Inspected before it leaves the shop'],
        ['Long Lasting', 'Made for everyday use'],
        ['Easy Care', 'Follow the care label on the pack'],
        ['Ready to Ship', 'Packed for delivery across Pakistan']
    ];
}

function mpThumbButtons(images, active) {
    const extra = images.length > 4 ? images.length - 4 : 0;
    const shown = extra ? images.slice(0, 4) : images;
    return shown.map((src, i) => {
        const badge = extra && i === shown.length - 1
            ? `<span class="mp-more" data-mpmore="1">+${extra}</span>` : '';
        return `<button type="button" class="${i === active ? 'on' : ''}" data-src="${mpEscape(src)}" data-mpi="${i}"><img src="${mpEscape(src)}" alt="">${badge}</button>`;
    }).join('');
}

function mpProductPageMarkup() {
    return `
    <section class="mp-pdp" id="mpPdp">
        <nav class="mp-crumb" id="mpCrumb" aria-label="Breadcrumb"></nav>
        <div class="mp-pdp-top">
            ${mpPdpGalleryMarkup()}
            ${mpPdpBuyMarkup()}
            ${mpPdpTrustMarkup()}
        </div>
        ${typeof mpPdpLowerMarkup === 'function' ? mpPdpLowerMarkup() : ''}
    </section>`;
}

function mpPaintProduct(idOrRow) {
    const row = idOrRow && typeof idOrRow === 'object' ? idOrRow : mpFindProduct(idOrRow);
    mpSaveRecent(row.id);
    const sale = Number(row.salePrice || row.retailPrice || 0);
    const retail = Number(row.retailPrice || sale);
    const off = typeof mpOffPercent === 'function' ? mpOffPercent(row) : 0;
    const cat = row.category || 'Products';
    document.getElementById('mpCrumb').innerHTML =
        `<a href="/">Home</a><span>›</span><a href="/#categories">${mpEscape(cat)}</a><span>›</span><strong>${mpEscape(row.title)}</strong>`;
    document.getElementById('mpPName').textContent = row.title;
    document.getElementById('mpTagline').textContent = row.tagline || row.desc;
    document.getElementById('mpArrival').hidden = row.tag !== 'new';
    if (typeof mpSetReviews === 'function') mpSetReviews(row.reviewList || []);
    document.getElementById('mpPPrice').innerHTML =
        `Rs. ${sale.toLocaleString()}${retail > sale ? ` <s>Rs. ${retail.toLocaleString()}</s>` : ''}${off ? `<em>${off}% OFF</em>` : ''}`;
    document.getElementById('mpFeat').textContent = row.featureLine || 'Soft · Durable · Ready to ship';
    const images = Array.isArray(row.images) ? row.images : [];
    document.getElementById('mpCount').textContent = images.length ? `1/${images.length}` : '';
    const main = document.getElementById('mpMainImg');
    if (images[0]) main.src = images[0];
    main.alt = row.title;
    document.getElementById('mpThumbs').innerHTML = images.length ? mpThumbButtons(images, 0) : '';
    document.getElementById('mpPerks').innerHTML = mpPdpHighlights(row).map((item) =>
        `<div><strong>${mpEscape(item[0])}</strong><span>${mpEscape(item[1])}</span></div>`
    ).join('');
    if (typeof mpPaintLower === 'function') mpPaintLower(row);
    document.getElementById('mpPShip').textContent = row.deliveryTime
        ? 'Estimated Delivery: ' + row.deliveryTime
        : '';
    const charge = document.getElementById('mpPCharge');
    charge.textContent = row.deliveryCharges || '';
    charge.hidden = !row.deliveryCharges;
    const detail = document.getElementById('mpPShipDetail');
    detail.textContent = row.deliveryDetails || '';
    detail.hidden = !row.deliveryDetails;
    document.getElementById('mpPReturn').textContent = row.returns || '';
}
