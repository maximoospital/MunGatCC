const { app, BrowserWindow, Menu, shell } = require('electron');
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
      icon: __dirname + '/src/ms-icon-310x310.png',
      fullscreenable: true,
      resizable: true,
      fullscreenWindowTitle: true,
      webPreferences: {
        webSecurity: true,
        plugins: true,
        devTools: true,
      },
    });
    mainWindow.hide();
    // Show the main window when it's ready
    mainWindow.webContents.on('did-finish-load', () => {
      // When the site is loaded, show the window
      // Destroy the splash window
      setTimeout(() => {
        splash.destroy();
        mainWindow.show();  
      }, 1000);
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
          display: none;
        }
        .juego {
          height: 100% !important;
        }
        .juego embed {
          height: 100% !important;
        }
      `);
    });

    // Function that only runs when loading the address "mmo.mundogaturro.com"
    mainWindow.webContents.on('did-navigate', (event, url) => {
      const dirnameSerialized = JSON.stringify(__dirname.replace(/\\/g, '/'));
      mainWindow.webContents.session.webRequest.onBeforeRequest((details, callback) => {
        if (details.url.includes('cdn-ar.mundogaturro.com/juego/MMOLoader.swf')) {
          const dirnameSerialized = JSON.stringify(__dirname.replace(/\\/g, '/'));
          console.log(dirnameSerialized);
          console.log(details.url.replace('https://cdn-ar.mundogaturro.com/juego/', 'file://' + __dirname.replace(/\\/g, '/') + '/src/').split('?')[0]);
          callback({redirectURL: details.url.replace('https://cdn-ar.mundogaturro.com/juego/', 'file:' + __dirname.replace(/\\/g, '/') + '/src/').split('?')[0]})
          console.log('Redirecting to local file');
          console.log(details.url);
        } else {
          callback({});
        }
      });  
      if (url.includes('mmo.mundogaturro.com')) {
        mainWindow.webContents.executeJavaScript(`
          var embed = document.querySelector('embed');
          var version = embed.getAttribute('flashvars').split('&version=')[1].split('&')[0];
          embed.setAttribute('flashvars', embed.getAttribute('flashvars') + '&version='+version);
        `);
      }
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
    app.commandLine.appendSwitch('disable-features', 'CrossSiteDocumentBlockingIfIsolating,CrossSiteDocumentBlockingAlways,IsolateOrigins,site-per-process');
    app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors');
  
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
