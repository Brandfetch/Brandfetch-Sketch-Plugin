require("core-js");
require("regenerator-runtime/runtime");
const BrowserWindow = require("sketch-module-web-view");
const sketch = require("sketch");

const { handleImage } = require("./handleImage.js");
const { handleColor } = require("./handleColor.js");
const { handleFont } = require("./handleFont.js");
const { handleLink } = require("./handleLink.js");

const openBrandfetch = () => {
  try {
    // Check if window is already opened.
    let win = BrowserWindow.fromId("open-bf");
    if (win) {
      console.log("Browser already open, closing it");
      return win.close();
    }

    // Initialize BrowserWindow.
    win = new BrowserWindow({
      identifier: "open-bf",
      title: "Brandfetch",
      maxHeight: 700,
      maxWidth: 400,
      minHeight: 500,
      minWidth: 315,
      height: 620,
      width: 380,
      show: false,
      acceptsFirstMouse: true,
      remembersWindowFrame: true,
      webPreferences: { devTools: false },
    });

    // Set window to top. Open window if ready.
    win.setAlwaysOnTop(true, "modal-panel");
    win.once("ready-to-show", () => {
      console.log("Opening browser");
      win.show();
    });

    // Close window, on close event.
    win.on("closed", () => {
      console.log("Window closed, nullifying it");
      win = null;
    });

    win.loadURL("https://sketch-plugin.brandfetch.io/");

    // Event listeners.
    win.webContents.on("file", (payload) => {
      const data = JSON.parse(payload);
      return handleImage(data);
    });

    win.webContents.on("color", (payload) => {
      const data = JSON.parse(payload);
      return handleColor(data);
    });

    win.webContents.on("font", (payload) => {
      const data = JSON.parse(payload);
      return handleFont(data);
    });

    win.webContents.on("open_url", (payload) => {
      const data = JSON.parse(payload);
      return handleLink(data);
    });
  } catch (err) {
    sketch.UI.message(`Something went wrong, check your network connexion.`);
  }
};

module.exports = { openBrandfetch };
