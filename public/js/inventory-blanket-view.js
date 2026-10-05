function invBlanketFieldsMarkup() {
    return `
                    <div id="invBlanketWrap" hidden>
                        <div class="grid-2">
                            <div class="field"><label>Ply Type</label>
                                <select id="invBlanketPly" name="invBlanketPly" autocomplete="off">
                                    <option>Single Ply</option>
                                    <option selected>Double Ply</option>
                                    <option>Heavy Double Ply</option>
                                </select></div>
                            <div class="field"><label>Size Preset</label>
                                <select id="invBlanketSize" name="invBlanketSize" autocomplete="off">
                                    <option>Single Bed</option>
                                    <option>Double Bed</option>
                                    <option selected>King Size</option>
                                    <option>Baby Blanket</option>
                                </select></div>
                        </div>
                        <div class="grid-2">
                            <div class="field"><label>Weight (KG) *</label>
                                <input id="invBlanketWeight" name="invBlanketWeight" type="number" min="0.1" step="0.1"
                                    placeholder="4.5" autocomplete="off"></div>
                            <div class="field"><label>Material / Type</label>
                                <select id="invBlanketMaterial" name="invBlanketMaterial" autocomplete="off">
                                    <option>Mink Blanket</option>
                                    <option>Fleece</option>
                                    <option>Microfiber</option>
                                    <option>Woolen</option>
                                </select></div>
                        </div>
                    </div>`;
}
