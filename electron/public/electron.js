const path = require('path');

const { app, BrowserWindow,globalShortcut,webContents } = require('electron');
const isDev = require('electron-is-dev');
const { dirname } = require('path');
const currentWebContents = webContents.getFocusedWebContents();
function getIconFilePath() {
  if (process.platform === 'darwin') {
    return path.join(__dirname, 'electron-app-icon-mac.icns');
  } else if (process.platform === 'win32') {
    return path.join(__dirname, 'electron-app-icon.ico');
  } else {
    return path.join(__dirname, 'electron-app-icon.png');
  }
}



function createWindow() {
  // novo okno brskalnika
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    icon: getIconFilePath(),

    webPreferences: {
      nodeIntegration: true,
    },
  });

  // load index.html
  win.loadURL(
    isDev
      ? 'http://localhost:3000'
      : `file://${path.join(__dirname, '../build/index.html')}`
  );
  // DevTools.
  if (isDev) {
    win.webContents.openDevTools({ mode: 'detach' });
  }
  return win;
}

app.whenReady().then(()=>{
  const win=createWindow();

globalShortcut.register('CommandOrControl+O', () => {
  win.webContents.executeJavaScript('document.querySelector("#popup-box").style.display="block"')
});
globalShortcut.register('CommandOrControl+X', () => {
  win.webContents.executeJavaScript('document.querySelector("#popup-box").style.display="none"')
});
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


