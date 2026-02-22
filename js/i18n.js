// Internationalization (i18n) handler for Petrov Metal website
// Supports: English (en), Russian (ru), Bulgarian (bg)

(function() {
    'use strict';

    // Default language
    const DEFAULT_LANG = 'bg';
    const STORAGE_KEY = 'petrov_metal_lang';
    const SUPPORTED_LANGS = ['en', 'ru', 'bg'];

    // Language display names and flags
    const langConfig = {
        en: { name: 'EN', fullName: 'English', flag: '🇬🇧' },
        ru: { name: 'RU', fullName: 'Русский', flag: '🇷🇺' },
        bg: { name: 'BG', fullName: 'Български', flag: '🇧🇬' }
    };

    // Get saved language or use default
    function getSavedLanguage() {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved && SUPPORTED_LANGS.includes(saved)) {
            return saved;
        }

        // No saved preference: default to DEFAULT_LANG (Bulgarian)
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
            // Skip language buttons - they should keep their static text
            if (element.classList && element.classList.contains('lang-btn')) {
                return;
            }

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
            // Ensure button shows canonical short name from langConfig (EN, RU, BG)
            if (langConfig[btnLang] && langConfig[btnLang].name) {
                // Preserve button classes but set visible text
                btn.textContent = langConfig[btnLang].name;
            }

            if (btnLang === lang) {
                btn.classList.remove('btn-light');
                btn.classList.add('btn-warning', 'active');
            } else {
                btn.classList.remove('btn-warning', 'active');
                btn.classList.add('btn-light');
            }
        });
    }

    // Read lang param from URL if present
    function getLangFromUrl() {
        try {
            const params = new URLSearchParams(window.location.search);
            const lang = params.get('lang');
            if (lang && SUPPORTED_LANGS.includes(lang)) return lang;
        } catch (e) {
            // ignore
        }
        return null;
    }

    // Update internal links to include ?lang=XX so navigation preserves language
    function updateLinksWithLang(lang) {
        // Update all anchor tags that link to local HTML pages (not external, not mailto/tel)
        document.querySelectorAll('a[href]').forEach(function(a) {
            const href = a.getAttribute('href');
            if (!href) return;
            // Skip external links and anchors and javascript/mailto/tel
            if (href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) return;

            // Only process .html pages or plain paths
            // Build new URL object relative to current location
            try {
                const url = new URL(href, window.location.href);
                // Only modify if same origin
                if (url.origin !== window.location.origin) return;
                // Set or replace lang param
                url.searchParams.set('lang', lang);
                // Use relative path when original was relative
                const relative = url.pathname + url.search + url.hash;
                a.setAttribute('href', relative);
            } catch (e) {
                // ignore invalid URLs
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
        // Ensure links keep the selected language when navigating
        updateLinksWithLang(lang);
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
        // prefer URL lang param first
        const urlLang = getLangFromUrl();
        const currentLang = urlLang || getSavedLanguage();

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

        // Update internal links with current language so navigation preserves selection
        updateLinksWithLang(currentLang);

        // Add click handlers for language switching
        document.addEventListener('click', function(e) {
            // Use closest so clicks on child nodes (text nodes/icons) are handled
            var el = (e.target && e.target.closest) ? e.target.closest('.lang-dropdown-item, .lang-btn') : null;
            if (el) {
                e.preventDefault();
                var lang = el.getAttribute('data-lang');
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
