let currentProjects = [];
let favorites = [];
let activeProjectPath = '';
let currentLang = 'en';

function log(functionName, message) {
    console.log(`[${functionName}] ${message}`);
}

function detectSystemLanguage() {
    const systemLang = navigator.language || navigator.userLanguage;
    log('detectSystemLanguage', `System language detected: ${systemLang}`);
    
    if (systemLang.startsWith('uk')) {
        return 'uk';
    } else if (systemLang.startsWith('ru')) {
        return 'ru';
    } else {
        return 'en';
    }
}

const ui = {
    setup: document.getElementById('setup-screen'),
    setupBtn: document.getElementById('setup-btn'),
    
    gridAll: document.getElementById('all-projects-grid'),
    statTotal: document.getElementById('stat-total'),
    statFav: document.getElementById('stat-fav'),
    statActive: document.getElementById('stat-active'),
    search: document.getElementById('search-input'),

    settingPath: document.getElementById('setting-path-display'),
    settingDepth: document.getElementById('scan-depth'),
    settingDepthVal: document.getElementById('scan-depth-val'),
    settingHidden: document.getElementById('setting-show-hidden'),
    settingLanguage: document.getElementById('setting-language'),
    
    btnSaveSettings: document.getElementById('save-settings'),
    btnChangePath: document.getElementById('setting-change-path'),
    btnReset: document.getElementById('reset-app'),
    
    currentVersion: document.getElementById('current-version'),
    updateStatus: document.getElementById('update-status'),
    checkUpdateBtn: document.getElementById('check-update-btn'),
    autoUpdateCheckbox: document.getElementById('auto-update-checkbox'),

    modal: document.getElementById('command-center'),
    treeRoot: document.getElementById('cc-tree-root'),
    term: document.getElementById('cc-terminal'),
    scriptList: document.getElementById('cc-scripts-list'),
    inputScriptName: document.getElementById('new-script-name'),
    inputScriptCmd: document.getElementById('new-script-cmd'),
    headerTitle: document.getElementById('cc-project-name'),
    closeModal: document.getElementById('cc-close'),
    addScript: document.getElementById('btn-add-script'),
    openVsCode: document.getElementById('cc-open-vscode')
};

function t(key) {
    return translations[currentLang][key] || key;
}

function updateUI() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const translation = t(key);
        
        if (el.tagName === 'INPUT' && el.type !== 'checkbox') {
            el.placeholder = translation;
        } else if (el.tagName === 'OPTION') {
            el.textContent = translation;
        } else if (el.tagName !== 'INPUT') {
            el.textContent = translation;
        }
    });
    
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        el.placeholder = t(key);
    });
}

