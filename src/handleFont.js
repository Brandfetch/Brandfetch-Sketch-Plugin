import sketch from "sketch";

export const handleFont = ({ fontFamily }) => {
  // Get Document, from document get page & layers.
  const document = sketch.getSelectedDocument();
  const selection = document.selectedLayers;

  if (!selection.isEmpty) {
    selection.forEach((layer) => {
      if (layer.type == "Text") {
        const fonts = NSFontManager.sharedFontManager().availableFontFamilies();
        let exists = false;

        for (var i = 0; i < fonts.length; i++) {
          if (fonts[i] == fontFamily) {
            exists = true;
            break;
          }
        }

        if (exists) {
          layer.style.fontFamily = fontFamily;
        } else {
          sketch.UI.message(`Could not find ${fontFamily} font in Sketch.`);
        }
      }
    });
  } else {
    sketch.UI.message(`Copied ${fontFamily} to clipboard.`);
  }
};
