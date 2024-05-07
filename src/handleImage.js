const dom = require("sketch/dom");
const sketch = require("sketch");

const allowedFormats = ["jpg", "jpeg", "png", "gif", "svg", "webp"];

const handleImage = async ({ files, selectedFormat, type }) => {
  // Check if the file is an image.
  if (!allowedFormats.includes(selectedFormat)) {
    sketch.UI.message(
      `Could not load ${filename}. Please make sure it is a supported file type.`
    );
    return;
  }

  const file = files.find((file) => file.format === selectedFormat);

  // Get Document, from document get page & layers.
  const document = sketch.getSelectedDocument();
  const selection = document.selectedLayers;

  if (file.format === "svg") {
    fetch(file.url)
      .then((response) => response.text())
      .then((content) => handleSVG({ name: file.name, content }))
      .catch((err) => {
        console.log(err);
        sketch.UI.message(`Something went wrong with this file.`);
      });

    if (!selection.isEmpty) {
      sketch.UI.message(`SVG files cannot be inserted into shapes.`);
    }
  }

  if (file.format !== "svg") {
    if (!selection.isEmpty) {
      selection.forEach((layer) => {
        layer.style.fills = [
          {
            fill: "Pattern",
            pattern: {
              image: NSURL.URLWithString(encodeURI(file.url)),
              patternType: dom.Style.PatternFillType[type],
            },
          },
        ];

        layer.style.borders = [{ enabled: false }];
      });
    } else {
      const canvasView = context.document.contentDrawView();
      const center = canvasView.viewCenterInAbsoluteCoordinatesForViewPort(
        canvasView.viewPort()
      );

      const width = 350;
      const height = (file.dimensions.height / file.dimensions.width) * width;

      const x = center.x - width / 2;
      const y = center.y - height / 2;

      new sketch.Image({
        name: file.name,
        image: NSURL.URLWithString(encodeURI(file.url)),
        frame: { x, y, width, height },
        parent: sketch.getSelectedDocument().selectedPage,
      });
    }
  }
};

function handleSVG({ name, content }) {
  const svgString = NSString.stringWithString(content);
  const svgData = svgString.dataUsingEncoding(NSUTF8StringEncoding);

  const svgImporter = MSSVGImporter.svgImporter();
  svgImporter.prepareToImportFromData(svgData);
  const svgLayer = svgImporter.importAsLayer();

  svgLayer.setName(name);
  context.document.currentPage().addLayers([svgLayer]);

  const layer = dom.getSelectedDocument().getLayersNamed(name).pop();
  const canvasView = context.document.contentDrawView();
  const center = canvasView.viewCenterInAbsoluteCoordinatesForViewPort(
    canvasView.viewPort()
  );

  const width = 220;
  const height = (layer.frame.height / layer.frame.width) * width;

  const x = center.x - width / 2;
  const y = center.y - height / 2;

  positionInArtboard(layer, x, y, width, height);
}

const parentOffsetInArtboard = (layer) => {
  var offset = { x: 0, y: 0 };
  var parent = layer.parent;
  while (parent.name && parent.type !== "Artboard") {
    offset.x += parent.frame.x;
    offset.y += parent.frame.y;
    parent = parent.parent;
  }
  return offset;
};

const positionInArtboard = (layer, x, y, w, h) => {
  var parentOffset = parentOffsetInArtboard(layer);
  var newFrame = new dom.Rectangle(layer.frame);
  newFrame.x = x - parentOffset.x;
  newFrame.y = y - parentOffset.y;
  newFrame.width = w;
  newFrame.height = h;
  layer.frame = newFrame;
};

module.exports = { handleImage };
