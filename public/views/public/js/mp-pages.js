function mpPagesMarkup(page) {
    if (page === 'about') {
        return `
        <section class="mp-block mp-page">
            <h1>About MarkiThon</h1>
            <p>MarkiThon is Pakistan's fabric and clothing marketplace. We connect shoppers with verified local shops without replacing each seller's own storefront.</p>
            <p>Browse new arrivals, seasonal offers and best sellers from one dark-glass platform, then complete checkout with confidence.</p>
        </section>`;
    }
    if (page === 'blog') {
        const posts = [
            ['How to choose lawn for summer', 'A short guide to fabric weight, print and stitching.'],
            ['Bedsheet sizes explained', 'King, queen and double — what actually fits your bed.'],
            ['Winter blanket buying tips', 'GSM, lining and care so warmth lasts longer.']
        ].map((row) => `<article class="mp-post"><h3>${row[0]}</h3><p>${row[1]}</p></article>`).join('');
        return `<section class="mp-block mp-page"><h1>Blog</h1><div class="mp-posts">${posts}</div></section>`;
    }
    return `
        <section class="mp-block mp-page">
            <h1>Contact</h1>
            <p>Questions about the MarkiThon marketplace? Send a message below.</p>
            <form class="mp-contact" id="mpContactForm" autocomplete="off">
                <label>Name<input id="mpContactName" name="mpContactName" required autocomplete="off"></label>
                <label>Email<input id="mpContactEmail" name="mpContactEmail" type="email" required autocomplete="off"></label>
                <label>Message<textarea id="mpContactMsg" name="mpContactMsg" rows="4" required autocomplete="off"></textarea></label>
                <button type="submit" class="mp-cta">Send Message</button>
            </form>
        </section>`;
}

function mpBindContact(root) {
    const form = root.querySelector('#mpContactForm');
    if (!form) return;
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        form.querySelector('button').textContent = 'Message sent';
        form.reset();
    });
}
