function mpPdpGalleryMarkup() {
    return `
        <div class="mp-gallery">
            <div class="mp-thumbs" id="mpThumbs"></div>
            <div class="mp-zoom" id="mpZoom">
                <img id="mpMainImg" alt="">
                <span class="mp-prem" id="mpPrem">Premium</span>
                <button type="button" class="mp-heart" id="mpWish" aria-label="Wishlist">♡</button>
                <p class="mp-feat" id="mpFeat"></p>
                <span class="mp-count" id="mpCount">1/1</span>
            </div>
        </div>`;
}

function mpPdpBuyMarkup() {
    return `
        <div class="mp-buy">
            <p class="mp-arrival" id="mpArrival">New Arrival</p>
            <h1 id="mpPName"></h1>
            <p class="mp-tagline" id="mpTagline"></p>
            <p class="mp-rate" id="mpRate"></p>
            <p class="mp-price" id="mpPPrice"></p>
            <p class="mp-label">Select Color</p>
            <div class="mp-colors" id="mpColors"></div>
            <p class="mp-label">Select Size</p>
            <div class="mp-sizes" id="mpSizes"></div>
            <p class="mp-label">Quantity</p>
            <div class="mp-step">
                <button type="button" id="mpQtyMinus" aria-label="Decrease quantity">−</button>
                <input id="mpQty" name="mpQty" inputmode="numeric" value="1" autocomplete="off">
                <button type="button" id="mpQtyPlus" aria-label="Increase quantity">+</button>
            </div>
            <div class="mp-buy-row">
                <button type="button" class="mp-addcart" id="mpAddCart">Add to Cart</button>
                <button type="button" class="mp-buynow" id="mpBuyNow">Buy Now</button>
            </div>
            <div class="mp-quick">
                <button type="button" id="mpWishLink">Add to Wishlist</button>
                <a href="/contact">Chat with Store</a>
                <button type="button" id="mpShare">Share</button>
            </div>
        </div>`;
}

function mpPdpTrustMarkup() {
    return `
        <aside class="mp-trust">
            <article class="mp-glass">
                <h3>Product Highlights</h3>
                <div id="mpPerks"></div>
            </article>
            <article class="mp-glass">
                <h3>Delivery Information</h3>
                <p id="mpPShip"></p>
                <p id="mpPCharge"></p>
                <p id="mpPShipDetail"></p>
                <a href="#mpPDesc">View Details</a>
            </article>
            <article class="mp-glass">
                <h3>Return &amp; Exchange</h3>
                <p id="mpPReturn"></p>
            </article>
        </aside>`;
}
