const dom = require('sketch/dom');
const sketch = require('sketch');


const handleImgClick = async (payload) => {
    const { filename, type, height, width, url, name, format } = payload;

    // Check if the file is an image.
    if (!['JPG', 'PNG', 'GIF', 'SVG'].includes(format)){
        sketch.UI.message(`Could not load ${filename}. Please make sure it is a supported file type.`);
        return;
    }

    // Get Document, from document get page & layers.
    let document = sketch.getSelectedDocument(),
        selection = document.selectedLayers;

    if (format === 'SVG') {
        fetch(url)
            .then(response => response.text())
            .then(content => doInsertSVG({ name, content }))
            .catch(err => {
                console.log(err);
                sketch.UI.message(`Something went wrong with this file.`)
            });

        if (!selection.isEmpty) {
            sketch.UI.message(`SVG files cannot be inserted into shapes.`);
        }
    }

    if (format !== 'SVG') {
        if (!selection.isEmpty) {
            selection.forEach(layer => {
                layer.style.fills = [{
                    fill: "Pattern",
                    pattern: {
                        image: NSURL.URLWithString(encodeURI(url)),
                        patternType: dom.Style.PatternFillType[type]
                    }
                }];
        
                layer.style.borders = [{
                    enabled: false
                }];
            });
        } 
        else {
            let canvasView = context.document.contentDrawView();
            let center = canvasView.viewCenterInAbsoluteCoordinatesForViewPort(canvasView.viewPort());
            
            let shapeW = type == 'Fit' ? 220 : 440,
                shapeH = (height / width) * shapeW;
        
            let centerX = center.x - (shapeW / 2),
                centerY = center.y - (shapeH / 2);
        
            new sketch.Image({
                name: name,
                image: NSURL.URLWithString(encodeURI(url)),
                frame: { x: centerX, y: centerY, width: shapeW, height: shapeH },
                parent: sketch.getSelectedDocument().selectedPage
            });
        }
    }
}

function doInsertSVG({ name, content }) {
    let svgString = NSString.stringWithString(content);
    let svgData = svgString.dataUsingEncoding(NSUTF8StringEncoding);

    let svgImporter = MSSVGImporter.svgImporter();
    svgImporter.prepareToImportFromData(svgData);
    let svgLayer = svgImporter.importAsLayer();

    svgLayer.setName(name);
    context.document.currentPage().addLayers([svgLayer]);

    let layer = dom.getSelectedDocument().getLayersNamed(name).pop();
    let canvasView = context.document.contentDrawView();
    let center = canvasView.viewCenterInAbsoluteCoordinatesForViewPort(canvasView.viewPort());
    
    let shapeW = 220,
        shapeH = (layer.frame.height / layer.frame.width) * shapeW;

    let centerX = center.x - (shapeW / 2),
        centerY = center.y - (shapeH / 2);

    positionInArtboard(layer, centerX, centerY, shapeW, shapeH);
}

const parentOffsetInArtboard = (layer) => {
    var offset = {x: 0, y: 0};
    var parent = layer.parent;
    while (parent.name && parent.type !== 'Artboard') {
      offset.x += parent.frame.x;
      offset.y += parent.frame.y;
      parent = parent.parent;
    }
    return offset;
}

const positionInArtboard = (layer, x, y, w, h) => {
    var parentOffset = parentOffsetInArtboard(layer);
    var newFrame = new dom.Rectangle(layer.frame);
    newFrame.x = x - parentOffset.x;
    newFrame.y = y - parentOffset.y;
    newFrame.width = w;
    newFrame.height = h;
    layer.frame = newFrame;
}

module.exports = handleImgClick;