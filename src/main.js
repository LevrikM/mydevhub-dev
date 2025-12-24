const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');
const simpleGit = require('simple-git');
const { spawn } = require('child_process');
const Store = require('electron-store');
const { autoUpdater } = require('electron-updater');
const https = require('https');

const store = new Store();
let mainWindow;

function log(functionName, message) {
    console.log(`[${functionName}] ${message}`);
}

if (process.platform === 'win32') {
    autoUpdater.setFeedURL({
        provider: 'github',
        owner: 'LevrikM',
        repo: 'mydevhub-dev'
    });
}

autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;
autoUpdater.checkForUpdatesAndNotify = false;

function createWindow() {
    log('createWindow', 'Creating main window...');
    mainWindow = new BrowserWindow({
        width: 1400, height: 900,
        backgroundColor: '#050505',
        frame: false,
        title: 'myDevHub',
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false
        },
        show: false
    });
    
    mainWindow.once('ready-to-show', () => {
        log('createWindow', 'Window ready to show');
        mainWindow.show();
    });
    
    mainWindow.on('closed', () => {
        log('createWindow', 'Window closed');
        mainWindow = null;
    });
    
    const indexPath = path.join(__dirname, 'index.html');
    log('createWindow', `Loading file: ${indexPath}`);
    
    mainWindow.loadFile(indexPath).then(() => {
        log('createWindow', 'File loaded successfully');
    }).catch(err => {
        log('createWindow', `Error loading file: ${err.message}`);
        console.error('[createWindow] Full error:', err);
        console.error('[createWindow] __dirname:', __dirname);
        console.error('[createWindow] indexPath:', indexPath);
    });
    
    log('createWindow', 'Main window created successfully');
}

ipcMain.on('win-minimize', () => {
    log('win-minimize', 'Minimizing window');
    mainWindow.minimize();
});
ipcMain.on('win-maximize', () => {
    log('win-maximize', mainWindow.isMaximized() ? 'Restoring window' : 'Maximizing window');
    mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize();
});
ipcMain.on('win-close', () => {
    log('win-close', 'Closing window');
    mainWindow.close();
});

ipcMain.handle('get-root-path', () => {
    const path = store.get('rootPath', null);
    log('get-root-path', path ? `Root path: ${path}` : 'No root path set');
    return path;
});
ipcMain.handle('set-root-path', async () => {
    log('set-root-path', 'Opening directory dialog');
    const res = await dialog.showOpenDialog(mainWindow, { properties: ['openDirectory'] });
    if (!res.canceled) {
        store.set('rootPath', res.filePaths[0]);
        log('set-root-path', `Root path set to: ${res.filePaths[0]}`);
        return res.filePaths[0];
    }
    log('set-root-path', 'Directory selection canceled');
    return null;
});

ipcMain.handle('get-settings', () => {
    const settings = store.get('settings', { showHidden: false, scanDepth: 3, language: 'uk' });
    log('get-settings', 'Retrieved settings');
    return settings;
});
ipcMain.handle('save-settings', (e, s) => {
    store.set('settings', s);
    log('save-settings', 'Settings saved');
});
ipcMain.handle('reset-settings', () => {
    log('reset-settings', 'Resetting all settings');
    store.clear();
    return true;
});

ipcMain.handle('get-favorites', () => store.get('favorites', []));
ipcMain.handle('toggle-favorite', (event, projectPath) => {
    const favs = store.get('favorites', []);
    let newFavs = favs.includes(projectPath) 
        ? favs.filter(p => p !== projectPath) 
        : [...favs, projectPath];
    store.set('favorites', newFavs);
    return newFavs;
});

ipcMain.handle('log-usage', (event, projectPath) => {
    const key = `usage.${Buffer.from(projectPath).toString('base64')}`;
    store.set(key, Date.now());
});

const PROJECT_MARKERS = ['.git', 'package.json', 'requirements.txt', 'Cargo.toml', 'composer.json', 'go.mod'];

