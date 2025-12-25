const translations = {
    uk: {
        'setup.welcome': 'Вітаємо в myDevHub',
        'setup.subtitle': 'Твій командний центр. Обери головну папку для початку.',
        'setup.selectWorkspace': 'Обрати папку Workspace',
        'setup.hint': 'Обери папку, де знаходяться твої проєкти розробки',
        'setup.feature1.title': 'Управління проєктами',
        'setup.feature1.desc': 'Організуй всі свої проєкти в одному місці',
        'setup.feature2.title': 'Швидкі дії',
        'setup.feature2.desc': 'Запускай скрипти та команди миттєво',
        'setup.feature3.title': 'Інтеграція Git',
        'setup.feature3.desc': 'Відстежуй статус репозиторіїв одним поглядом',
        'setup.language.detected': 'Мова: {lang} (визначено з вашої системи: {system})',
        'setup.language.notSupported': 'Мова: Англійська (мова вашої системи {system} не підтримується)',
        'setup.language.changeHint': 'Ви можете змінити мову в Налаштуваннях після запуску',
        
        'sidebar.main': 'Головне',
        'sidebar.tools': 'Інструменти',
        'sidebar.dashboard': 'Дашборд',
        'sidebar.favorites': 'Улюблене',
        'sidebar.recent': 'Недавні',
        'sidebar.terminal': 'Термінал',
        'sidebar.scripts': 'Скрипти',
        'sidebar.settings': 'Налаштування',
        'sidebar.github': 'GitHub',
        
        'favorites.title': 'Улюблені проєкти',
        'recent.title': 'Недавно відкриті',
        'terminal.title': 'Глобальний термінал',
        'scripts.title': 'Всі скрипти',
        
        'stats.totalProjects': 'Всього проєктів',
        'stats.modifiedToday': 'Змінено сьогодні',
        'stats.favorites': 'Улюблених',
        
        'dashboard.yourProjects': 'Ваші проєкти',
        'dashboard.search': 'Пошук...',
        'dashboard.scanning': 'Scanning...',
        'dashboard.empty': 'Порожнеча...',
        'dashboard.root': 'ROOT',
        
        'settings.title': 'Налаштування системи',
        'settings.rootFolder': 'Коренева папка',
        'settings.change': 'Змінити',
        'settings.scanDepth': 'Глибина сканування',
        'settings.showHidden': 'Показувати приховані файли',
        'settings.language': 'Мова інтерфейсу',
        'settings.save': 'Зберегти налаштування',
        'settings.reset': 'Скинути все',
        'settings.saved': 'Налаштування збережено',
        'settings.resetConfirm': 'Скинути всі налаштування?',
        'settings.editors': 'Редактори',
        'settings.defaultEditor': 'Редактор за замовчуванням',
        'settings.editorPaths': 'Шляхи до редакторів',
        'settings.refreshEditors': 'Оновити список',
        'settings.refreshing': 'Оновлення...',
        'settings.notSelected': 'Не обрано',
        'settings.theme': 'Тема',
        'settings.theme.dark': 'Темна',
        'settings.theme.light': 'Світла',
        'settings.autostart': 'Автозапуск при вході в систему',
        'settings.notifications': 'Сповіщення',
        'settings.general': 'Загальні',
        
        'cc.fileExplorer': 'File Explorer',
        'cc.loading': 'Load...',
        'cc.scriptsActions': 'SCRIPTS & ACTIONS',
        'cc.scriptName': 'Назва',
        'cc.scriptCommand': 'Команда (npm start)',
        'cc.add': 'Додати',
        'cc.ready': '> Ready...',
        'cc.openVscode': 'Відкрити в VS Code',
        'cc.openEditor': 'Відкрити в редакторі',
        'cc.connected': '> Система підключена до',
        'cc.deleteScript': 'Видалити скрипт?',
        'cc.projectInfo': 'ІНФОРМАЦІЯ ПРО ПРОЄКТ',
        'cc.tags': 'Теги (через кому)',
        'cc.note': 'Нотатка',
        'cc.saveInfo': 'Зберегти',
        'cc.viewGitLog': 'Історія Git',
        
        'gitLog.title': 'Історія комітів Git',
        'gitLog.loading': 'Завантаження...',
        
        'context.open': 'Відкрити',
        'context.editTags': 'Редагувати теги',
        'context.editNote': 'Редагувати нотатку',
        'context.gitLog': 'Історія Git',
        'context.openVscode': 'Відкрити в VS Code',
        'context.toggleFavorite': 'Улюблене',
        
        'footer.createdBy': 'Створено',
        'footer.website': 'Вебсайт',
        'footer.github': 'GitHub',
        
        'lang.uk': 'Українська',
        'lang.en': 'English',
        'lang.ru': 'Русский',
        
        'changelog.title': 'Історія версій',
        'update.checking': 'Перевірка оновлень...',
        'update.available': 'Доступне оновлення',
        'update.downloading': 'Завантаження...',
        'update.ready': 'Оновлення готове',
        'update.install': 'Встановити зараз',
        'update.later': 'Пізніше',
        'update.latest': 'У вас остання версія',
        'update.check': 'Перевірити оновлення',
        'update.error': 'Помилка перевірки оновлень',
        'update.version': 'Версія',
        'update.current': 'Поточна версія',
        'update.auto': 'Автоматичне оновлення',
        'update.status.ok': 'Все добре, у вас остання версія',
        'update.status.new': 'Доступна нова версія'
    },
    
    en: {
        'setup.welcome': 'Welcome to myDevHub',
        'setup.subtitle': 'Your command center. Choose your main folder to get started.',
        'setup.selectWorkspace': 'Select Workspace Folder',
        'setup.hint': 'Select the folder where your development projects are located',
        'setup.feature1.title': 'Project Management',
        'setup.feature1.desc': 'Organize all your projects in one place',
        'setup.feature2.title': 'Quick Actions',
        'setup.feature2.desc': 'Run scripts and commands instantly',
        'setup.feature3.title': 'Git Integration',
        'setup.feature3.desc': 'Track repository status at a glance',
        'setup.language.detected': 'Language: {lang} (detected from your system: {system})',
        'setup.language.notSupported': 'Language: English (your system language {system} is not supported)',
        'setup.language.changeHint': 'You can change the language in Settings after startup',
        
        'sidebar.main': 'Main',
        'sidebar.tools': 'Tools',
        'sidebar.dashboard': 'Dashboard',
        'sidebar.favorites': 'Favorites',
        'sidebar.recent': 'Recent',
        'sidebar.terminal': 'Terminal',
        'sidebar.scripts': 'Scripts',
        'sidebar.settings': 'Settings',
        'sidebar.github': 'GitHub',
        
        'favorites.title': 'Favorite Projects',
        'recent.title': 'Recently Opened',
        'terminal.title': 'Global Terminal',
        'scripts.title': 'All Scripts',
        
        'stats.totalProjects': 'Total Projects',
        'stats.modifiedToday': 'Modified Today',
        'stats.favorites': 'Favorites',
        
        'dashboard.yourProjects': 'Your Projects',
        'dashboard.search': 'Search...',
        'dashboard.scanning': 'Scanning...',
        'dashboard.empty': 'Empty...',
        'dashboard.root': 'ROOT',
        
        'settings.title': 'System Settings',
        'settings.rootFolder': 'Root Folder',
        'settings.change': 'Change',
        'settings.scanDepth': 'Scan Depth',
        'settings.showHidden': 'Show hidden files',
        'settings.language': 'Interface Language',
        'settings.save': 'Save Settings',
        'settings.reset': 'Reset All',
        'settings.saved': 'Settings saved',
        'settings.resetConfirm': 'Reset all settings?',
        'settings.editors': 'Editors',
        'settings.defaultEditor': 'Default Editor',
        'settings.editorPaths': 'Editor Paths (optional)',
        'settings.refreshEditors': 'Refresh List',
        'settings.refreshing': 'Refreshing...',
        'settings.notSelected': 'Not selected',
        'settings.theme': 'Theme',
        'settings.theme.dark': 'Dark',
        'settings.theme.light': 'Light',
        'settings.autostart': 'Start on system login',
        'settings.notifications': 'Notifications',
        'settings.general': 'General',
        
        'cc.fileExplorer': 'File Explorer',
        'cc.loading': 'Load...',
        'cc.scriptsActions': 'SCRIPTS & ACTIONS',
        'cc.scriptName': 'Name',
        'cc.scriptCommand': 'Command (npm start)',
        'cc.add': 'Add',
        'cc.ready': '> Ready...',
        'cc.openVscode': 'Open in VS Code',
        'cc.openEditor': 'Open in Editor',
        'cc.connected': '> System connected to',
        'cc.deleteScript': 'Delete script?',
        'cc.projectInfo': 'PROJECT INFO',
        'cc.tags': 'Tags (comma separated)',
        'cc.note': 'Note',
        'cc.saveInfo': 'Save',
        'cc.viewGitLog': 'Git History',
        
        'gitLog.title': 'Git Commit History',
        'gitLog.loading': 'Loading...',
        
        'context.open': 'Open',
        'context.editTags': 'Edit Tags',
        'context.editNote': 'Edit Note',
        'context.gitLog': 'Git Log',
        'context.openVscode': 'Open in VS Code',
        'context.toggleFavorite': 'Toggle Favorite',
        
        'footer.createdBy': 'Created by',
        'footer.website': 'Website',
        'footer.github': 'GitHub',
        
        'lang.uk': 'Українська',
        'lang.en': 'English',
        'lang.ru': 'Русский',
        
        'update.checking': 'Checking for updates...',
        'update.available': 'Update available',
        'update.downloading': 'Downloading...',
        'update.ready': 'Update ready',
        'update.install': 'Install now',
        'update.later': 'Later',
        'update.latest': 'You have the latest version',
        'update.check': 'Check for updates',
        'update.error': 'Error checking for updates',
        'update.version': 'Version',
        'update.current': 'Current version',
        'update.auto': 'Auto update',
        'update.status.ok': 'All good, you have the latest version',
        'update.status.new': 'New version available'

    },
    
    ru: {
        'setup.welcome': 'Добро пожаловать в myDevHub',
        'setup.subtitle': 'Твой командный центр. Выбери главную папку для начала.',
        'setup.selectWorkspace': 'Выбрать папку Workspace',
        'setup.hint': 'Выбери папку, где находятся твои проекты разработки',
        'setup.feature1.title': 'Управление проектами',
        'setup.feature1.desc': 'Организуй все свои проекты в одном месте',
        'setup.feature2.title': 'Быстрые действия',
        'setup.feature2.desc': 'Запускай скрипты и команды мгновенно',
        'setup.feature3.title': 'Интеграция Git',
        'setup.feature3.desc': 'Отслеживай статус репозиториев одним взглядом',
        'setup.language.detected': 'Язык: {lang} (определен из вашей системы: {system})',
        'setup.language.notSupported': 'Язык: Английский (язык вашей системы {system} не поддерживается)',
        'setup.language.changeHint': 'Вы можете изменить язык в Настройках после запуска',
        
        'sidebar.main': 'Главное',
        'sidebar.tools': 'Инструменты',
        'sidebar.dashboard': 'Панель управления',
        'sidebar.favorites': 'Избранное',
        'sidebar.recent': 'Недавние',
        'sidebar.terminal': 'Терминал',
        'sidebar.scripts': 'Скрипты',
        'sidebar.settings': 'Настройки',
        'sidebar.github': 'GitHub',
        
        'favorites.title': 'Избранные проекты',
        'recent.title': 'Недавно открытые',
        'terminal.title': 'Глобальный терминал',
        'scripts.title': 'Все скрипты',
        
        'stats.totalProjects': 'Всего проектов',
        'stats.modifiedToday': 'Изменено сегодня',
        'stats.favorites': 'Избранных',
        
        'dashboard.yourProjects': 'Ваши проекты',
        'dashboard.search': 'Поиск...',
        'dashboard.scanning': 'Сканирование...',
        'dashboard.empty': 'Пусто...',
        'dashboard.root': 'ROOT',
        
        'settings.title': 'Настройки системы',
        'settings.rootFolder': 'Корневая папка',
        'settings.change': 'Изменить',
        'settings.scanDepth': 'Глубина сканирования',
        'settings.showHidden': 'Показывать скрытые файлы',
        'settings.language': 'Язык интерфейса',
        'settings.save': 'Сохранить настройки',
        'settings.reset': 'Сбросить все',
        'settings.saved': 'Настройки сохранены',
        'settings.resetConfirm': 'Сбросить все настройки?',
        'settings.notSelected': 'Не выбрано',
        'settings.editors': 'Редакторы',
        'settings.defaultEditor': 'Редактор по умолчанию',
        'settings.editorPaths': 'Пути к редакторам',
        'settings.refreshEditors': 'Обновить список',
        'settings.refreshing': 'Обновление...',
        'settings.theme': 'Тема',
        'settings.theme.dark': 'Темная',
        'settings.theme.light': 'Светлая',
        'settings.autostart': 'Автозапуск при входе в систему',
        'settings.notifications': 'Уведомления',
        'settings.general': 'Общие',
        
        'cc.fileExplorer': 'Проводник файлов',
        'cc.loading': 'Загрузка...',
        'cc.scriptsActions': 'СКРИПТЫ И ДЕЙСТВИЯ',
        'cc.scriptName': 'Название',
        'cc.scriptCommand': 'Команда (npm start)',
        'cc.add': 'Добавить',
        'cc.ready': '> Готово...',
        'cc.openVscode': 'Открыть в VS Code',
        'cc.openEditor': 'Открыть в редакторе',
        'cc.connected': '> Система подключена к',
        'cc.deleteScript': 'Удалить скрипт?',
        'cc.projectInfo': 'ИНФОРМАЦИЯ О ПРОЕКТЕ',
        'cc.tags': 'Теги (через запятую)',
        'cc.note': 'Заметка',
        'cc.saveInfo': 'Сохранить',
        'cc.viewGitLog': 'История Git',
        
        'gitLog.title': 'История коммитов Git',
        'gitLog.loading': 'Загрузка...',
        
        'context.open': 'Открыть',
        'context.editTags': 'Редактировать теги',
        'context.editNote': 'Редактировать заметку',
        'context.gitLog': 'История Git',
        'context.openVscode': 'Открыть в VS Code',
        'context.toggleFavorite': 'Избранное',
        
        'footer.createdBy': 'Создано',
        'footer.website': 'Вебсайт',
        'footer.github': 'GitHub',
        
        'lang.uk': 'Українська',
        'lang.en': 'English',
        'lang.ru': 'Русский',
        
        'update.checking': 'Проверка обновлений...',
        'update.available': 'Доступно обновление',
        'update.downloading': 'Загрузка...',
        'update.ready': 'Обновление готово',
        'update.install': 'Установить сейчас',
        'update.later': 'Позже',
        'update.latest': 'У вас последняя версия',
        'update.check': 'Проверить обновления',
        'update.error': 'Ошибка проверки обновлений',
        'update.version': 'Версия',
        'update.current': 'Текущая версия',
        'update.auto': 'Автоматическое обновление',
        'update.status.ok': 'Все хорошо, у вас последняя версия',
        'update.status.new': 'Доступна новая версия'
    }
};


function t(key) {
    return translations[currentLang][key] || key;
}

function setLanguage(lang) {
    if (translations[lang]) {
        currentLang = lang;
        updateUI();
    }
}

function updateUI() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const translation = t(key);
        
        if (el.tagName === 'INPUT' && el.type !== 'checkbox') {
            el.placeholder = translation;
        } else if (el.tagName !== 'INPUT') {
            el.textContent = translation;
        }
    });
    
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        el.placeholder = t(key);
    });
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { translations, t, setLanguage, updateUI };
}