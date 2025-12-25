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

if (process.platform === 'win32') {
    autoUpdater.allowPrerelease = false;
    autoUpdater.allowDowngrade = false;
}

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
            nodeIntegration: false,
            devTools: false,
            webSecurity: true
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
    
    mainWindow.webContents.on('devtools-opened', () => {
        mainWindow.webContents.closeDevTools();
    });
    
    const indexPath = path.join(__dirname, 'index.html');
    log('createWindow', `Loading file: ${indexPath}`);
    
    mainWindow.loadFile(indexPath).then(() => {
        log('createWindow', 'File loaded successfully');
    }).catch(err => {
        log('createWindow', `Error loading file: ${err.message}`);
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
    const defaultSettings = { 
        showHidden: false, 
        scanDepth: 3, 
        language: 'uk',
        defaultEditor: 'code',
        editorPaths: {}
    };
    const settings = store.get('settings', defaultSettings);
    const merged = { ...defaultSettings, ...settings };
    log('get-settings', 'Retrieved settings');
    return merged;
});
ipcMain.handle('save-settings', (e, s) => {
    store.set('settings', s);
    const root = store.get('rootPath');
    if (root) {
        const cacheKey = `scanCache.${Buffer.from(root).toString('base64')}`;
        store.delete(cacheKey);
    }
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

async function recursiveScan(dir, depth, maxDepth, showHidden, rootPath) {
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

            const savedTags = store.get(`tags.${pathHash}`, []);
            const savedNote = store.get(`note.${pathHash}`, '');
            const savedOrder = store.get(`projectOrder.${Buffer.from(rootPath).toString('base64')}`, []);
            
            return [{
                name: path.basename(dir),
                path: dir,
                lastModified: stats.mtime,
                lastOpened: lastUsage,
                git: gitInfo,
                scripts: [...savedScripts, ...autoScripts],
                parent: path.basename(path.dirname(dir)),
                tags: savedTags,
                note: savedNote,
                order: savedOrder.indexOf(dir) >= 0 ? savedOrder.indexOf(dir) : 9999
            }];
        }
        
        const subFolders = dirents.filter(d => d.isDirectory() && (showHidden || !d.name.startsWith('.')) && d.name !== 'node_modules');
        let results = [];
        for (const folder of subFolders) {
            results = results.concat(await recursiveScan(path.join(dir, folder.name), depth + 1, maxDepth, showHidden, rootPath));
        }
        return results;
    } catch (e) { return []; }
}

