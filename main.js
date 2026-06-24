const { app, BrowserWindow, Menu, globalShortcut, ipcMain } = require('electron');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

function getMachineId() {
  const nets = os.networkInterfaces();
  const macs = [];

  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (
        net &&
        !net.internal &&
        net.mac &&
        net.mac !== '00:00:00:00:00:00'
      ) {
        macs.push(net.mac);
      }
    }
  }

  const raw = [
    os.hostname(),
    os.platform(),
    os.arch(),
    macs.sort().join('|')
  ].join('|');

  return crypto
    .createHash('sha256')
    .update(raw)
    .digest('hex')
    .toUpperCase()
    .match(/.{1,4}/g)
    .slice(0, 8)
    .join('-');
}

ipcMain.handle('get-machine-id', () => getMachineId());

function getAppIcon() {

  if (process.platform === 'win32') {
    return path.join(__dirname, 'build', 'icon.ico');
  }

  if (process.platform === 'darwin') {
    return path.join(__dirname, 'build', 'icon.icns');
  }

  return path.join(__dirname, 'src', 'assets', 'icon.png');
}

function createWindow() {

  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 1000,
    minHeight: 700,
    title: 'Dispatcher Summary Report',
    icon: getAppIcon(),
    autoHideMenuBar: true,

    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      devTools: false,
      sandbox: false,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  Menu.setApplicationMenu(null);

  win.loadFile(
    path.join(__dirname, 'src', 'index.html')
  );

  win.webContents.on('before-input-event', (event, input) => {

    const key = (input.key || '').toLowerCase();

    const ctrlOrCmd =
      input.control ||
      input.meta;

    const blocked =
      key === 'f12' ||

      (
        ctrlOrCmd &&
        ['u', 's', 'p', 'a', 'x'].includes(key)
      ) ||

      (
        ctrlOrCmd &&
        input.shift &&
        ['i', 'j', 'c'].includes(key)
      );

    if (blocked) {
      event.preventDefault();
    }

  });

  win.webContents.on('devtools-opened', () => {
    win.webContents.closeDevTools();
  });

}

app.whenReady().then(() => {

  globalShortcut.register(
    'CommandOrControl+Shift+I',
    () => {}
  );

  globalShortcut.register(
    'F12',
    () => {}
  );

  createWindow();

});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {

  if (process.platform !== 'darwin') {
    app.quit();
  }

});

app.on('activate', () => {

  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }

});