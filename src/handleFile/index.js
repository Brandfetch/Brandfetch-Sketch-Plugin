import sketch from "sketch";

import { handleSVG } from "./utils.js";

const allowedFormats = ["jpg", "jpeg", "png", "gif", "svg", "webp"];

export const handleFile = async ({ name, formats, currentFormat, type }) => {
  console.log(name, formats, currentFormat, type);

  // Check if the file is an image.
  if (!allowedFormats.includes(currentFormat)) {
    sketch.UI.message(
      `Could not load ${currentFormat} file. Please make sure the format is supported.`
    );
    return;
  }

  const file = formats.find((file) => file.format === currentFormat);

  // Get Document, from document get page & layers.
  const document = sketch.getSelectedDocument();
  const selection = document.selectedLayers;

  if (file.format === "svg") {
    fetch(file.src)
      .then((response) => response.text())
      .then((content) => handleSVG({ name, content }))
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
            fillType: "Pattern",
            pattern: {
              image: NSURL.URLWithString(encodeURI(file.src)),
              patternType: type,
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
      const height = (file.height / file.width) * width;

      const x = center.x - width / 2;
      const y = center.y - height / 2;

      new sketch.Image({
        name: name,
        image: NSURL.URLWithString(encodeURI(file.src)),
        frame: { x, y, width, height },
        parent: sketch.getSelectedDocument().selectedPage,
      });
    }
  }
};
