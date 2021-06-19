const ipcRenderer = require('electron').ipcRenderer
const webview = document.getElementById('sp-webview');


function sendPlayPause() {
    webview.executeJavaScript('document.querySelector(\'.player-controls__buttons button[data-testid=\"control-button-play\"]\').click()').catch(() => {
        webview.executeJavaScript('document.querySelector(\'.player-controls__buttons button[data-testid=\"control-button-pause\"]\').click()')
    })
}

function sendNextTrack() {
    webview.executeJavaScript('document.querySelector(\'.player-controls__buttons button[data-testid=\"control-button-skip-forward\"]\').click()')
}

function sendPreviousTrack() {
    webview.executeJavaScript('document.querySelectorAll(\'.player-controls__buttons button\')[1].click()')
}

ipcRenderer.on('shortcut', (event, arg) => {
    let cmd = arg[0];
    switch (cmd) {
        case 'MediaPlayPause': {
            sendPlayPause();
            break;
        }
        case 'MediaNextTrack': {
            sendNextTrack();
            break;
        }
        case 'MediaPreviousTrack': {
            sendPreviousTrack();
            break;
        }
    }
});