async function init() {
    log('init', 'Initializing application...');
    
    try {
        const settings = await window.api.getSettings();
        const detectedLang = detectSystemLanguage();
        currentLang = settings.language || detectedLang;
        
        log('init', `Detected system language: ${detectedLang}`);
        log('init', `Using language: ${currentLang} ${settings.language ? '(from settings)' : '(auto-detected)'}`);
        
        updateUI();
        
        if (!settings.language) {
            const langMessage = currentLang === 'uk' ? 'Українська' : currentLang === 'ru' ? 'Русский' : 'English';
            const systemLang = navigator.language || navigator.userLanguage;
            const langInfoEl = document.getElementById('setup-language-info');
            if (langInfoEl) {
                if (currentLang === detectedLang) {
                    langInfoEl.textContent = t('setup.language.detected').replace('{lang}', langMessage).replace('{system}', systemLang);
                } else {
                    langInfoEl.textContent = t('setup.language.notSupported').replace('{system}', systemLang);
                }
            }
            console.log(`%c[Language] Detected: ${langMessage} (${currentLang})`, 'color: #00f2ff; font-weight: bold;');
            console.log(`%c[Language] You can change it in Settings → Interface Language`, 'color: #888; font-style: italic;');
        } else {
            const langInfoEl = document.getElementById('setup-language-info');
            if (langInfoEl) {
                langInfoEl.style.display = 'none';
            }
        }
        
        const root = await window.api.getRootPath();
        if (root) {
            log('init', 'Root path found, loading data');
            loadData();
        } else {
            log('init', 'No root path, showing setup screen');
            ui.setup.classList.remove('hidden');
        }
    } catch (error) {
        log('init', `Error during initialization: ${error.message}`);
        console.error('[init] Full error:', error);
        ui.setup.classList.remove('hidden');
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

ui.setupBtn.onclick = async () => {
    const path = await window.api.setRootPath();
    if (path) {
        ui.setup.classList.add('hidden');
        loadData();
    }
};

async function loadData() {
    log('loadData', 'Loading projects data...');
    ui.gridAll.innerHTML = `<div style="color:#666; padding:20px;">${t('dashboard.scanning')}</div>`;
    
    const [projects, favs] = await Promise.all([
        window.api.scanSmart(),
        window.api.getFavorites()
    ]);

    currentProjects = projects;
    favorites = favs;
    log('loadData', `Loaded ${projects.length} projects, ${favs.length} favorites`);
    
    currentProjects.sort((a, b) => {
        const timeA = Math.max(a.lastOpened || 0, new Date(a.lastModified).getTime());
        const timeB = Math.max(b.lastOpened || 0, new Date(b.lastModified).getTime());
        return timeB - timeA;
    });

    updateStats();
    renderGrid(currentProjects, ui.gridAll);
}

function updateStats() {
    if(ui.statTotal) ui.statTotal.innerText = currentProjects.length;
    
    const realFavs = currentProjects.filter(p => favorites.includes(p.path));
    if(ui.statFav) ui.statFav.innerText = realFavs.length;
    
    const badgeTotal = document.getElementById('badge-total');
    const badgeFav = document.getElementById('badge-fav');
    if(badgeTotal) {
        badgeTotal.textContent = currentProjects.length;
        badgeTotal.style.display = currentProjects.length > 0 ? 'flex' : 'none';
    }
    if(badgeFav) {
        badgeFav.textContent = realFavs.length;
        badgeFav.style.display = realFavs.length > 0 ? 'flex' : 'none';
    }

    const today = new Date().toDateString();
    const active = currentProjects.filter(p => {
        const t = Math.max(p.lastOpened || 0, new Date(p.lastModified).getTime());
        return new Date(t).toDateString() === today;
    }).length;
    if(ui.statActive) ui.statActive.innerText = active;
}

function loadAllScripts() {
    const container = document.getElementById('all-scripts-list');
    if (!container) return;
    
    container.innerHTML = '';
    const allScripts = [];
    
    currentProjects.forEach(project => {
        (project.scripts || []).forEach(script => {
            allScripts.push({
                ...script,
                projectName: project.name,
                projectPath: project.path
            });
        });
    });
    
    if (allScripts.length === 0) {
        container.innerHTML = '<div style="color:#666; padding:20px; text-align:center;">No scripts found</div>';
        return;
    }
    
    allScripts.forEach(script => {
        const scriptEl = document.createElement('div');
        scriptEl.className = 'script-item';
        scriptEl.innerHTML = `
            <div class="script-item-header">
                <strong>${script.name}</strong>
                <span class="script-project">${script.projectName}</span>
            </div>
            <div class="script-item-command">${script.command}</div>
            <button class="action-btn" style="margin-top: 10px;" onclick="runGlobalScript('${script.command.replace(/'/g, "\\'")}', '${script.projectPath.replace(/\\/g, '\\\\')}', event)">
                <i class="ri-play-line"></i> Run
            </button>
        `;
        container.appendChild(scriptEl);
    });
}

function renderGrid(list, container) {
    container.innerHTML = '';
    if (list.length === 0) {
        container.innerHTML = `<div style="color:#444; padding:20px;">${t('dashboard.empty')}</div>`;
        return;
    }

    list.forEach(p => {
        const isFav = favorites.includes(p.path);
        const card = document.createElement('div');
        card.className = 'card';
        if(isFav) card.style.borderColor = 'var(--accent)';

        const lastTime = Math.max(p.lastOpened || 0, new Date(p.lastModified).getTime());
        const dateStr = new Date(lastTime).toLocaleDateString();

        let gitHtml = '';
        if(p.git) {
            const statusColor = p.git.isClean ? '#4caf50' : '#ff4444';
            const statusIcon = p.git.isClean ? 'ri-checkbox-circle-fill' : 'ri-error-warning-fill';
            const msg = p.git.message.length > 25 ? p.git.message.substring(0, 25) + '...' : p.git.message;
            
            gitHtml = `
                <div style="display:flex; align-items:center; gap:5px;">
                    <i class="${statusIcon}" style="color:${statusColor}; font-size:14px;"></i>
                    <span class="badge badge-git" title="${p.git.message} (${p.git.author})">${msg}</span>
                </div>
            `;
        }

        const quickScripts = (p.scripts || []).slice(0, 4).map(s => `
            <button class="script-tag ${s.isAuto ? 'script-auto' : ''}" onclick="runGlobalScript('${s.command}', '${p.path.replace(/\\/g, '\\\\')}', event)">
                ▶ ${s.name}
            </button>
        `).join('');

        card.innerHTML = `
            <div class="card-top">
                <h3 class="card-title">${p.name}</h3>
                <i class="${isFav ? 'ri-star-fill' : 'ri-star-line'} fav-btn" 
                   style="cursor:pointer; font-size:18px; color:${isFav ? 'gold' : '#444'}"></i>
            </div>
            <div class="card-sub">${p.path}</div>
            
            <div class="badges">
                <span class="badge">${p.parent || t('dashboard.root')}</span>
                ${gitHtml}
                <span class="badge" style="opacity:0.5; margin-left:auto;">${dateStr}</span>
            </div>

            <div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:5px;">${quickScripts}</div>
        `;

        card.onclick = (e) => {
            if (e.target.tagName !== 'BUTTON' && !e.target.classList.contains('fav-btn')) openCommandCenter(p);
        };

        card.querySelector('.fav-btn').onclick = async (e) => {
            e.stopPropagation();
            favorites = await window.api.toggleFavorite(p.path);
            updateStats();
            const isNowFav = favorites.includes(p.path);
            e.target.className = isNowFav ? 'ri-star-fill fav-btn' : 'ri-star-line fav-btn';
            e.target.style.color = isNowFav ? 'gold' : '#444';
            card.style.borderColor = isNowFav ? 'var(--accent)' : 'var(--border)';
        };

        container.appendChild(card);
    });
}

async function loadSettingsForm() {
    log('loadSettingsForm', 'Loading settings form...');
    const s = await window.api.getSettings();
    const root = await window.api.getRootPath();
    ui.settingPath.value = root || t('settings.notSelected');
    ui.settingDepth.value = s.scanDepth;
    ui.settingDepthVal.innerText = s.scanDepth;
    ui.settingHidden.checked = s.showHidden;
    ui.settingLanguage.value = s.language || 'uk';
    
    const version = await window.api.getAppVersion();
    if (ui.currentVersion) ui.currentVersion.textContent = version;
    log('loadSettingsForm', `App version: ${version}`);
    
    const autoUpdate = await window.api.getAutoUpdateSetting();
    if (ui.autoUpdateCheckbox) ui.autoUpdateCheckbox.checked = autoUpdate;
    
    await updateUpdateStatus();
}

async function updateUpdateStatus() {
    if (!ui.updateStatus) return;
    
    try {
        const currentVersion = await window.api.getAppVersion();
        const latestInfo = await window.api.getLatestVersion();
        
        if (latestInfo && latestInfo.version) {
            if (latestInfo.version === currentVersion) {
                ui.updateStatus.innerHTML = `<div class="update-message update-latest"><i class="ri-checkbox-circle-line"></i> ${t('update.status.ok')} (v${currentVersion})</div>`;
            } else {
                ui.updateStatus.innerHTML = `<div class="update-message update-available"><i class="ri-download-cloud-2-line"></i> ${t('update.status.new')}: v${latestInfo.version} (current: v${currentVersion})</div>`;
            }
        } else {
            ui.updateStatus.innerHTML = `<div class="update-message update-latest" style="opacity: 0.5;"><i class="ri-information-line"></i> ${t('update.check')}</div>`;
        }
    } catch (error) {
        ui.updateStatus.innerHTML = `<div class="update-message update-latest" style="opacity: 0.5;"><i class="ri-information-line"></i> ${t('update.check')}</div>`;
    }
}

window.api.onUpdateStatus((data) => {
    if (ui.updateStatus) {
        const statusEl = ui.updateStatus;
        statusEl.innerHTML = '';
        
        if (data.status === 'checking') {
            statusEl.innerHTML = `<div class="update-message update-checking"><i class="ri-loader-4-line"></i> ${t('update.checking')}</div>`;
        } else if (data.status === 'available') {
            statusEl.innerHTML = `
                <div class="update-message update-available">
                    <i class="ri-download-cloud-2-line"></i> 
                    <span>${t('update.available')}: v${data.version}</span>
                    <button class="action-btn" style="background: var(--accent); color: black; margin-left: 10px; padding: 6px 12px; font-size: 11px;" onclick="downloadUpdate()">${t('update.downloading')}</button>
                </div>
            `;
            showUpdateNotification('available', data.version);
        } else if (data.status === 'latest') {
            statusEl.innerHTML = `<div class="update-message update-latest"><i class="ri-checkbox-circle-line"></i> ${t('update.status.ok')}</div>`;
        } else if (data.status === 'ready') {
            statusEl.innerHTML = `
                <div class="update-message update-ready">
                    <i class="ri-install-line"></i> 
                    <span>${t('update.ready')}: v${data.version}</span>
                    <button class="action-btn" style="background: #4caf50; color: white; margin-left: 10px; padding: 6px 12px; font-size: 11px;" onclick="installUpdate()">${t('update.install')}</button>
                </div>
            `;
            showUpdateNotification('ready', data.version);
        } else if (data.status === 'error') {
            const errorMsg = data.error || t('update.error');
            statusEl.innerHTML = `<div class="update-message update-error"><i class="ri-error-warning-line"></i> ${errorMsg}</div>`;
            if (data.canDownloadManually) {
                showUpdateNotification('error', null, errorMsg);
            }
        }
    }
});

window.api.onUpdateProgress((progress) => {
    const percent = Math.round(progress.percent);
    
    if (ui.updateStatus) {
        ui.updateStatus.innerHTML = `
            <div class="update-message update-downloading">
                <i class="ri-download-cloud-2-line"></i> 
                <span>${t('update.downloading')}: ${percent}%</span>
                <div class="progress-bar" style="width: 200px; height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px; margin-top: 5px; overflow: hidden;">
                    <div style="width: ${percent}%; height: 100%; background: var(--accent); transition: width 0.3s;"></div>
                </div>
            </div>
        `;
    }
    
    const progressBar = document.getElementById('update-progress-bar');
    const progressFill = document.getElementById('update-progress-fill');
    if (progressBar && progressFill) {
        progressBar.style.display = 'block';
        progressFill.style.width = `${percent}%`;
    }
});

window.downloadUpdate = async () => {
    log('downloadUpdate', 'Starting update download...');
    showUpdateNotification('downloading');
    const result = await window.api.downloadUpdate();
    if (!result.success) {
        showUpdateNotification('error', null, result.error || 'Download failed');
    }
};

window.installUpdate = async () => {
    log('installUpdate', 'Installing update...');
    await window.api.installUpdate();
};

function showUpdateNotification(type, version, errorMessage) {
    const notification = document.getElementById('update-notification');
    const title = document.getElementById('update-notification-title');
    const message = document.getElementById('update-notification-message');
    const progressBar = document.getElementById('update-progress-bar');
    
    if (!notification || !title || !message) return;
    
    if (type === 'available') {
        title.textContent = t('update.available');
        message.textContent = `Version ${version} is available. Downloading...`;
        notification.classList.remove('hidden');
        notification.classList.remove('update-error-notif', 'update-ready-notif');
        notification.classList.add('update-available-notif');
        window.downloadUpdate();
    } else if (type === 'downloading') {
        title.textContent = t('update.downloading');
        message.textContent = 'Please wait...';
        notification.classList.remove('hidden');
        notification.classList.add('update-downloading-notif');
        if (progressBar) progressBar.style.display = 'block';
    } else if (type === 'ready') {
        title.textContent = t('update.ready');
        message.textContent = `Version ${version} is ready to install`;
        notification.classList.remove('hidden');
        notification.classList.add('update-ready-notif');
        if (progressBar) progressBar.style.display = 'none';
    } else if (type === 'error') {
        title.textContent = t('update.error');
        message.textContent = errorMessage || t('update.error');
        notification.classList.remove('hidden');
        notification.classList.add('update-error-notif');
        if (progressBar) progressBar.style.display = 'none';
    }
}

const updateInstallNow = document.getElementById('update-install-now');
const updateInstallLater = document.getElementById('update-install-later');
const updateClose = document.getElementById('update-close');

if (updateInstallNow) {
    updateInstallNow.onclick = async () => {
        await window.api.installUpdate();
    };
}

if (updateInstallLater) {
    updateInstallLater.onclick = () => {
        const notification = document.getElementById('update-notification');
        if (notification) notification.classList.add('hidden');
    };
}

if (updateClose) {
    updateClose.onclick = () => {
        const notification = document.getElementById('update-notification');
        if (notification) notification.classList.add('hidden');
    };
}

if (ui.checkUpdateBtn) {
    ui.checkUpdateBtn.onclick = async () => {
        ui.checkUpdateBtn.disabled = true;
        ui.checkUpdateBtn.textContent = t('update.checking');
        const result = await window.api.checkForUpdates();
        if (!result.success) {
            if (ui.updateStatus) {
                ui.updateStatus.innerHTML = `<div class="update-message update-error"><i class="ri-error-warning-line"></i> ${t('update.error')}</div>`;
            }
        }
        setTimeout(() => {
            ui.checkUpdateBtn.disabled = false;
            ui.checkUpdateBtn.textContent = t('update.check');
        }, 2000);
    };
}

if (ui.autoUpdateCheckbox) {
    ui.autoUpdateCheckbox.onchange = async (e) => {
        await window.api.setAutoUpdateSetting(e.target.checked);
    };
}

ui.btnChangePath.onclick = async () => {
    const newPath = await window.api.setRootPath();
    if (newPath) {
        ui.settingPath.value = newPath;
        loadData();
    }
};

ui.settingDepth.addEventListener('input', (e) => ui.settingDepthVal.innerText = e.target.value);

ui.settingLanguage.addEventListener('change', (e) => {
    currentLang = e.target.value;
    updateUI();
});

ui.btnSaveSettings.onclick = async () => {
    log('saveSettings', 'Saving settings...');
    await window.api.saveSettings({
        scanDepth: parseInt(ui.settingDepth.value),
        showHidden: ui.settingHidden.checked,
        language: ui.settingLanguage.value
    });
    log('saveSettings', 'Settings saved successfully');
    alert(t('settings.saved'));
    currentLang = ui.settingLanguage.value;
    updateUI();
    loadData();
};

ui.btnReset.onclick = async () => {
    if(confirm(t('settings.resetConfirm'))) {
        await window.api.resetSettings();
        location.reload();
    }
};

function switchView(viewName) {
    const views = ['dashboard', 'favorites', 'recent', 'scripts', 'settings'];
    views.forEach(v => {
        const viewEl = document.getElementById(`view-${v}`);
        if (viewEl) viewEl.classList.add('hidden');
    });
    
    const targetView = document.getElementById(`view-${viewName}`);
    if (targetView) targetView.classList.remove('hidden');
    
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });
    
    const activeTab = document.querySelector(`[data-tab="${viewName}"]`);
    if (activeTab) activeTab.classList.add('active');
    
    log('switchView', `Switched to: ${viewName}`);
}

