// Internationalization (i18n) handler for Petrov Metal website
// Supports: English (en), Russian (ru), Bulgarian (bg)

(function() {
    'use strict';

    // Default language
    const DEFAULT_LANG = 'en';
    const STORAGE_KEY = 'petrov_metal_lang';
    const SUPPORTED_LANGS = ['en', 'ru', 'bg'];

    // Language display names and flags
    const langConfig = {
        en: { name: 'EN', fullName: 'English', flag: '🇬🇧' },
        ru: { name: 'RU', fullName: 'Русский', flag: '🇷🇺' },
        bg: { name: 'BG', fullName: 'Български', flag: '🇧🇬' }
    };

    // Get saved language or detect from browser
    function getSavedLanguage() {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved && SUPPORTED_LANGS.includes(saved)) {
            return saved;
        }

        // Try to detect from browser
        const browserLang = navigator.language.slice(0, 2);
        if (SUPPORTED_LANGS.includes(browserLang)) {
            return browserLang;
        }

        return DEFAULT_LANG;
    }

    // Save language preference
    function saveLanguage(lang) {
        localStorage.setItem(STORAGE_KEY, lang);
    }

    // Get translation for a key
    function getTranslation(lang, key) {
        if (window.translations && window.translations[lang] && window.translations[lang][key]) {
            return window.translations[lang][key];
        }
        // Fallback to English
        if (window.translations && window.translations[DEFAULT_LANG] && window.translations[DEFAULT_LANG][key]) {
            return window.translations[DEFAULT_LANG][key];
        }
        return key; // Return key as fallback
    }

    // Apply translations to the page
    function applyTranslations(lang) {
        if (!window.translations || !window.translations[lang]) {
            console.warn('Translations not available for language:', lang);
            return;
        }

        // Update all elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(function(element) {
            const key = element.getAttribute('data-i18n');
            const translation = getTranslation(lang, key);

            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                if (element.getAttribute('placeholder')) {
                    element.setAttribute('placeholder', translation);
                }
            } else if (element.tagName === 'OPTION') {
                element.textContent = translation;
            } else {
                element.textContent = translation;
            }
        });

        // Update elements with data-i18n-placeholder attribute
        document.querySelectorAll('[data-i18n-placeholder]').forEach(function(element) {
            const key = element.getAttribute('data-i18n-placeholder');
            const translation = getTranslation(lang, key);
            element.setAttribute('placeholder', translation);
        });

        // Update elements with data-i18n-label attribute (for floating labels)
        document.querySelectorAll('[data-i18n-label]').forEach(function(element) {
            const key = element.getAttribute('data-i18n-label');
            const translation = getTranslation(lang, key);
            element.textContent = translation;
        });

        // Update HTML lang attribute
        document.documentElement.setAttribute('lang', lang);

        // Update the language switcher display
        updateLanguageSwitcher(lang);
    }

    // Update language switcher UI
    function updateLanguageSwitcher(lang) {
        const currentLangBtn = document.getElementById('currentLang');
        const langDropdownItems = document.querySelectorAll('.lang-dropdown-item');
        
        if (currentLangBtn) {
            const config = langConfig[lang];
            currentLangBtn.innerHTML = `${config.flag} ${config.name} <i class="fas fa-chevron-down ms-1"></i>`;
        }

        // Update active state in dropdown
        langDropdownItems.forEach(function(item) {
            const itemLang = item.getAttribute('data-lang');
            if (itemLang === lang) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        // Update static language buttons
        updateLanguageButtons(lang);
    }

    // Update language button active states
    function updateLanguageButtons(lang) {
        document.querySelectorAll('.lang-btn').forEach(function(btn) {
            const btnLang = btn.getAttribute('data-lang');
            if (btnLang === lang) {
                btn.classList.remove('btn-light');
                btn.classList.add('btn-warning', 'active');
            } else {
                btn.classList.remove('btn-warning', 'active');
                btn.classList.add('btn-light');
            }
        });
    }

    // Switch language
    function switchLanguage(lang) {
        if (!SUPPORTED_LANGS.includes(lang)) {
            console.warn('Unsupported language:', lang);
            return;
        }

        saveLanguage(lang);
        applyTranslations(lang);
    }

    // Create language switcher HTML
    function createLanguageSwitcher() {
        const currentLang = getSavedLanguage();
        const config = langConfig[currentLang];

        return `
            <div class="language-switcher dropdown ms-3">
                <button class="btn btn-outline-primary dropdown-toggle" type="button" id="currentLang" data-bs-toggle="dropdown" aria-expanded="false">
                    ${config.flag} ${config.name} <i class="fas fa-chevron-down ms-1"></i>
                </button>
                <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="currentLang">
                    <li><a class="dropdown-item lang-dropdown-item ${currentLang === 'en' ? 'active' : ''}" href="#" data-lang="en">🇬🇧 English</a></li>
                    <li><a class="dropdown-item lang-dropdown-item ${currentLang === 'ru' ? 'active' : ''}" href="#" data-lang="ru">🇷🇺 Русский</a></li>
                    <li><a class="dropdown-item lang-dropdown-item ${currentLang === 'bg' ? 'active' : ''}" href="#" data-lang="bg">🇧🇬 Български</a></li>
                </ul>
            </div>
        `;
    }

    // Initialize i18n
    function init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initLanguage);
        } else {
            initLanguage();
        }
    }

    function initLanguage() {
        const currentLang = getSavedLanguage();

        // Insert language switcher into navbar
        const langSwitcherContainer = document.getElementById('language-switcher-container');
        if (langSwitcherContainer) {
            langSwitcherContainer.innerHTML = createLanguageSwitcher();
        }

        // Also add to mobile menu if exists
        const mobileLangSwitcher = document.getElementById('mobile-language-switcher');
        if (mobileLangSwitcher) {
            mobileLangSwitcher.innerHTML = createLanguageSwitcher();
        }

        // Apply translations
        applyTranslations(currentLang);

        // Add click handlers for language switching
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('lang-dropdown-item') || e.target.classList.contains('lang-btn')) {
                e.preventDefault();
                const lang = e.target.getAttribute('data-lang');
                if (lang) {
                    switchLanguage(lang);
                }
            }
        });

        // Update active state on language buttons
        updateLanguageButtons(currentLang);
    }

    // Expose API globally
    window.i18n = {
        init: init,
        switchLanguage: switchLanguage,
        getCurrentLanguage: getSavedLanguage,
        getTranslation: function(key) {
            return getTranslation(getSavedLanguage(), key);
        }
    };

    // Auto-initialize
    init();
})();

