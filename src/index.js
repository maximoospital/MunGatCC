const { app, BrowserWindow } = require('electron');
const path = require('node:path');
const electronLocalshortcut = require('electron-localshortcut');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}
const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
      width: 1280,
      height: 768,
      icon: __dirname + '/ms-icon-310x310.png',
      frame: true,
      show: false,
      title: 'Mundo Gaturro CC',
      fullscreenable: true,
      resizable: true,
      fullscreenWindowTitle: true,
      webPreferences: {
        nodeIntegration: true,      
          plugins: true,     
          webSecurity: true,
        devTools: true,
        preload: path.join(__dirname, 'preload.js'),
      },
    });
    mainWindow.setBackgroundColor('black');
    mainWindow.webContents.setUserAgent("mundo-gaturro-desktop-2");
    mainWindow.removeMenu();
    mainWindow.loadURL('https://desktop.mundogaturro.com/', {userAgent: "mundo-gaturro-desktop-2"});
    // mainWindow.loadFile(path.join(__dirname, 'index.html'));
    electronLocalshortcut.register(mainWindow, ['F5'], () => {
      mainWindow.reload();
    });
    electronLocalshortcut.register(mainWindow, ['F12'], () => {
      mainWindow.webContents.openDevTools();
    });
    // Enable F12 shortcut for developer tools
    // mainWindow.webContents.openDevTools();
    const splash = new BrowserWindow({
      width: 500, 
      height: 300, 
      transparent: true, 
      frame: false, 
      alwaysOnTop: true 
    });
    splash.loadFile(path.join(__dirname, 'splash.html'));
    splash.center();

    mainWindow.webContents.on('did-finish-load', () => {
      // When the site is loaded, show the window
      // Destroy the splash window
      setTimeout(() => {
        splash.destroy();
        mainWindow.setTitle('Mundo Gaturro CC');
        mainWindow.show();  
      }, 1000);
    });
  };

  


app.commandLine.appendSwitch('ignore-certificate-errors')
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();
  // Detect if mainWindow has finished loading
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