document.querySelectorAll('.menu-item[data-tab]').forEach(tab => {
    tab.onclick = () => {
        const tabName = tab.dataset.tab;
        
        if (tabName === 'settings') {
            switchView('settings');
            loadSettingsForm();
        } else if (tabName === 'favorites') {
            switchView('favorites');
            renderGrid(currentProjects.filter(p => favorites.includes(p.path)), document.getElementById('favorites-grid'));
        } else if (tabName === 'recent') {
            switchView('recent');
            const recent = currentProjects
                .filter(p => p.lastOpened)
                .sort((a, b) => b.lastOpened - a.lastOpened)
                .slice(0, 20);
            renderGrid(recent, document.getElementById('recent-grid'));
        } else if (tabName === 'scripts') {
            switchView('scripts');
            loadAllScripts();
        } else {
            switchView('dashboard');
            renderGrid(currentProjects, ui.gridAll);
        }
    };
});

if (ui.search) {
    ui.search.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const activeTab = document.querySelector('.menu-item.active')?.dataset.tab || 'dashboard';
        let list = currentProjects;
        if (activeTab === 'favorites') list = list.filter(p => favorites.includes(p.path));
        renderGrid(list.filter(p => p.name.toLowerCase().includes(term)), ui.gridAll);
    });
}

