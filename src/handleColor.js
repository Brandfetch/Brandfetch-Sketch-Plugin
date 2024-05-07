const dom = require("sketch/dom");
const sketch = require("sketch");

const handleColor = ({ hexColor }) => {
  // Get Document, from document get page & layers.
  const document = sketch.getSelectedDocument();
  const selection = document.selectedLayers;

  if (!selection.isEmpty) {
    selection.forEach((layer) => {
      layer.style.fills = [
        {
          color: hexColor,
          fillType: dom.Style.FillType.Color,
        },
      ];

      layer.style.borders = [
        {
          enabled: false,
        },
      ];
    });
  } else {
    sketch.UI.message(`Copied ${hexColor} to clipboard.`);
  }
};

module.exports = { handleColor };
