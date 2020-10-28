const sketch = require('sketch');

const handleFntClick = (payload) => {
    const { fontName } = payload;

    // Get Document, from document get page & layers.
    let document = sketch.getSelectedDocument(),
        selection = document.selectedLayers;
    
    if (!selection.isEmpty) {
        selection.forEach(layer => {
            if (layer.type == 'Text') {
                const fonts = NSFontManager.sharedFontManager().availableFontFamilies();
                let exists = false;

                for (var i = 0; i < fonts.length; i++) {
                    if (fonts[i] == fontName) {
                        exists = true;
                        break;
                    }
                } 

                if (exists) {
                    layer.style.fontFamily = fontName;
                }
                else {
                    sketch.UI.message(`Could not find ${fontName} font in Sketch.`);
                }
            }
        });
    } else {
        sketch.UI.message(`Copied ${fontName} to clipboard.`);
    }
}

module.exports = handleFntClick;