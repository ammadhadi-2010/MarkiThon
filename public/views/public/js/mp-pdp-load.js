function mpPdpSkeletonMarkup() {
    return `
    <section class="mp-pdp mp-pdp-skel" id="mpPdp" aria-busy="true" aria-live="polite">
        <p class="mp-skel mp-skel-line"></p>
        <div class="mp-pdp-top">
            <div class="mp-skel mp-skel-hero"></div>
            <div class="mp-skel-col">
                <p class="mp-skel mp-skel-line"></p>
                <p class="mp-skel mp-skel-line short"></p>
                <p class="mp-skel mp-skel-block"></p>
            </div>
            <div class="mp-skel mp-skel-side"></div>
        </div>
    </section>`;
}

function mpPdpMissingMarkup() {
    return `
    <section class="mp-missing" id="mpPdp">
        <h1>Product Not Found</h1>
        <p>This product is unavailable or the link is no longer valid.</p>
        <a class="mp-cta" href="/">Back to MarkiThon</a>
    </section>`;
}

function mpDetailRow(data) {
    const sale = Number(data.salePrice || data.discountPrice || data.retailPrice || 0);
    const retail = Number(data.retailPrice || sale);
    const images = (Array.isArray(data.images) ? data.images : []).filter(Boolean);
    if (!images.length && data.imageUrl) images.push(data.imageUrl);
    return {
        id: data.id,
        title: data.name || data.title || 'Saved Product',
        tagline: data.shopName || 'Ammad Hadi Stor',
        desc: data.description || '',
        salePrice: sale,
        retailPrice: Math.max(retail, sale),
        stock: Number(data.stock) || 0,
        images,
        category: data.category || 'Products',
        shopName: data.shopName || 'Ammad Hadi Stor',
        variants: data.variations && data.variations.length ? data.variations : ['Standard'],
        tag: data.storeNewArrival ? 'new' : '',
        featureLine: data.category || 'Ready to ship',
        highlights: (data.highlights || []).map((item) => [item.title, item.detail]),
        deliveryTime: data.deliveryTime || '',
        deliveryCharges: data.deliveryCharges || '',
        deliveryDetails: data.deliveryDetails || '',
        returns: data.returnPolicy || '',
        reviewList: data.reviews || [],
        descHeadline: data.descHeadline || '',
        descBody: data.descBody || data.description || '',
        features: Array.isArray(data.features) ? data.features : [],
        includes: Array.isArray(data.includes) ? data.includes : [],
        care: Array.isArray(data.care) ? data.care : []
    };
}

async function mpOpenProduct(root, id) {
    const slot = () => root.querySelector('#mpPdp');
    try {
        const res = await fetch('/api/products/' + encodeURIComponent(id));
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.id) {
            if (slot()) slot().outerHTML = mpPdpMissingMarkup();
            return;
        }
        const row = mpDetailRow(data);
        if (typeof mpLiveProducts !== 'undefined') {
            mpLiveProducts = [row].concat(mpLiveProducts.filter((item) => String(item.id) !== String(row.id)));
        }
        if (slot()) slot().outerHTML = mpProductPageMarkup();
        mpPaintProduct(row);
        mpBindProduct(root, row.id);
        if (typeof mpBindLower === 'function') mpBindLower(root, row);
        if (typeof mpLoadAlsoLike === 'function') mpLoadAlsoLike(row);
        mpPaintCartBadge(root);
    } catch (error) {
        if (slot()) slot().outerHTML = mpPdpMissingMarkup();
    }
}
