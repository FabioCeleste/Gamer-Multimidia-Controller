const { app, BrowserWindow, Tray, Menu } = require("electron");

const path = require("path");
const WebSocket = require("ws");

const clients = [];

if (require("electron-squirrel-startup")) {
  app.quit();
}

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 180,
    height: 53,
    frame: false,
    autoHideMenuBar: true,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
  });

  const wss = new WebSocket.Server({ port: 1337 });

  wss.on("connection", function connection(ws) {
    console.log("Wss Client connected");

    clients.push(ws);

    ws.on("message", function incoming(message) {
      clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message.toString());
        }
      });
    });

    ws.on("close", function close() {
      console.log("Client disconnected");
    });
  });

  mainWindow.loadFile(
    path.join(__dirname, "pages", "PlaybackController", "index.html")
  );

  mainWindow.setAlwaysOnTop(true, "screen-saver");

  mainWindow.once("ready-to-show", () => {
    mainWindow.setSkipTaskbar(true); // Hide the icon from the taskbar
    mainWindow.show(); // Show the window
  });

  let tray = new Tray(path.join(__dirname, "assets", "icons", "tray-icon.jpg"));
  tray.setToolTip("Gamer Multimidia Controller");

  tray.on("click", () => {
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.show();
    }
  });

  const contextMenu = Menu.buildFromTemplate([
    { label: "quit", click: () => app.quit() }, // Add option to close the app
  ]);

  tray.setContextMenu(contextMenu);

  app.setAppUserModelId(process.execPath);

  // mainWindow.webContents.openDevTools();
};

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
