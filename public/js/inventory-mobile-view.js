function invMobileFieldsMarkup() {
    return `
                    <div id="invMobileWrap" hidden>
                        <div class="grid-2">
                            <div class="field"><label>Compatibility</label>
                                <select id="invCompatibility" name="invCompatibility" autocomplete="off">
                                    <option>Type-C</option>
                                    <option>Lightning</option>
                                    <option>Universal</option>
                                </select></div>
                            <div class="field"><label>Warranty Type</label>
                                <select id="invWarranty" name="invWarranty" autocomplete="off">
                                    <option>None</option>
                                    <option>7 Days</option>
                                    <option>Brand Warranty</option>
                                </select></div>
                        </div>
                    </div>`;
}
