const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    minimize: () => ipcRenderer.send('win-minimize'),
    maximize: () => ipcRenderer.send('win-maximize'),
    close: () => ipcRenderer.send('win-close'),

    getRootPath: () => ipcRenderer.invoke('get-root-path'),
    setRootPath: () => ipcRenderer.invoke('set-root-path'),
    getSettings: () => ipcRenderer.invoke('get-settings'),
    saveSettings: (s) => ipcRenderer.invoke('save-settings', s),
    resetSettings: () => ipcRenderer.invoke('reset-settings'),

    getFavorites: () => ipcRenderer.invoke('get-favorites'),
    toggleFavorite: (path) => ipcRenderer.invoke('toggle-favorite', path),

    scanSmart: () => ipcRenderer.invoke('scan-smart'),
    readTree: (path) => ipcRenderer.invoke('read-tree', path),
    openVsCode: (path) => ipcRenderer.invoke('open-vscode', path),
    logUsage: (path) => ipcRenderer.invoke('log-usage', path),
    
    openExternal: (url) => ipcRenderer.invoke('open-external', url),

    saveScript: (data) => ipcRenderer.invoke('save-script', data),
    deleteScript: (data) => ipcRenderer.invoke('delete-script', data),
    getScripts: (path) => ipcRenderer.invoke('get-scripts', path),
    
    runCommand: (data) => ipcRenderer.send('run-command', data),
    onTermData: (cb) => ipcRenderer.on('term-data', (e, d) => cb(d)),
    
    getAppVersion: () => ipcRenderer.invoke('get-app-version'),
    checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
    downloadUpdate: () => ipcRenderer.invoke('download-update'),
    installUpdate: () => ipcRenderer.invoke('install-update'),
    getAutoUpdateSetting: () => ipcRenderer.invoke('get-auto-update-setting'),
    setAutoUpdateSetting: (enabled) => ipcRenderer.invoke('set-auto-update-setting', enabled),
    getLatestVersion: () => ipcRenderer.invoke('get-latest-version'),
    onUpdateStatus: (cb) => ipcRenderer.on('update-status', (e, d) => cb(d)),
    onUpdateProgress: (cb) => ipcRenderer.on('update-progress', (e, d) => cb(d))
});