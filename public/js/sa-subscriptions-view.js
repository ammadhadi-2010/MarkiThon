function saSubPlanFields(plan, index) {
    const p = plan || {};
    const feats = (p.features || []).join('\n');
    return `<article class="sa-sub-plan" data-sub-index="${index}">
        <h4>Plan ${index + 1}</h4>
        <label>Plan ID<input class="sa-sub-id" autocomplete="off" value="${saText(p.id || '')}"></label>
        <label>Display label<input class="sa-sub-label" autocomplete="off" value="${saText(p.label || '')}"></label>
        <label>Icon<input class="sa-sub-icon" autocomplete="off" value="${saText(p.icon || '📦')}"></label>
        <div class="sa-sub-row">
            <label>Monthly (Rs.)<input class="sa-sub-monthly" type="number" min="0" autocomplete="off" value="${p.monthlyPrice ?? 0}"></label>
            <label>Yearly (Rs.)<input class="sa-sub-yearly" type="number" min="0" autocomplete="off" value="${p.yearlyPrice ?? 0}"></label>
        </div>
        <div class="sa-sub-row">
            <label>Product limit<input class="sa-sub-products" type="number" min="0" autocomplete="off" value="${p.productLimit ?? 0}"></label>
            <label>Order limit<input class="sa-sub-orders" type="number" min="0" autocomplete="off" value="${p.orderLimit ?? 0}"></label>
        </div>
        <label class="sa-sub-pop"><input type="checkbox" class="sa-sub-popular" autocomplete="off"${p.popular ? ' checked' : ''}> Mark as most popular</label>
        <label>Features (one per line)<textarea class="sa-sub-features" rows="4" autocomplete="off">${saText(feats)}</textarea></label>
    </article>`;
}

function saSubscriptionsMarkup(sub) {
    const row = sub || {};
    return `<div id="saSubscriptions">
        ${saHead('Subscription Packages', 'Configure plans, pricing, limits, and shopkeeper extensions.')}
        <div class="sa-sub-grid">
            <section class="sa-card sa-sub-editor">
                <div class="sa-head"><h3>Plan catalog</h3><button class="sa-add" type="button" id="saSubSave">Save Plans</button></div>
                <div id="saSubPlans"></div>
                <p class="sa-note" id="saSubNote"></p>
            </section>
            <section class="sa-card">
                <h3>Shopkeeper limits override</h3>
                <p class="sa-muted">Expand product and order caps for the live shop (Shop ID 1).</p>
                <form id="saSubLimitsForm" autocomplete="off">
                    <label>Extra product allowance<input id="saSubExtraProducts" type="number" min="0" autocomplete="off" value="${row.limitOverrideProducts || 0}"></label>
                    <label>Extra order allowance<input id="saSubExtraOrders" type="number" min="0" autocomplete="off" value="${row.limitOverrideOrders || 0}"></label>
                    <label>Extension note<textarea id="saSubExtensionNote" rows="2" autocomplete="off">${saText(row.extensionNote || '')}</textarea></label>
                    <p class="sa-muted">Effective limits: <strong id="saSubEffective">${row.productLimit || 0}</strong> products · <strong id="saSubEffectiveOrders">${row.orderLimit || 0}</strong> orders</p>
                    <button class="sa-add" type="submit">Apply Override</button>
                </form>
                <p class="sa-note" id="saSubLimitNote"></p>
            </section>
            <section class="sa-card">
                <h3>Pending payments</h3>
                <div id="saSubPending"></div>
            </section>
        </div>
    </div>`;
}