const searchFavorites = document.getElementById('search-favorites');
if (searchFavorites) {
    searchFavorites.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const favList = currentProjects.filter(p => favorites.includes(p.path));
        renderGrid(favList.filter(p => p.name.toLowerCase().includes(term)), document.getElementById('favorites-grid'));
    });
}

window.runGlobalScript = async (cmd, path, e) => {
    if(e) e.stopPropagation();
    await window.api.logUsage(path);
    const project = currentProjects.find(p => p.path === path);
    if(project) {
        project.lastOpened = Date.now();
        openCommandCenter(project);
        runTermCommand(cmd, path);
    }
};

async function openCommandCenter(project) {
    activeProjectPath = project.path;
    ui.modal.classList.remove('hidden');
    ui.headerTitle.innerText = project.name;
    ui.term.innerText = `${t('cc.connected')} ${project.name}...\n`;
    
    window.api.logUsage(project.path);
    project.lastOpened = Date.now();

    loadTree(project.path, ui.treeRoot);
    loadScriptsInModal(project);
}

function loadScriptsInModal(project) {
    ui.scriptList.innerHTML = '';
    const scripts = project.scripts || [];
    
    scripts.forEach(s => {
        const wrapper = document.createElement('div');
        wrapper.className = s.isAuto ? 'script-tag script-auto' : 'script-tag';
        wrapper.innerHTML = `<span>▶ ${s.name}</span>`;
        
        if (!s.isAuto) {
            const delBtn = document.createElement('span');
            delBtn.innerHTML = '×';
            delBtn.style.marginLeft = '10px';
            delBtn.style.opacity = '0.5';
            delBtn.onclick = async (e) => {
                e.stopPropagation();
                if(confirm(t('cc.deleteScript'))) {
                    await window.api.deleteScript({ projectPath: activeProjectPath, scriptId: s.id });
                    const updatedScripts = await window.api.getScripts(activeProjectPath);
                    loadData();
                    ui.modal.classList.add('hidden');
                }
            };
            wrapper.appendChild(delBtn);
        }

        wrapper.onclick = () => runTermCommand(s.command, activeProjectPath);
        ui.scriptList.appendChild(wrapper);
    });
}

