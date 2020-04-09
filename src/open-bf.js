require('core-js');
require('regenerator-runtime/runtime');
const BrowserWindow = require('sketch-module-web-view');
const dom = require('sketch/dom');
const sketch = require('sketch');

function parentOffsetInArtboard(layer) {
    var offset = {x: 0, y: 0};
    var parent = layer.parent;
    while (parent.name && parent.type !== 'Artboard') {
      offset.x += parent.frame.x;
      offset.y += parent.frame.y;
      parent = parent.parent;
    }
    return offset;
}

function positionInArtboard(layer, x, y) {
    var parentOffset = parentOffsetInArtboard(layer);
    var newFrame = new dom.Rectangle(layer.frame);
    newFrame.x = x - parentOffset.x;
    newFrame.y = y - parentOffset.y;
    layer.frame = newFrame;
}

function doInsertSVG(svgCode) {
    log(svgCode);
    let svgString = NSString.stringWithString(svgCode);
    let svgData = svgString.dataUsingEncoding(NSUTF8StringEncoding);

    let svgImporter = MSSVGImporter.svgImporter();
    svgImporter.prepareToImportFromData(svgData);
    let svgLayer = svgImporter.importAsLayer();

    svgLayer.setName('SVG Layer');
    context.document.currentPage().addLayers([svgLayer]);

    let layer = dom.getSelectedDocument().getLayersNamed('SVG Layer').pop();
    let canvasView = context.document.contentDrawView();
    let center = canvasView.viewCenterInAbsoluteCoordinatesForViewPort(canvasView.viewPort());
    
    let shiftX = layer.frame.width / 2,
        shiftY = layer.frame.height / 2;

    let centerX = center.x - shiftX,
        centerY = center.y - shiftY;

    positionInArtboard(layer, centerX, centerY);
    context.document.showMessage("inserted SVG file.");
}

// documentation: https://developer.sketchapp.com/reference/api/
const getExt = (filename) => {
    var idx = filename.lastIndexOf('.');
    return (idx < 1) ? '' : filename.substr(idx + 1).toUpperCase();
};

export const openBrandfetch = (context) => {
    // Check if window is already opened.
    let win = BrowserWindow.fromId('open-bf');
    if (win) {
        log('Browser already open, closing it');
        win.close();
        return;
    }

    // Initialize BrowserWindow.
    win = new BrowserWindow({
        identifier: 'open-bf',
        title: 'Brandfetch',
        width: 380,
        height: 623,
        show: false,
        acceptsFirstMouse: true
    });

    // Set window to top. 
    // Open window, if ready open.
    win.setAlwaysOnTop(true, 'modal-panel');
    win.once('ready-to-show', () => {
        log('Opening browser');
        win.show();
    });

    // Close window, on close event.
    win.on('closed', () => {
        log('window closed, nullifying it');
        win = null;
    })

    // Load the remote URL.
    win.loadURL('https://plugin.brandfetch.io/plugin/sketch');

    // Event listeners.
    win.webContents.on('clickExternalLink', (payload) => clickExternalLink(payload));
    win.webContents.on('helloMessage', (payload) => helloMessage(payload));
    win.webContents.on('imageClicked', (payload) => imageClicked(payload));
    win.webContents.on('colorClicked', (payload) => colorClicked(payload));
    win.webContents.on('fontClicked', (payload) => fontClicked(payload));
    win.webContents.on('logoClicked', (payload) => logoClicked(payload));
};


// If intro image is clicked.
const helloMessage = (payload) => {
    sketch.UI.message(payload.message);
};

// Open external link.
const clickExternalLink = (payload) => {
    NSWorkspace.sharedWorkspace().openURL(NSURL.URLWithString(payload.url));
};


