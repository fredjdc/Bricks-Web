function localizeLayout(language) {
  const spanish = language === "es";
  for (const element of document.querySelectorAll("[data-site-en]")) {
    element.textContent = spanish ? element.dataset.siteEs : element.dataset.siteEn;
  }
  for (const element of document.querySelectorAll("[data-site-en-aria]")) {
    element.setAttribute("aria-label", spanish ? element.dataset.siteEsAria : element.dataset.siteEnAria);
  }
}

function readPreference(key) {
    try {
        return localStorage.getItem(key);
    } catch {
        return null;
    }
}

function savePreference(key, value) {
    try {
        localStorage.setItem(key, value);
    } catch {
        // The preference still applies for this visit.
    }
}

function setupLanguage() {
    const languageSelect = document.getElementById('language-select');
    const translations = document.querySelectorAll('main [lang]:not(option), #cookie-consent-banner [lang]');
    const storedLanguage = readPreference('bricksLanguage');
    const browserLanguage = navigator.language?.split('-')[0];
    const language = ['en', 'es'].includes(storedLanguage) ? storedLanguage : browserLanguage;

    function changeLanguage(lang) {
        document.documentElement.lang = lang;
        translations.forEach(element => {
            element.classList.toggle('hidden', element.lang !== lang);
        });
        localizeLayout(lang);
        if (languageSelect) languageSelect.value = lang;
    }

    changeLanguage(language === 'es' ? 'es' : 'en');
    languageSelect?.addEventListener('change', () => {
        changeLanguage(languageSelect.value);
        savePreference('bricksLanguage', languageSelect.value);
    });
}

function setupScrollReveal() {
    const elements = document.querySelectorAll('#main .reveal-on-scroll');
    if (!elements.length || !('IntersectionObserver' in window) ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.documentElement.classList.add('purchase-motion');
    elements.forEach(element => observer.observe(element));
}

const consentBanner = document.getElementById('cookie-consent-banner');

window.updateConsent = function (consent) {
    if (consent !== 'granted' && consent !== 'denied') return;
    if (typeof window.gtag === 'function') {
        window.gtag('consent', 'update', { analytics_storage: consent });
    }
    savePreference('analytics_consent', consent);
    if (consentBanner) consentBanner.style.display = 'none';
};

setupLanguage();
setupScrollReveal();
if (consentBanner) {
    const consent = readPreference('analytics_consent') ?? readPreference('cookie-consent');
    if (consent === 'granted') window.updateConsent('granted');
    else if (consent !== 'denied') consentBanner.style.display = 'flex';
}