ui.addScript.onclick = async () => {
    const name = ui.inputScriptName.value;
    const cmd = ui.inputScriptCmd.value;
    if(!name || !cmd) return;
    await window.api.saveScript({ projectPath: activeProjectPath, name, command: cmd });
    ui.modal.classList.add('hidden');
    loadData();
    setTimeout(() => {
        const p = currentProjects.find(pr => pr.path === activeProjectPath);
        if(p) openCommandCenter(p);
    }, 100);
    ui.inputScriptName.value = ''; ui.inputScriptCmd.value = '';
};

function runTermCommand(cmd, cwd) {
    ui.term.innerText += `\n> ${cmd}\n`;
    window.api.runCommand({ command: cmd, cwd });
}

window.api.onTermData((data) => { 
    ui.term.innerText += data; 
    ui.term.scrollTop = ui.term.scrollHeight; 
});

function getFileIcon(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    
    const icons = {
        'js':   { icon: 'ri-javascript-fill', color: '#f7df1e' },
        'jsx':  { icon: 'ri-reactjs-fill', color: '#61dafb' },
        'ts':   { icon: 'ri-code-s-slash-line', color: '#3178c6' },
        'tsx':  { icon: 'ri-reactjs-fill', color: '#3178c6' },
        'html': { icon: 'ri-html5-fill', color: '#e34f26' },
        'css':  { icon: 'ri-css3-fill', color: '#264de4' },
        'json': { icon: 'ri-braces-line', color: '#a0a' },
        'md':   { icon: 'ri-markdown-line', color: '#fff' },
        'git':  { icon: 'ri-git-branch-line', color: '#f1502f' },
        'png':  { icon: 'ri-image-fill', color: '#aaa' },
        'jpg':  { icon: 'ri-image-fill', color: '#aaa' },
        'svg':  { icon: 'ri-image-line', color: '#ffb13b' },
        'env':  { icon: 'ri-settings-3-line', color: '#0f0' }
    };

    if (filename.includes('git')) return icons.git;
    return icons[ext] || { icon: 'ri-file-text-line', color: '#666' };
}

