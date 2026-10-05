function mpPdpChromeMarkup() {
    const cats = ['Bed Sheets', 'Bed Sheet Set', 'Comforter', 'Pillows', 'Towels', 'Fabrics', 'Cushions', 'Premium Sets'];
    const links = cats.map((name) => `<a href="/#categories">${name}</a>`).join('');
    return `
    <div class="mp-util">
        <p>
            <span>Premium Quality</span>
            <span>Fast Delivery</span>
            <span>Secure Payment</span>
            <span>24/7 Support</span>
        </p>
        <p class="mp-util-promo">Elevate Your Home with Premium Fabrics</p>
    </div>
    <header class="mp-nav mp-pdp-nav">
        <a class="mp-brand" href="/">
            <span class="mp-mark">M</span>
            <span>
                <strong>MarkiThon</strong>
                <small>Your Store, Online</small>
            </span>
        </a>
        <form class="mp-search" autocomplete="off">
            <input id="mpHeroSearch" name="mpHeroSearch" placeholder="Search for products, categories..." autocomplete="off">
            <button type="submit" aria-label="Search">Search</button>
        </form>
        <nav class="mp-links">
            <a class="on" href="/">Home</a>
            <a href="/#shops">Shops</a>
            <a href="/about">About</a>
            <a href="/contact">Contact</a>
        </nav>
        <div class="mp-utils">
            <button type="button" class="mp-icon" id="mpCartBtn" title="Cart" aria-label="Cart">Cart<span class="mp-badge" id="mpCartBadge">0</span></button>
            <div class="mp-auth" id="mpAuthSlot"></div>
        </div>
    </header>
    <nav class="mp-catbar" aria-label="Categories">
        <a class="mp-catbar-all" href="/#categories">All Categories</a>
        ${links}
        <a class="mp-catbar-shop" href="/#categories">Shop by Category</a>
    </nav>`;
}
