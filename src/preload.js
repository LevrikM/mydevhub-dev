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

    scanSmart: (forceRefresh) => ipcRenderer.invoke('scan-smart', forceRefresh),
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
    onUpdateProgress: (cb) => ipcRenderer.on('update-progress', (e, d) => cb(d)),
    
    // Tags API
    getTags: (projectPath) => ipcRenderer.invoke('get-tags', projectPath),
    saveTags: (data) => ipcRenderer.invoke('save-tags', data),
    
    // Notes API
    getNote: (projectPath) => ipcRenderer.invoke('get-note', projectPath),
    saveNote: (data) => ipcRenderer.invoke('save-note', data),
    
    // Project order API
    saveProjectOrder: (data) => ipcRenderer.invoke('save-project-order', data),
    
    // Git log API
    getGitLog: (projectPath, count) => ipcRenderer.invoke('get-git-log', projectPath, count),
    
    // Editor API
    openEditor: (data) => ipcRenderer.invoke('open-editor', data),
    getEditorPaths: () => ipcRenderer.invoke('get-editor-paths'),
    setEditorPath: (data) => ipcRenderer.invoke('set-editor-path', data)
});