async function recursiveScan(dir, depth, maxDepth, showHidden) {
    if (depth > maxDepth) return [];
    try {
        const dirents = await fs.readdir(dir, { withFileTypes: true });
        
        if (dirents.some(d => PROJECT_MARKERS.includes(d.name))) {
            const stats = await fs.stat(dir);
            const pathHash = Buffer.from(dir).toString('base64');
            const savedScripts = store.get(`scripts.${pathHash}`, []);
            const lastUsage = store.get(`usage.${pathHash}`, 0);

            let autoScripts = [];
            try {
                const pkgPath = path.join(dir, 'package.json');
                if (fsSync.existsSync(pkgPath)) {
                    const pkgData = fsSync.readFileSync(pkgPath, 'utf8');
                    const pkg = JSON.parse(pkgData);
                    if (pkg.scripts) {
                        autoScripts = Object.entries(pkg.scripts).map(([key, cmd]) => ({
                            id: `auto-${key}`,
                            name: key,
                            command: `npm run ${key}`,
                            isAuto: true
                        }));
                    }
                }
            } catch (e) {}

            let gitInfo = null;
            try {
                if (fsSync.existsSync(path.join(dir, '.git'))) {
                    const git = simpleGit(dir);
                    const status = await git.status();
                    const log = await git.log({ maxCount: 1 });
                    
                    gitInfo = { 
                        isClean: status.isClean(),
                        message: log.latest ? log.latest.message : 'No commits',
                        author: log.latest ? log.latest.author_name : '',
                        hash: log.latest ? log.latest.hash.substring(0, 7) : ''
                    };
                }
            } catch (e) { }

            return [{
                name: path.basename(dir),
                path: dir,
                lastModified: stats.mtime,
                lastOpened: lastUsage,
                git: gitInfo,
                scripts: [...savedScripts, ...autoScripts],
                parent: path.basename(path.dirname(dir))
            }];
        }
        
        const subFolders = dirents.filter(d => d.isDirectory() && (showHidden || !d.name.startsWith('.')) && d.name !== 'node_modules');
        let results = [];
        for (const folder of subFolders) {
            results = results.concat(await recursiveScan(path.join(dir, folder.name), depth + 1, maxDepth, showHidden));
        }
        return results;
    } catch (e) { return []; }
}

ipcMain.handle('scan-smart', async () => {
    const root = store.get('rootPath');
    const settings = store.get('settings', { showHidden: false, scanDepth: 3 });
    if (!root) {
        log('scan-smart', 'No root path set, returning empty array');
        return [];
    }
    log('scan-smart', `Starting scan from: ${root} (depth: ${settings.scanDepth})`);
    const results = await recursiveScan(root, 0, settings.scanDepth, settings.showHidden);
    log('scan-smart', `Scan completed, found ${results.length} projects`);
    return results;
});

ipcMain.handle('read-tree', async (event, dirPath) => {
    try {
        log('read-tree', `Reading directory tree: ${dirPath}`);
        const settings = store.get('settings', { showHidden: false });
        const dirents = await fs.readdir(dirPath, { withFileTypes: true });
        const items = dirents
            .filter(d => settings.showHidden || (!d.name.startsWith('.') && d.name !== 'desktop.ini'))
            .map(d => ({ name: d.name, path: path.join(dirPath, d.name), isDirectory: d.isDirectory() }))
            .sort((a, b) => b.isDirectory - a.isDirectory);
        log('read-tree', `Found ${items.length} items in directory`);
        return items;
    } catch (e) {
        log('read-tree', `Error reading directory: ${e.message}`);
        return [];
    }
});

ipcMain.handle('save-script', (event, { projectPath, name, command }) => {
    log('save-script', `Saving script "${name}" for project: ${projectPath}`);
    const key = `scripts.${Buffer.from(projectPath).toString('base64')}`;
    const scripts = store.get(key, []);
    scripts.push({ id: Date.now().toString(), name, command });
    store.set(key, scripts);
    return scripts;
});

ipcMain.handle('delete-script', (event, { projectPath, scriptId }) => {
    const key = `scripts.${Buffer.from(projectPath).toString('base64')}`;
    let scripts = store.get(key, []);
    scripts = scripts.filter(s => s.id !== scriptId);
    store.set(key, scripts);
    return scripts;
});

ipcMain.handle('get-scripts', (event, projectPath) => {
    const key = `scripts.${Buffer.from(projectPath).toString('base64')}`;
    return store.get(key, []);
});