ipcMain.handle('scan-smart', async (event, forceRefresh = false) => {
    const root = store.get('rootPath');
    const settings = store.get('settings', { showHidden: false, scanDepth: 3 });
    if (!root) {
        log('scan-smart', 'No root path set, returning empty array');
        return [];
    }
    
    const cacheKey = `scanCache.${Buffer.from(root).toString('base64')}`;
    const cacheKeyTime = `scanCacheTime.${Buffer.from(root).toString('base64')}`;
    const cacheMaxAge = 60000;
    
    if (!forceRefresh) {
        const cachedData = store.get(cacheKey, null);
        const cacheTime = store.get(cacheKeyTime, 0);
        const now = Date.now();
        
        if (cachedData && (now - cacheTime < cacheMaxAge)) {
            log('scan-smart', `Returning cached results (${cachedData.length} projects, age: ${Math.round((now - cacheTime) / 1000)}s)`);
            return cachedData;
        }
    }
    
    log('scan-smart', `Starting scan from: ${root} (depth: ${settings.scanDepth})`);
    const results = await recursiveScan(root, 0, settings.scanDepth, settings.showHidden, root);
    const savedOrder = store.get(`projectOrder.${Buffer.from(root).toString('base64')}`, []);
    results.sort((a, b) => {
        const orderA = savedOrder.indexOf(a.path) >= 0 ? savedOrder.indexOf(a.path) : 9999;
        const orderB = savedOrder.indexOf(b.path) >= 0 ? savedOrder.indexOf(b.path) : 9999;
        if (orderA !== orderB) return orderA - orderB;
        const timeA = Math.max(a.lastOpened || 0, new Date(a.lastModified).getTime());
        const timeB = Math.max(b.lastOpened || 0, new Date(b.lastModified).getTime());
        return timeB - timeA;
    });
    
    store.set(cacheKey, results);
    store.set(cacheKeyTime, Date.now());
    
    log('scan-smart', `Scan completed, found ${results.length} projects (cached)`);
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

// Tags API
ipcMain.handle('get-tags', (event, projectPath) => {
    const key = `tags.${Buffer.from(projectPath).toString('base64')}`;
    return store.get(key, []);
});

ipcMain.handle('save-tags', (event, { projectPath, tags }) => {
    const key = `tags.${Buffer.from(projectPath).toString('base64')}`;
    store.set(key, tags);
    return tags;
});

// Notes API
ipcMain.handle('get-note', (event, projectPath) => {
    const key = `note.${Buffer.from(projectPath).toString('base64')}`;
    return store.get(key, '');
});

ipcMain.handle('save-note', (event, { projectPath, note }) => {
    const key = `note.${Buffer.from(projectPath).toString('base64')}`;
    store.set(key, note);
    return note;
});

// Project order API
ipcMain.handle('save-project-order', (event, { rootPath, order }) => {
    const key = `projectOrder.${Buffer.from(rootPath).toString('base64')}`;
    store.set(key, order);
    return true;
});

// Git log API
ipcMain.handle('get-git-log', async (event, projectPath, count = 10) => {
    try {
        if (!fsSync.existsSync(path.join(projectPath, '.git'))) {
            return [];
        }
        const git = simpleGit(projectPath);
        const log = await git.log({ maxCount: count });
        return log.all.map(commit => ({
            hash: commit.hash.substring(0, 7),
            message: commit.message,
            author: commit.author_name,
            date: commit.date
        }));
    } catch (e) {
        log('get-git-log', `Error: ${e.message}`);
        return [];
    }
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

ipcMain.handle('open-editor', (e, { projectPath, editor }) => {
    log('open-editor', `Opening ${editor} for: ${projectPath}`);
    const settings = store.get('settings', {});
    let editorPath = editor;
    
    if (settings.editorPaths && settings.editorPaths[editor]) {
        editorPath = settings.editorPaths[editor];
    } else {
        const defaultPaths = {
            'code': 'code',
            'webstorm': 'webstorm',
            'sublime': 'subl',
            'atom': 'atom',
            'notepad++': 'notepad++'
        };
        editorPath = defaultPaths[editor] || editor;
    }
    
    spawn(editorPath, [projectPath], { shell: true });
    const key = `usage.${Buffer.from(projectPath).toString('base64')}`;
    store.set(key, Date.now());
});

ipcMain.handle('get-editor-paths', () => {
    const settings = store.get('settings', {});
    return settings.editorPaths || {};
});

ipcMain.handle('set-editor-path', (e, { editor, path }) => {
    const settings = store.get('settings', {});
    if (!settings.editorPaths) settings.editorPaths = {};
    settings.editorPaths[editor] = path;
    store.set('settings', settings);
    return true;
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
    
    let userFriendlyError = err.message;
    if (err.message && err.message.includes('not signed') || err.message.includes('digitally signed')) {
        userFriendlyError = 'Update file is not signed. You can download it manually from the website.';
    } else if (err.message && err.message.includes('StatusMessage')) {
        userFriendlyError = 'Unable to verify update signature. Please download manually from the website.';
    }
    
    if (mainWindow) mainWindow.webContents.send('update-status', { 
        status: 'error', 
        error: userFriendlyError,
        canDownloadManually: true
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
    
    mainWindow.webContents.once('did-finish-load', () => {
        log('app', 'Window loaded, checking for updates...');
        const autoUpdateEnabled = store.get('autoUpdate', true);
        if (autoUpdateEnabled) {
            setTimeout(() => {
                log('app', 'Checking for updates on startup...');
                autoUpdater.checkForUpdates().catch(err => {
                    log('app', `Update check failed on startup: ${err.message}`);
                });
            }, 3000);
        } else {
            log('app', 'Auto-update disabled');
        }
    });
}).catch(err => {
    log('app', `Error during app initialization: ${err.message}`);
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