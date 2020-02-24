require('core-js');
require('regenerator-runtime/runtime');
const BrowserWindow = require('sketch-module-web-view');
const dom = require('sketch/dom');
const sketch = require('sketch');


// documentation: https://developer.sketchapp.com/reference/api/
const getExt = (filename) => {
    var idx = filename.lastIndexOf('.');
    return (idx < 1) ? '' : filename.substr(idx + 1).toUpperCase();
};

const getId = (filename) => {
    let idx = filename.split('.'); 
    return (idx.length < 1) ? '' : idx[0];
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
        height: 600,
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
    win.webContents.on('helloMessage', (payload) => helloMessage(payload));
    win.webContents.on('imageClicked', (payload) => imageClicked(payload));
    win.webContents.on('colorClicked', (payload) => colorClicked(payload));
    win.webContents.on('fontClicked', (payload) => fontClicked(payload));
};


// If intro image is clicked.
const helloMessage = (payload) => {
    sketch.UI.message(payload.message);
};


// If Image is clicked.
const imageClicked = (payload) => {
    // get image payload. 
    const { filename, url, type } = payload;
    sketch.UI.message(`Placing Logo: ${filename}`);
    log(`Payload: ${payload}`);

    // Get Document, from document get page & layers.
    let document = sketch.getSelectedDocument(),
        // parent = document.selectedPage,
        selection = document.selectedLayers;
    
    // Check if the file is an image.
    const ext = getExt(filename), id = getId(filename);
    log(`File ext: ${ext}`);
    log(`File id: ${id}`);

    if (!(ext == 'JPG' || ext == 'PNG' || ext == 'GIF')){
        sketch.UI.message(`Could not load ${filename}. Please make sure it is a supported file type.`)
        return
    }

    // URL To DataImage
    const imgURL = NSURL.URLWithString(encodeURI(url));

    if (!selection.isEmpty) {
        selection.forEach(layer => {
            let patternType = dom.Style.PatternFillType[type];
    
            layer.style.fills = [{
                fill: "Pattern",
                pattern: {
                    image: imgURL,
                    patternType: patternType
                }
            }];
    
            layer.style.borders = [{
                enabled: false
            }];
        });

        sketch.UI.message(`Placed image: ${filename}.`);
        log(`Selection filled with: ${filename}`);
    } else {
        sketch.UI.message(`To insert an image, please select one layer.`);
    }
}


// If color is clicked.
const colorClicked = (payload) => {
    // get image payload. 
    const { color } = payload;
    log(`Payload: ${color}`);

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
    log(`Payload: ${fontName}`);

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