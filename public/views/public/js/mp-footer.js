function mpFooterMarkup() {
    return `
    <section class="mp-stay" id="mpNews">
        <div>
            <h3>Stay Updated</h3>
            <p>Get the latest products, offers and shop updates directly to your inbox.</p>
        </div>
        <form class="mp-news" autocomplete="off">
            <input id="mpNewsEmail" name="mpNewsEmail" type="email" placeholder="Enter your email address" autocomplete="off">
            <button type="submit">Subscribe</button>
        </form>
    </section>
    <footer class="mp-foot">
        <div>
            <img class="mp-logo" src="/assets/logo.png" alt="MarkiThon">
            <strong>MarkiThon</strong>
            <p>Local shops. Global vibes.</p>
            <p class="mp-social">
                <a href="/about" data-foot-social="facebook" aria-label="Facebook">f</a>
                <a href="/about" data-foot-social="instagram" aria-label="Instagram">ig</a>
                <a href="/about" data-foot-social="youtube" aria-label="YouTube">yt</a>
                <a href="/about" data-foot-social="tiktok" aria-label="TikTok">tk</a>
            </p>
        </div>
        <div>
            <h4>Company</h4>
            <a href="/about" data-foot-link="company-about">About MarkiThon</a>
            <a href="/mission" data-foot-link="company-mission">Our Mission</a>
            <a href="/careers" data-foot-link="company-careers">Careers</a>
            <a href="/contact" data-foot-link="company-contact">Contact Us</a>
            <a href="/app" data-foot-link="company-become">Become a Shopkeeper</a>
            <a href="/terms" data-foot-link="company-terms">Terms &amp; Conditions</a>
        </div>
        <div>
            <h4>Help &amp; Support</h4>
            <a href="/faqs" data-foot-link="support-faqs">FAQs</a>
            <a href="/delivery" data-foot-link="support-delivery">Delivery Information</a>
            <a href="/returns" data-foot-link="support-returns">Returns &amp; Exchange</a>
            <a href="/profile/orders" data-foot-link="support-tracking">Order Tracking</a>
            <a href="/contact" data-foot-link="support-support">Contact Support</a>
        </div>
        <div>
            <h4>For Shopkeepers</h4>
            <a href="/app" data-foot-link="shopkeepers-open">Open Your Shop</a>
            <a href="/app" data-foot-link="shopkeepers-login">Login</a>
            <a href="/app" data-foot-link="shopkeepers-register">Shopkeeper Registration</a>
            <a href="/about" data-foot-link="shopkeepers-pricing">Pricing</a>
        </div>
        <div>
            <h4>Download Our App</h4>
            <p data-mp-app-note>Coming Soon</p>
            <p class="mp-stores"><span>Google Play</span><span>App Store</span></p>
        </div>
        <p class="mp-copy">© 2026 MarkiThon. All rights reserved. <span>Local Shops. Global Vibes.</span></p>
    </footer>`;
}
