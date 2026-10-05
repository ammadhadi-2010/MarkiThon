function mpRecentIds() {
    try {
        return JSON.parse(localStorage.getItem('mpRecent') || '[]');
    } catch (error) {
        return [];
    }
}

function mpSaveRecent(id) {
    const next = [id].concat(mpRecentIds().filter((row) => row !== id)).slice(0, 8);
    localStorage.setItem('mpRecent', JSON.stringify(next));
}

function mpHomeExtraMarkup() {
    const quotes = MP_REVIEWS.map((row) => `
        <article class="mp-quote">
            <img src="${row.avatar}" alt="">
            <div>
                <strong>${row.name}</strong>
                <p class="mp-stars">★★★★★ <span>${row.stars}</span></p>
                <p>“${row.text}”</p>
            </div>
        </article>`).join('');
    return `
    <section class="mp-block mp-why-banner" id="mpWhy">
        <div>
            <h2>Shop Local.<br>Shop Direct.</h2>
            <p>MarkiThon helps you discover and shop from verified local businesses. No middlemen, just real shops and real products.</p>
            <a class="mp-cta" href="/#shops">Explore Marketplace →</a>
        </div>
        <div>
            <h3 id="mpWhyTitle">Why Shop With MarkiThon?</h3>
            <div class="mp-vals" id="mpWhyVals">
                <article><strong>Verified Shops</strong><span>Trusted and approved local businesses</span></article>
                <article><strong>Wide Selection</strong><span>Fashion, home, beauty, electronics and more</span></article>
                <article><strong>Direct Shopping</strong><span>Deal directly with shop owners</span></article>
                <article><strong>Reliable Ordering</strong><span>Track your orders and shop with confidence</span></article>
            </div>
        </div>
    </section>
    <section class="mp-block" id="mpRecent" hidden>
        <div class="mp-head"><div><h2 id="mpRecentTitle">Recently Viewed</h2></div></div>
        <div class="mp-quotes" id="mpRecentRow"></div>
    </section>
    <section class="mp-block" id="reviews">
        <div class="mp-head">
            <div>
                <h2>What Our Customers Say</h2>
                <p>Real reviews from real shoppers.</p>
            </div>
            <a href="/#reviews">View All Reviews →</a>
        </div>
        <div class="mp-quotes" id="mpQuotes">${quotes}</div>
        <button type="button" class="mp-q-arrow prev" id="mpQuotePrev" aria-label="Previous reviews">‹</button>
        <button type="button" class="mp-q-arrow next" id="mpQuoteNext" aria-label="Next reviews">›</button>
    </section>`;
}

function mpBindQuotes(root) {
    const row = root.querySelector('#mpQuotes');
    if (!row) return;
    const prev = root.querySelector('#mpQuotePrev');
    const next = root.querySelector('#mpQuoteNext');
    if (prev) prev.addEventListener('click', () => { row.scrollBy({ left: -280, behavior: 'smooth' }); });
    if (next) next.addEventListener('click', () => { row.scrollBy({ left: 280, behavior: 'smooth' }); });
}
