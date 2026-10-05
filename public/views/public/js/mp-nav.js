function mpNavMarkup(page) {
    const on = (id) => (page === id ? ' on' : '');
    return `
    <header class="mp-nav">
        <a class="mp-brand" href="/">
            <span class="mp-mark">M</span>
            <span>
                <strong>MarkiThon</strong>
                <small>Local Shops. Global Reach.</small>
            </span>
        </a>
        <nav class="mp-links">
            <a class="${on('home')}" href="/">Home</a>
            <a href="/#trending">New Arrivals</a>
            <a href="/#trending">Offers</a>
            <a href="/#categories">Categories</a>
            <a href="/#shops">Shops</a>
            <a class="${on('about')}" href="/about">About</a>
            <a class="${on('contact')}" href="/contact">Contact</a>
            <a class="${on('blog')}" href="/blog">Blog</a>
        </nav>
        <div class="mp-utils">
            <button type="button" class="mp-icon" id="mpSearchBtn" title="Search" aria-label="Search">🔍</button>
            <a class="mp-icon mp-wish" href="/#reviews" title="Wishlist" aria-label="Wishlist"><svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20s-7-4.4-7-9a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 4.6-7 9-7 9z"/></svg></a>
            <button type="button" class="mp-icon" id="mpCartBtn" title="Cart" aria-label="Cart">🛒<span class="mp-badge" id="mpCartBadge">0</span></button>
            <div class="mp-auth" id="mpAuthSlot"></div>
        </div>
    </header>`;
}
