const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("node:path");

const isDev = !app.isPackaged;
const iconPath = path.join(__dirname, "../build/icon.png");

function createWindow() {
  const win = new BrowserWindow({
    width: 291,
    height: 485,
    resizable: false,
    frame: false,
    transparent: true,
    hasShadow: false,
    icon: iconPath,
    backgroundColor: "#00000000",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      webSecurity: true,
    },
  });

  win.center();

  if (isDev) {
    win.loadURL("http://localhost:5173");
  } else {
    win.loadFile(path.join(__dirname, "../dist/index.html"));
  }
}

app.whenReady().then(() => {
  ipcMain.on("window:minimize", (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) win.minimize();
  });

  ipcMain.on("window:close", (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) win.close();
  });

  if (process.platform === "darwin") {
    app.dock.setIcon(iconPath);
  }
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
