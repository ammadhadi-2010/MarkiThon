function invBedsheetFieldsMarkup() {
    return `
                    <div id="invBedsheetWrap" hidden>
                        <div class="field"><label>Size Preset</label>
                            <select id="invSheetSize" name="invSheetSize" autocomplete="off">
                                <option>Single (60 x 95 in)</option>
                                <option>King (95 x 99 in)</option>
                                <option>Super King</option>
                                <option>Custom</option>
                            </select></div>
                        <div class="grid-2">
                            <div class="field"><label>Bedsheet Size (Inches)</label>
                                <input id="invSheetDim" name="invSheetDim" placeholder="60 x 95 in" autocomplete="off"></div>
                            <div class="field"><label>Pillow Cover Size (Inches)</label>
                                <input id="invPillowSize" name="invPillowSize" placeholder="19 x 29 in" autocomplete="off"></div>
                        </div>
                        <div class="grid-2">
                            <div class="field"><label>Pillow Covers Count</label>
                                <select id="invPillowCount" name="invPillowCount" autocomplete="off">
                                    <option value="0">0 (Sheet Only)</option>
                                    <option value="1">1 Pillow Cover</option>
                                    <option value="2">2 Pillow Covers</option>
                                    <option value="4">4 Pillow Covers</option>
                                </select></div>
                            <div class="field"><label>Product Weight</label>
                                <div class="grid-2">
                                    <input id="invSheetWeight" name="invSheetWeight" type="number" min="0" step="0.01" placeholder="500" autocomplete="off">
                                    <select id="invSheetWeightUnit" name="invSheetWeightUnit" autocomplete="off">
                                        <option value="gm">Grams / gm</option>
                                        <option value="kg">Kilograms / kg</option>
                                    </select>
                                </div></div>
                        </div>
                        <div class="field"><label>Fabric / Material</label>
                            <select id="invSheetMaterial" name="invSheetMaterial" autocomplete="off">
                                <option>Cotton</option>
                                <option>Lawn</option>
                                <option>Velvet</option>
                                <option>Satin</option>
                                <option>Linen</option>
                            </select></div>
                    </div>`;
}
