const { app, BrowserWindow, Menu, shell, ipcMain } = require('electron');
const { autoUpdater } = require('electron-updater');
const windowStateKeeper = require('electron-window-state');
const electronLocalshortcut = require('electron-localshortcut');
const path = require('path');

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  const createMenu = () => {
    const menu = Menu.getApplicationMenu();
    const viewMenu = menu.items.find(item => item.role === 'viewmenu');
    if (viewMenu) {
      const filteredItems = viewMenu.submenu.items;
      Menu.setApplicationMenu(Menu.buildFromTemplate(filteredItems));
    }
  };

  const createWindow = () => {
    const mainWindowState = windowStateKeeper({
      defaultWidth: 1280,
      defaultHeight: 768,
    });

    const mainWindow = new BrowserWindow({
      ...mainWindowState,
      show: false,
      autoHideMenuBar: true,
      frame: true,
      title: 'Mundo Gaturro CC',
      backgroundColor: '#000000',
      icon: __dirname + '/src/ms-icon-310x310.png',
      fullscreenable: true,
      resizable: true,
      fullscreenWindowTitle: true,
      webPreferences: {
        webSecurity: true,
        nodeIntegration: false,
        contextIsolation: true,
        plugins: true,
        devTools: true,
        preload: path.join(__dirname, '/src/codigos.js'),
      },
    });

    ipcMain.on('open-codigos-window', () => {
      const codigosWindow = new BrowserWindow({
        // Window configuration
        width: 980,
        height: 660,
        show: true,
        title: 'Codigos MG',
        backgroundColor: '#000000',
        icon: __dirname + '/src/ms-icon-310x310.png',
        autoHideMenuBar: true,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
          // Additional preferences as needed
        }
      });
      // Load the URL into the window
      codigosWindow.on('page-title-updated', function(e) {
        e.preventDefault();
        codigosWindow.title = 'Codigos MG';
      });
      codigosWindow.loadURL('https://mgcodesls.vercel.app/', {userAgent: "mundo-gaturro-desktop-2"});
      codigosWindow.removeMenu();      
      codigosWindow.webContents.on('new-window', (event, url) => {
        event.preventDefault();
        shell.openExternal(url);
      });
    });

    mainWindow.hide();
    // Show the main window when it's ready
    mainWindow.webContents.on('did-finish-load', () => {
      // When the site is loaded, show the window
      // Destroy the splash window
      mainWindow.webContents.executeJavaScript(`
        if (window.location.href === 'https://desktop.mundogaturro.com/') {
          document.querySelector('.nav.navbar-nav.navbar-right').innerHTML = '<li><a href="#" id="botoncodigos" class="btn btn-head" style="font-size: 14px !important; padding-top: 8px !important;">Codigos</a></li>';
        }
      `);
      // If the link with id "botoncodigos" is clicked, print a message
      mainWindow.webContents.executeJavaScript(`
        document.getElementById('botoncodigos').addEventListener('click', (e) => {
          e.preventDefault();
          window.electron.send('open-codigos-window');
        });
      `);

      mainWindow.webContents.insertCSS(`
        ::-webkit-scrollbar {
          width: 15px;
          background-color: #C57128;
          background-image: -webkit-linear-gradient(45deg, rgba(205, 119, 41, .2) 25%,
											  transparent 25%,
											  transparent 50%,
											  rgba(205, 119, 41, .2) 50%,
											  rgba(205, 119, 41, .2) 75%,
											  transparent 75%,
											  transparent)
        }
        ::-webkit-scrollbar-thumb {
          	background-color: #F9CF08 ;	
	          background-image: -webkit-linear-gradient(45deg,
	                                          rgba(248, 226, 10, .2) 25%,
											  transparent 25%,
											  transparent 50%,
											  rgba(248, 226, 10, .2) 50%,
											  rgba(248, 226, 10, .2) 75%,
											  transparent 75%,
											  transparent)

        }
        .pageBody {
              background-position: center center;
              background-size: cover;
              background-attachment: fixed;
        }
        .header {
          background-image: none !important;
          position: absolute;
        }
        .header .menu2 {
          display: none !important;
        }
        ul li a {
          font-size: 0px !important;
          padding-bottom: 5px !important;
        }
        .juego {
          height: 100% !important;
        }
        .juego embed {
          height: 100% !important;
        }
        .help-block {
          display: none !important;
        }
        .disclaimer {
          display: none !important;
        }
        .socialincons {
          display: none !important;
        }
        .legaltext {
          display: none !important;
        }
        .navbar-right a:hover {
          background-color: #c8da00 !important;
        }
        .navbar-right a:focus {
          background-color: #c8da00 !important;
        }
        .navbar-right a:active {
          background-color: #c8da00 !important;
        }
      `);
      setTimeout(() => {
        splash.destroy();
        mainWindow.show();  
      }, 1000);
    });

    // Open external links in the user's default browser
    mainWindow.webContents.on('new-window', (event, url) => {
      event.preventDefault();
      shell.openExternal(url);
    });

    // Display context menu
    mainWindow.webContents.on('context-menu', (event, params) => {
      Menu.getApplicationMenu().popup(mainWindow, params.x, params.y);
    });

    // Load the URL into the main window
    mainWindow.loadURL('https://desktop.mundogaturro.com/', {userAgent: "mundo-gaturro-desktop-2"});

    // Query all cookies for the current URL and log them
    mainWindow.webContents.session.cookies.get({url: 'https://desktop.mundogaturro.com/'})
      .then((cookies) => {
        console.log(cookies);
      })
      .catch((error) => {
        console.error(error);
      });
    // Manage window state
    mainWindowState.manage(mainWindow);

    // Prevent the site from changing the window title and force a custom title and background color
    mainWindow.on('page-title-updated', function(e) {
      e.preventDefault();
      mainWindow.setTitle('Mundo Gaturro CC');
    });

    mainWindow.setBackgroundColor('black');
    mainWindow.removeMenu();

    // Register keyboard shortcuts
    electronLocalshortcut.register(mainWindow, ['F5'], () => {
      mainWindow.reload();
    });
    electronLocalshortcut.register(mainWindow, ['F12'], () => {
      mainWindow.webContents.openDevTools();
    });
    electronLocalshortcut.register(mainWindow, ['F11'], () => {
      mainWindow.setFullScreen(!mainWindow.isFullScreen());
    });

    // Splash screen
    const splash = new BrowserWindow({
      width: 500, 
      height: 300, 
      transparent: true, 
      title: 'Mundo Gaturro CC',
      icon: __dirname + '/src/ms-icon-310x310.png',
      frame: false, 
      alwaysOnTop: true
    });
    splash.loadFile(path.join(__dirname, '/src/splash.html'));
    splash.center();
  };

   const initializeFlashPlugin = () => {
    let pluginName;
    switch (process.platform) {
      case 'win32':
        pluginName = app.isPackaged ? 'pepflashplayer.dll' : 'win/x64/pepflashplayer.dll';
        break;
      case 'darwin':
        pluginName = 'PepperFlashPlayer.plugin';
        break;
      default:
        pluginName = 'libpepflashplayer.so';
    } 
    const resourcesPath = app.isPackaged ? process.resourcesPath : __dirname;

    if (['freebsd', 'linux', 'netbsd', 'openbsd'].includes(process.platform)) {
      app.commandLine.appendSwitch('no-sandbox');
    }

    app.commandLine.appendSwitch('ppapi-flash-path', path.join(resourcesPath, 'plugins', pluginName));
    app.commandLine.appendSwitch('ppapi-flash-version', '32.0.0.465');

    // Disable security features
    app.commandLine.appendSwitch('ignore-certificate-errors')

    // Enable flash's cross-domain policy file
    app.commandLine.appendSwitch('allow-outdated-plugins');
    app.commandLine.appendSwitch('disable-site-isolation-trials');
    app.commandLine.appendSwitch('disable-web-security');
    app.commandLine.appendSwitch('disable-features', 'CrossSiteDocumentBlockingIfIsolating,CrossSiteDocumentBlockingAlways,IsolateOrigins,site-per-process,site-isolation-trial-enforcement,OutOfBlinkCors');
  };

  // Force Flash Plugin to use GPU in order to accelerate rendering
  app.commandLine.appendSwitch('disable-gpu', 'false');
  app.commandLine.appendSwitch('enable-gpu-rasterization', 'true');
  app.commandLine.appendSwitch('ignore-gpu-blacklist', 'true');

  app.on('second-instance', () => {
    const mainWindow = BrowserWindow.getAllWindows()[0];
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  initializeFlashPlugin();

  app.whenReady().then(() => {
    createMenu();
    createWindow();
    autoUpdater.checkForUpdates();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  });
}
