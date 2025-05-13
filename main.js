const { app, BrowserWindow } = require('electron');
const { spawn } = require('child_process');
const http = require('http');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    show: false, 
    webPreferences: {
      contextIsolation: true
    }
  });

  mainWindow.loadURL('http://localhost:3000');

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.webContents.openDevTools();
  });
}

function waitForServer(url, callback) {
  const tryConnect = () => {
    http.get(url, () => {
      console.log("✅ Express server is ready!");
      callback();
    }).on('error', () => {
      setTimeout(tryConnect, 1000);
    });
  };
  tryConnect();
}

app.whenReady().then(() => {
  const serverProcess = spawn('npm', ['run', 'start'], {
    shell: true,
    stdio: 'inherit' 
  });

  waitForServer('http://localhost:3000', () => {
    createWindow();
  });

  app.on('before-quit', () => {
    serverProcess.kill();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
