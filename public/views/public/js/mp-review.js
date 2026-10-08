let mpReviewRows = [];
let mpReviewProductId = '';

function mpReviewCard(item) {
    const stars = Math.max(1, Math.min(5, Number(item.stars) || 0));
    const marks = [1, 2, 3, 4, 5].map((n) =>
        `<span class="mp-star${n <= stars ? ' is-on' : ''}" aria-hidden="true">★</span>`
    ).join('');
    return `<article class="mp-review">
        <strong>${mpEscape(item.reviewerName)}</strong>
        <p class="mp-review-stars" aria-label="${stars} out of 5 stars">${marks}</p>
        <p>${mpEscape(item.description)}</p>
    </article>`;
}

function mpPaintReviewList() {
    const box = document.getElementById('mpPReviews');
    const rate = document.getElementById('mpRate');
    if (box) {
        box.innerHTML = mpReviewRows.length
            ? mpReviewRows.map(mpReviewCard).join('')
            : '<p class="mp-review-empty">No reviews yet.</p>';
    }
    const tab = document.getElementById('mpTabReviews');
    if (tab) tab.textContent = `Reviews (${mpReviewRows.length})`;
    if (!rate) return;
    const avg = mpReviewRows.length
        ? (mpReviewRows.reduce((sum, item) => sum + Number(item.stars || 0), 0) / mpReviewRows.length).toFixed(1)
        : '';
    const count = mpReviewRows.length ? ` <span>(${mpReviewRows.length} reviews)</span>` : '';
    const score = avg ? `<strong>${mpEscape(avg)}</strong>${count}` : '';
    rate.innerHTML = `★★★★★ ${score} <button type="button" id="mpWrite">Write a Review</button>`;
}

function mpSetReviews(list) {
    mpReviewRows = Array.isArray(list) ? list.slice() : [];
    mpPaintReviewList();
}

function mpReviewModalMarkup() {
    const stars = [1, 2, 3, 4, 5].map((n) =>
        `<button type="button" data-mpstar="${n}" aria-label="${n} star${n > 1 ? 's' : ''}">★</button>`
    ).join('');
    return `
    <div class="mp-modal" id="mpReviewModal" hidden>
        <div class="mp-modal-card" role="dialog" aria-modal="true" aria-labelledby="mpReviewTitle">
            <button type="button" class="mp-modal-x" id="mpReviewClose" aria-label="Close">×</button>
            <h2 id="mpReviewTitle">Write a Review</h2>
            <form id="mpReviewForm" autocomplete="off">
                <p class="mp-label">Star rating</p>
                <div class="mp-stars" id="mpReviewStars" role="radiogroup" aria-label="Star rating">${stars}</div>
                <label for="mpReviewName">Your name</label>
                <input id="mpReviewName" name="reviewerName" maxlength="80" autocomplete="off" required>
                <label for="mpReviewText">Review</label>
                <textarea id="mpReviewText" name="description" rows="4" maxlength="1000" autocomplete="off" required></textarea>
                <p class="mp-review-msg" id="mpReviewMsg"></p>
                <button type="submit" class="mp-addcart" id="mpReviewSubmit">Submit Review</button>
            </form>
        </div>
    </div>`;
}

function mpSetReviewStars(modal, value) {
    modal.dataset.stars = String(value);
    modal.querySelectorAll('[data-mpstar]').forEach((btn) => {
        btn.classList.toggle('on', Number(btn.dataset.mpstar) <= value);
    });
}

function mpCloseReview() {
    const modal = document.getElementById('mpReviewModal');
    if (modal) modal.hidden = true;
}

function mpOpenReview(root, productId) {
    mpReviewProductId = productId;
    if (!document.getElementById('mpReviewModal')) {
        root.insertAdjacentHTML('beforeend', mpReviewModalMarkup());
        const modal = document.getElementById('mpReviewModal');
        modal.addEventListener('click', (event) => {
            if (event.target === modal || event.target.closest('#mpReviewClose')) mpCloseReview();
            const star = event.target.closest('[data-mpstar]');
            if (star) mpSetReviewStars(modal, Number(star.dataset.mpstar));
        });
        modal.querySelector('#mpReviewForm').addEventListener('submit', (event) => {
            event.preventDefault();
            mpSubmitReview(modal);
        });
    }
    const modal = document.getElementById('mpReviewModal');
    mpSetReviewStars(modal, Number(modal.dataset.stars) || 5);
    const msg = modal.querySelector('#mpReviewMsg');
    if (msg) msg.textContent = '';
    modal.hidden = false;
    modal.querySelector('#mpReviewName').focus();
}

async function mpSubmitReview(modal) {
    const name = modal.querySelector('#mpReviewName').value.trim();
    const description = modal.querySelector('#mpReviewText').value.trim();
    const stars = Number(modal.dataset.stars) || 0;
    const msg = modal.querySelector('#mpReviewMsg');
    const button = modal.querySelector('#mpReviewSubmit');
    if (name.length < 2) {
        msg.textContent = 'Please enter your name.';
        return;
    }
    if (description.length < 8) {
        msg.textContent = 'Please write a short review.';
        return;
    }
    if (stars < 1 || stars > 5) {
        msg.textContent = 'Choose a star rating from 1 to 5.';
        return;
    }
    button.disabled = true;
    try {
        const res = await fetch('/api/products/' + encodeURIComponent(mpReviewProductId) + '/reviews', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reviewerName: name, stars, description })
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.review) throw new Error(data.message || 'Could not submit review.');
        mpReviewRows = [data.review].concat(mpReviewRows);
        mpPaintReviewList();
        modal.querySelector('#mpReviewForm').reset();
        mpSetReviewStars(modal, 5);
        mpCloseReview();
        document.getElementById('mpPReviews')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (error) {
        msg.textContent = error.message || 'Could not submit review.';
    } finally {
        button.disabled = false;
    }
}