async function loadTree(path, container) {
    const items = await window.api.readTree(path);
    container.innerHTML = '';
    items.forEach(item => {
        const div = document.createElement('div');
        div.style.padding = '4px 8px';
        div.style.cursor = 'pointer';
        div.style.display = 'flex';
        div.style.alignItems = 'center';
        div.style.gap = '8px';
        div.style.color = '#ccc';
        
        let iconHtml;
        if (item.isDirectory) {
            iconHtml = `<i class="ri-folder-2-fill" style="color: #dcb67a;"></i>`;
        } else {
            const { icon, color } = getFileIcon(item.name);
            iconHtml = `<i class="${icon}" style="color: ${color};"></i>`;
        }
        
        div.innerHTML = `${iconHtml} <span style="font-size:13px;">${item.name}</span>`;
        
        if (item.isDirectory) {
            const wrapper = document.createElement('div');
            const header = document.createElement('div');
            header.innerHTML = div.innerHTML;
            header.style.padding = '4px 8px';
            header.style.cursor = 'pointer';
            header.style.display = 'flex';
            header.style.alignItems = 'center';
            header.style.gap = '8px';
            
            const group = document.createElement('div');
            group.className = 'hidden';
            group.style.marginLeft = '18px';
            group.style.borderLeft = '1px solid #333';
            
            header.onclick = (e) => {
                e.stopPropagation();
                group.classList.toggle('hidden');
                if(!group.hasChildNodes()) loadTree(item.path, group);
            };

            wrapper.appendChild(header);
            wrapper.appendChild(group);
            container.appendChild(wrapper);
        } else {
            div.onclick = () => window.api.openVsCode(item.path);
            container.appendChild(div);
        }
    });
}

ui.closeModal.onclick = () => { 
    ui.modal.classList.add('hidden'); 
    loadData(); 
};

ui.openVsCode.onclick = () => { window.api.openVsCode(activeProjectPath); window.api.logUsage(activeProjectPath); };