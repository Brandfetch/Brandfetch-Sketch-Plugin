import dom from "sketch/dom";

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

export const handleSVG = ({ name, content }) => {
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
};