// If Image is clicked.
const imageClicked = async (payload) => {
    // get image payload. 
    const { filename, url } = payload;

    // Get Document, from document get page & layers.
    // parent = document.selectedPage,
    let document = sketch.getSelectedDocument(),
        selection = document.selectedLayers,
        ext = getExt(filename);

    // Check if the file is an image.
    if (!(ext == 'JPG' || ext == 'PNG' || ext == 'GIF')){
        sketch.UI.message(`Could not load ${filename}. Please make sure it is a supported file type.`);
        return;
    }

    // URL To DataImage
    const imgURL = NSURL.URLWithString(encodeURI(url));

    if (!selection.isEmpty) {
        selection.forEach(layer => {
            layer.style.fills = [{
                fill: "Pattern",
                pattern: {
                    image: imgURL,
                    patternType: dom.Style.PatternFillType.Fill
                }
            }];
    
            layer.style.borders = [{
                enabled: false
            }];
        });
    } else {
        sketch.UI.message(`To insert an image, please select one layer.`);
    }
}


// If color is clicked.
const colorClicked = (payload) => {
    // get image payload. 
    const { color } = payload;

    // Get Document, from document get page & layers.
    let document = sketch.getSelectedDocument(),
        selection = document.selectedLayers;
    
    if (!selection.isEmpty) {
        selection.forEach(layer => {
            layer.style.fills = [{
                color: color,
                fillType: dom.Style.FillType.Color,
            }];
    
            layer.style.borders = [{
                enabled: false
            }];
        });
    } else {
        sketch.UI.message(`Copied "${color}" to clipboard.`);
    }
}


// If font is clicked.
const fontClicked = (payload) => {
    // get image payload. 
    const { fontName } = payload;

    // Get Document, from document get page & layers.
    let document = sketch.getSelectedDocument(),
        selection = document.selectedLayers;
    
    if (!selection.isEmpty) {
        selection.forEach(layer => {
            if (layer.type == 'Text') {
                const current = layer.style.fontFamily;
                layer.style.fontFamily = fontName;

                if (current == layer.style.fontFamily) {
                    sketch.UI.message(`Could not find "${fontName}" font in Sketch.`);
                }
            }
        });
    } else {
        sketch.UI.message(`Copied "${fontName}" to clipboard.`);
    }
}


// If Logo is clicked.
const logoClicked = (payload) => {
    // get image payload. 
    let svgEl = payload.find(x => x.format == "svg"),
        imgEl = payload.find(x => x.format != "svg");

    // Get Document, from document get page & layers.
    // parent = document.selectedPage,
    let document = sketch.getSelectedDocument(),
        selection = document.selectedLayers;

    // Check if the file is an image.
    if (svgEl && selection.isEmpty) {
        fetch(svgEl.url)
            .then(response => response.text())
            .then(text => {
                doInsertSVG(text);
            })
            .catch(err => {
                log(err.message);
                sketch.UI.message(`Something went wrong with this file.`)
            });
    }
    else if (imgEl.format == 'jpg' || imgEl.format == 'png' || imgEl.format == 'gif') {
        // URL To DataImage
        const imgURL = NSURL.URLWithString(encodeURI(imgEl.url));

        if (!selection.isEmpty) {
            selection.forEach(layer => {
                layer.style.fills = [{
                    fill: "Pattern",
                    pattern: {
                        image: imgURL,
                        patternType: dom.Style.PatternFillType.Fit
                    }
                }];
        
                layer.style.borders = [{
                    enabled: false
                }];
            });
        } else {
            let canvasView = context.document.contentDrawView(),
                center = canvasView.viewCenterInAbsoluteCoordinatesForViewPort(canvasView.viewPort());
            
            new sketch.Image({
                image: imgURL,
                frame: { x: center.x, y: center.y, width: imgEl.size.width, height: imgEl.size.height },
                parent: sketch.getSelectedDocument().selectedPage
            });
        }
    }
    else {
        sketch.UI.message(`Could not load ${imgEl.name}. Please make sure it is a supported file type.`);
        return;
    }
}
