const { app, BrowserWindow, ipcMain } = require("electron");
const url = require("url");
const path = require("path");
const https = require('https');
const fs = require('fs');

require('electron-reload')(path.join(__dirname, 'dist'), {
    electron: `${__dirname}/node_modules/.bin/electron.cmd`
});

let mainWindow;

ipcMain.handle('save', (ev, obj) => {
    fs.writeFile('getman.json', Buffer.from(JSON.stringify(obj), 'utf-8'), () => 0);
});
ipcMain.handle('load', async (ev) => {
    return await new Promise((res, rej) => {
        fs.readFile('getman.json', (err, data) => {
            res(JSON.parse(data.toString('utf-8')));
        });
    });
});
ipcMain.handle('send', async (ev, endpoint) => {

    return await new Promise((res, rej) => {

        const headers = {};
        endpoint.headers.filter(e => e.enable && e.key).forEach(e => {
            headers[e.key] = e.value;
        });

        const url = endpoint.url + '?' + endpoint.params.filter(e => e.enable && e.key).map(e => {
            return encodeURIComponent(e.key) + '=' + encodeURIComponent(e.value);
        });
        const req = https.request(url, {
            method: endpoint.method,
            headers: headers,
        }, (response) => {
            let data = '';
            response.on('data', chunk => data += chunk);
            response.on('close', () => {
                response.body = data;
                res(response);
            });
            response.on('error', err => rej(err));
        });
        if (endpoint.method.toUpperCase() !== 'GET')
            req.write(endpoint.body);
        req.end();
    });
});

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true
        },
    });
    // mainWindow.setMenu(null);
    // mainWindow.webContents.openDevTools();

    mainWindow.loadURL(
        url.format({
            pathname: path.join(__dirname, `/dist/index.html`),
            protocol: "file:",
            slashes: true
        })
    );
    mainWindow.on("closed", function () {
        mainWindow = null;
    });
}

app.on("ready", createWindow);
app.on("window-all-closed", function () {
    if (process.platform !== "darwin") app.quit();
});

app.on("activate", function () {
    if (mainWindow === null) createWindow();
});

