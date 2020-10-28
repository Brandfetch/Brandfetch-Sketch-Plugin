require('core-js');
require('regenerator-runtime/runtime');
const BrowserWindow = require('sketch-module-web-view');
const sketch = require('sketch');

const handleImgClick = require('./handle-img.js');
const handleClrClick = require('./handle-color.js');
const handleFntClick = require('./handle-font.js');

const handleLinkClick = (url) => {
    NSWorkspace.sharedWorkspace().openURL(NSURL.URLWithString(url));
}

const openBrandfetch = () => {
    try {
        // Check if window is already opened.
        let win = BrowserWindow.fromId('open-bf');
        if (win) {
            console.log('Browser already open, closing it');
            return win.close();
        }

        // Initialize BrowserWindow.
        win = new BrowserWindow({
            identifier: 'open-bf',
            title: 'Brandfetch',
            maxHeight: 700,
            maxWidth: 400,
            minHeight: 500,
            minWidth: 315,
            height: 620,
            width: 380,
            show: false,
            acceptsFirstMouse: true,
            remembersWindowFrame: true,
            webPreferences: {
                devTools: false
            }
        });

        // Set window to top. Open window if ready.
        win.setAlwaysOnTop(true, 'modal-panel');
        win.once('ready-to-show', () => {
            console.log('Opening browser');
            win.show();
        });

        // Close window, on close event.
        win.on('closed', () => {
            console.log('Window closed, nullifying it');
            win = null;
        });

        win.loadURL('https://sketch-plugin.brandfetch.io');

        // Event listeners.
        win.webContents.on('img_click', (payload) => handleImgClick(payload));
        win.webContents.on('clr_click', (payload) => handleClrClick(payload));
        win.webContents.on('fnt_click', (payload) => handleFntClick(payload));
        win.webContents.on('ext_click', (payload) => handleLinkClick(payload.url));
    }
    catch(err) {
        sketch.UI.message(`Something went wrong, check your network connexion.`);
    }
};

module.exports = { openBrandfetch };