ipcMain.on('run-command', (event, { command, cwd }) => {
    log('run-command', `Executing command: ${command} in ${cwd}`);
    const child = spawn(command, [], { shell: true, cwd });
    
    child.stdout.on('data', (data) => event.reply('term-data', data.toString()));
    child.stderr.on('data', (data) => event.reply('term-data', `ERR: ${data.toString()}`));
    child.on('close', (code) => {
        log('run-command', `Command exited with code: ${code}`);
        event.reply('term-data', `\n[Exited with code ${code}]`);
    });
});

ipcMain.handle('open-vscode', (e, p) => {
    log('open-vscode', `Opening VS Code for: ${p}`);
    spawn('code', [p], { shell: true });
    const key = `usage.${Buffer.from(p).toString('base64')}`;
    store.set(key, Date.now());
});

ipcMain.handle('open-external', (e, url) => {
    log('open-external', `Opening external URL: ${url}`);
    shell.openExternal(url);
});

ipcMain.handle('get-app-version', () => {
    return app.getVersion();
});

ipcMain.handle('check-for-updates', async () => {
    log('check-for-updates', 'Checking for updates...');
    try {
        await autoUpdater.checkForUpdates();
        log('check-for-updates', 'Update check completed');
        return { success: true };
    } catch (error) {
        log('check-for-updates', `Update check failed: ${error.message}`);
        return { success: false, error: error.message };
    }
});

ipcMain.handle('download-update', async () => {
    log('download-update', 'Starting update download...');
    try {
        await autoUpdater.downloadUpdate();
        log('download-update', 'Update download completed');
        return { success: true };
    } catch (error) {
        log('download-update', `Update download failed: ${error.message}`);
        return { success: false, error: error.message };
    }
});

ipcMain.handle('install-update', () => {
    log('install-update', 'Installing update and restarting...');
    autoUpdater.quitAndInstall(false, true);
});

ipcMain.handle('get-auto-update-setting', () => {
    return store.get('autoUpdate', true);
});

ipcMain.handle('set-auto-update-setting', (e, enabled) => {
    store.set('autoUpdate', enabled);
    autoUpdater.autoDownload = enabled;
    return true;
});

ipcMain.handle('get-latest-version', async () => {
    return new Promise((resolve, reject) => {
        https.get('https://api.github.com/repos/LevrikM/mydevhub-dev/releases/latest', {
            headers: { 'User-Agent': 'MyDevHub' }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const release = JSON.parse(data);
                    resolve({ version: release.tag_name.replace('v', ''), url: release.html_url });
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
});

autoUpdater.on('checking-for-update', () => {
    log('autoUpdater', 'Checking for updates...');
    if (mainWindow) mainWindow.webContents.send('update-status', { status: 'checking' });
});

autoUpdater.on('update-available', (info) => {
    log('autoUpdater', `Update available: ${info.version}`);
    if (mainWindow) mainWindow.webContents.send('update-status', { 
        status: 'available', 
        version: info.version 
    });
});

autoUpdater.on('update-not-available', () => {
    log('autoUpdater', 'No updates available');
    if (mainWindow) mainWindow.webContents.send('update-status', { status: 'latest' });
});

autoUpdater.on('error', (err) => {
    log('autoUpdater', `Update error: ${err.message}`);
    if (mainWindow) mainWindow.webContents.send('update-status', { 
        status: 'error', 
        error: err.message 
    });
});

autoUpdater.on('download-progress', (progressObj) => {
    log('autoUpdater', `Download progress: ${Math.round(progressObj.percent)}%`);
    if (mainWindow) mainWindow.webContents.send('update-progress', progressObj);
});

autoUpdater.on('update-downloaded', (info) => {
    log('autoUpdater', `Update downloaded: ${info.version}`);
    if (mainWindow) mainWindow.webContents.send('update-status', { 
        status: 'ready', 
        version: info.version 
    });
});

app.whenReady().then(() => {
    log('app', 'Application ready');
    createWindow();
    const autoUpdateEnabled = store.get('autoUpdate', true);
    if (autoUpdateEnabled) {
        log('app', 'Auto-update enabled, will check in 5 seconds');
        setTimeout(() => {
            autoUpdater.checkForUpdates();
        }, 5000);
    } else {
        log('app', 'Auto-update disabled');
    }
}).catch(err => {
    log('app', `Error during app initialization: ${err.message}`);
    console.error('[app] Full error:', err);
});

app.on('window-all-closed', () => {
    log('app', 'All windows closed');
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    log('app', 'App activated');
    if (mainWindow === null) {
        createWindow();
    }
});