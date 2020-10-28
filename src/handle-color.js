const dom = require('sketch/dom');
const sketch = require('sketch');

const handleClrClick = (payload) => {
    const { hex } = payload;

    // Get Document, from document get page & layers.
    let document = sketch.getSelectedDocument(),
        selection = document.selectedLayers;
    
    if (!selection.isEmpty) {
        selection.forEach(layer => {
            layer.style.fills = [{
                color: hex,
                fillType: dom.Style.FillType.Color,
            }];
    
            layer.style.borders = [{
                enabled: false
            }];
        });
    } else {
        sketch.UI.message(`Copied ${hex} to clipboard.`);
    }
}

module.exports = handleClrClick;
