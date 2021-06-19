const { app, BrowserWindow, session, globalShortcut, ipcMain } = require('electron');
const dbus = require('dbus-next');
const debug = process.env.ADFRIFY_DEBUG || false;

/**
 * Handle D-Bus keys
 * @param window BrowserWindow
 * @param desktopEnv Enviroment
 * @param session Session
 * @returns {Promise<void>}
 */
async function registerBindings(window, desktopEnv, session) {
    const listener = (n, keyName) => {
        if (debug)
            console.log(keyName);
        switch (keyName) {
            case 'Next':
                sendEvent(window, 'shortcut', 'MediaNextTrack');
                return;
            case 'Previous':
                sendEvent(window, 'shortcut', 'MediaPreviousTrack');
                return;
            case "Play":
                sendEvent(window, 'shortcut', 'MediaPlayPause');
                return
            default:
                return;
        }
    };
    const legacy = await session.getProxyObject(`org.${desktopEnv}.SettingsDaemon`, `/org/${desktopEnv}/SettingsDaemon/MediaKeys`);
    const interfaceLegacy = legacy.getInterface(`org.${desktopEnv}.SettingsDaemon.MediaKeys`);
    interfaceLegacy.on('MediaPlayerKeyPressed', listener);
    app.on('browser-window-focus', () => {
        interfaceLegacy.GrabMediaPlayerKeys('GPMDP', 0); // eslint-disable-line
    });

    const future = await session.getProxyObject(`org.${desktopEnv}.SettingsDaemon.MediaKeys`, `/org/${desktopEnv}/SettingsDaemon/MediaKeys`);
    const interfaceFuture = future.getInterface(`org.${desktopEnv}.SettingsDaemon.MediaKeys`);
    interfaceFuture.on('MediaPlayerKeyPressed', listener);
    app.on('browser-window-focus', () => {
        interfaceFuture.GrabMediaPlayerKeys('GPMDP', 0); // eslint-disable-line
    });
}

//const DBus = require('dbus');
function createWindow () {
    const win = new BrowserWindow({
        width: 1290,
        height: 750,
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            webSecurity: false,
            webviewTag: true
        },
        icon: 'icon.png'
    })
    win.loadFile('index.html');
    return win;
}

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})

/**
 * Block Ads and change user agent
 */
function applyTrafficMonitor() {
    session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
        details.requestHeaders['User-Agent'] = 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:89.0) Gecko/20100101 Firefox/89.0';
        callback({ cancel: false, requestHeaders: details.requestHeaders });
    });
    session.defaultSession.webRequest.onBeforeRequest(
        function(request, callback) {
            if (debug)
                console.log("[SPAB] -> onBeforeRequest began");
            if (request && request.url) {
                if (debug)
                    console.log("[SPAB] -> "+request.url);
                if (request.url.includes("storage-resolve/files/")) {
                    if (debug)
                        console.log("[SPAB] -> Found AD Request!");
                    callback({cancel: true});
                    return;
                }
            }
            callback({cancel: false});
        }
    );
}

function sendEvent(window, name, ...args) {
    if (window != null) {
        window.webContents.send(name, [...args]);
        ipcMain.emit(name);
    }
}

function registerKeys(window) {
    globalShortcut.register('MediaPlayPause', () => {
        if (debug)
            console.log("PLAYPAUSE");
        sendEvent(window, 'shortcut', 'MediaPlayPause');
    });
    globalShortcut.register('medianexttrack', () => {
        if (debug)
            console.log("NEXT");
        sendEvent(window, 'shortcut', 'MediaNextTrack');
    });
    globalShortcut.register('mediaprevioustrack', () => {
        if (debug)
            console.log("PREV");
        sendEvent(window, 'shortcut', 'MediaPreviousTrack');
    });
}

app.commandLine.appendSwitch('disable-site-isolation-trials');
app.whenReady().then(() => {
    let win = createWindow();
    applyTrafficMonitor();
    try {
        const session = dbus.sessionBus();
        registerBindings(win, 'gnome', session).catch(() => {
            registerBindings(win, 'mate', session).catch(() => {
                // Fallback!
                registerKeys(win);
            });
        });
    } catch (e) {
        // Fallback!
        registerKeys(win);
    }
})


