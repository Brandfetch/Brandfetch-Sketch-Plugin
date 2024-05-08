import BrowserWindow from "sketch-module-web-view";
import sketch from "sketch";

import { handleFile } from "./handleFile/index.js";
import { handleColor } from "./handleColor.js";
import { handleFont } from "./handleFont.js";
import { handleURL } from "./handleURL.js";

const identifier = "brandfetch";

export function open() {
  try {
    // Check if window is already opened.
    let win = BrowserWindow.fromId(identifier);

    console.log("Opening Brandfetch...");

    if (win) {
      console.log("Browser already open, closing it");
      return win.close();
    }

    // Initialize BrowserWindow.
    win = new BrowserWindow({
      identifier,
      title: "Brandfetch",
      maxHeight: 680,
      maxWidth: 440,
      minHeight: 620,
      minWidth: 360,
      height: 650,
      width: 400,
      show: false,
      acceptsFirstMouse: true,
      remembersWindowFrame: true,
      webPreferences: { devTools: true },
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

    win.loadURL("https://sketch-plugin.brandfetch.io/app");

    win.webContents.on("file", (payload) => {
      return handleFile(payload);
    });

    win.webContents.on("color", (payload) => {
      return handleColor(payload);
    });

    win.webContents.on("font", (payload) => {
      return handleFont(payload);
    });

    win.webContents.on("open_url", (payload) => {
      return handleURL(payload);
    });
  } catch (err) {
    sketch.UI.message("Something went wrong, check your network connexion.");
  }
}
