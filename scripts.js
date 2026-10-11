// Tailwind configuration
if (typeof tailwind !== 'undefined') {
    tailwind.config = {
        theme: {
            container: {
                center: true,
                padding: '1rem',
                screens: {
                    DEFAULT: '100%',
                    sm: '640px',
                    md: '768px',
                    lg: '1024px',
                    xl: '1200px',
                    '2xl': '1200px',
                },
            },
            extend: {
                colors: {
                    border: "hsl(240 5.9% 90%)",
                    input: "hsl(240 5.9% 90%)",
                    ring: "hsl(240 5% 64.9%)",
                    background: "hsl(0 0% 100%)",
                    foreground: "hsl(240 10% 3.9%)",
                    primary: {
                        DEFAULT: "hsl(240 5.9% 10%)",
                        foreground: "hsl(0 0% 98%)",
                    },
                    secondary: {
                        DEFAULT: "hsl(240 4.8% 95.9%)",
                        foreground: "hsl(240 5.9% 10%)",
                    },
                    destructive: {
                        DEFAULT: "hsl(0 84.2% 60.2%)",
                        foreground: "hsl(0 0% 98%)",
                    },
                    muted: {
                        DEFAULT: "hsl(240 4.8% 95.9%)",
                        foreground: "hsl(240 3.8% 46.1%)",
                    },
                    accent: {
                        DEFAULT: "hsl(240 4.8% 95.9%)",
                        foreground: "hsl(240 5.9% 10%)",
                    },
                    popover: {
                        DEFAULT: "hsl(0 0% 100%)",
                        foreground: "hsl(240 10% 3.9%)",
                    },
                    card: {
                        DEFAULT: "hsl(0 0% 100%)",
                        foreground: "hsl(240 10% 3.9%)",
                    },
                    brand: {
                        DEFAULT: "hsl(220 65% 55%)",
                        foreground: "hsl(0 0% 98%)",
                    },
                    success: {
                        DEFAULT: "hsl(142 76% 36%)",
                        foreground: "hsl(0 0% 98%)",
                    }
                },
                borderRadius: {
                    lg: "var(--radius)",
                    md: "calc(var(--radius) - 20px)",
                    sm: "calc(var(--radius) - 40px)",
                },
                fontFamily: {
                    sans: ["Inter", "sans-serif"],
                },
                boxShadow: {
                    'soft-md': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                    'soft-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02)',
                    'soft-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.01)',
                },
            },
        },
    };
}

// Utility functions
const debounce = (fn, delay) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args), delay);
    };
};



// Intersection Observer for animations
/**
 * ── Site-Wide Intersection Observer ────────────────────────────
 * Unified engine for scroll-triggered animations (Reveal, Fade, Slide).
 */
const setupIntersectionObserver = () => {
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -60px 0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Support both legacy 'animate-in' and new 'is-visible' classes
                entry.target.classList.add('is-visible');
                entry.target.classList.add('animate-in');
                
                // Also handle the hero accent line specifically if found
                const accentLine = entry.target.querySelector('.hero-accent-line');
                if (accentLine) accentLine.classList.add('is-visible');

                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Target all common animation classes used across the site
    const targets = document.querySelectorAll('.reveal-on-scroll, .animate-on-scroll, .hero-app-item, .ecosystem-card, .bento-card, .value-card, .testimonial');
    targets.forEach(el => observer.observe(el));
};

// Hero word swap animation settings keep timing centralized
const HERO_WORD_FADE_DURATION = 300;
const HERO_WORD_HOLD_DURATION = 1700;
const heroWordControllers = [];

/**
 * Creates a controller that handles the hero word swap lifecycle.
 * @param {HTMLElement} container - Wrapper with data attributes that describe the animation.
 * @returns {{ lang: string, start: Function, stop: Function, refresh: Function } | null}
 */
const createHeroWordController = (container) => {
    if (!container) {
        return null;
    }

    const lang = container.dataset.lang || 'en';
    const words = (container.dataset.words || '')
        .split('|')
        .map((word) => word.trim())
        .filter(Boolean);
    const wordElement = container.querySelector('.hero-word');

    if (!wordElement || words.length === 0) {
        return null;
    }

    const fadeDuration = Number(container.dataset.fadeMs) || HERO_WORD_FADE_DURATION;
    const holdDuration = Number(container.dataset.holdMs) || HERO_WORD_HOLD_DURATION;
    const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let timers = [];
    let currentIndex = 0;

    const clearTimers = () => {
        timers.forEach(clearTimeout);
        timers = [];
    };

    const setWordInstant = (word) => {
        wordElement.textContent = word;
    };

    // Keeps layout width stable to avoid the heading from jumping.
    const computeMinWidth = () => {
        if (!words.length) {
            return;
        }

        const measureElement = wordElement.cloneNode(true);
        measureElement.style.position = 'absolute';
        measureElement.style.visibility = 'hidden';
        measureElement.style.whiteSpace = 'nowrap';
        measureElement.style.pointerEvents = 'none';
        measureElement.style.opacity = '0';

        document.body.appendChild(measureElement);

        let maxWidth = 0;
        words.forEach((word) => {
            measureElement.textContent = word;
            const width = measureElement.getBoundingClientRect().width;
            if (width > maxWidth) {
                maxWidth = width;
            }
        });

        document.body.removeChild(measureElement);

        if (maxWidth > 0) {
            container.style.setProperty('--hero-word-min-width', `${Math.ceil(maxWidth)}px`);
        }
    };

    const animateTo = (word, onComplete) => {
        container.classList.add('is-fading-out');

        const fadeOutTimer = setTimeout(() => {
            container.classList.remove('is-fading-out');
            setWordInstant(word);
            container.classList.add('is-fading-in');

            const fadeInTimer = setTimeout(() => {
                container.classList.remove('is-fading-in');
                if (typeof onComplete === 'function') {
                    onComplete();
                }
            }, fadeDuration);

            timers.push(fadeInTimer);
        }, fadeDuration);

        timers.push(fadeOutTimer);
    };

    const scheduleNext = () => {
        if (currentIndex >= words.length - 1) {
            return;
        }

        const holdTimer = setTimeout(() => {
            currentIndex += 1;
            animateTo(words[currentIndex], scheduleNext);
        }, holdDuration);

        timers.push(holdTimer);
    };

    const start = () => {
        clearTimers();
        currentIndex = 0;
        setWordInstant(words[currentIndex]);
        computeMinWidth();
        container.classList.remove('is-fading-in', 'is-fading-out');

        if (words.length <= 1 || reduceMotionQuery.matches) {
            return;
        }

        scheduleNext();
    };

    const stop = () => {
        clearTimers();
        container.classList.remove('is-fading-in', 'is-fading-out');
    };

    const handleMotionPreferenceChange = () => {
        stop();
        setWordInstant(words[0]);
    };

    if (typeof reduceMotionQuery.addEventListener === 'function') {
        reduceMotionQuery.addEventListener('change', handleMotionPreferenceChange);
    } else if (typeof reduceMotionQuery.addListener === 'function') {
        // Safari fallback
        reduceMotionQuery.addListener(handleMotionPreferenceChange);
    }

    // Ensure the initial word is visible immediately.
    setWordInstant(words[0]);
    computeMinWidth();

    return {
        lang,
        start,
        stop,
        refresh: computeMinWidth
    };
};

/**
 * Scans the DOM for word-swap containers and registers controllers.
 */
const initializeHeroWordSwap = () => {
    heroWordControllers.length = 0;
    document.querySelectorAll('[data-word-swap]').forEach((container) => {
        const controller = createHeroWordController(container);
        if (controller) {
            heroWordControllers.push(controller);
        }
    });
};

/**
 * Syncs word swap animation with the active language.
 * @param {string} lang - The language that should animate.
 */
const updateHeroWordSwapForLanguage = (lang) => {
    heroWordControllers.forEach((controller) => {
        controller.stop();
        if (controller.lang === lang) {
            controller.start();
        }
    });
};

// Language handling
const detectUserLanguage = () => {
    const browserLang = (navigator.language || navigator.userLanguage).split('-')[0];
    return ['en', 'es', 'fr', 'pt'].includes(browserLang) ? browserLang : 'en';
};

/**
 * Changes the language of the entire application
 * @param {string} lang - The language code ('en' or 'es')
 */
const changeLanguage = (lang) => {
    try {
        // Store user preference
        localStorage.setItem('bricksLanguage', lang);

        // Update document language attribute
        document.documentElement.setAttribute('lang', lang);

        // Hide all language elements first
        document.querySelectorAll('[lang]').forEach(el => {
            el.classList.add('hidden');
        });

        // Show only the elements with the selected language
        document.querySelectorAll(`[lang="${lang}"]`).forEach(el => {
            el.classList.remove('hidden');
        });

        // Update placeholders based on language
        updatePlaceholders(lang);

        // Update app screenshot images based on language
        updateAppScreenshots(lang);

        // Update active state in language menu
        document.querySelectorAll('.lang-option').forEach(option => {
            if (option.getAttribute('data-lang') === lang) {
                option.classList.add('active');
            } else {
                option.classList.remove('active');
            }
        });

        // Sync footer dropdown select if present
        const languageSelect = document.getElementById('language-select');
        if (languageSelect) {
            languageSelect.value = lang;
        }

        // Restart hero headline animation for the freshly selected language
        updateHeroWordSwapForLanguage(lang);
    } catch (error) {
        console.error('Error changing language:', error);
    }
};

// Update form placeholders based on language
const updatePlaceholders = (lang) => {
    try {
        // Support form placeholders
        const placeholders = {
            name: {
                en: 'Enter your full name',
                es: 'Ingresa tu nombre completo',
                fr: 'Entrez votre nom complet',
                pt: 'Digite seu nome completo'
            },
            email: {
                en: 'Enter your email address',
                es: 'Ingresa tu correo electrónico',
                fr: 'Entrez votre adresse e-mail',
                pt: 'Digite seu endereço de e-mail'
            },
            description: {
                en: 'Please describe the issue in detail...',
                es: 'Por favor describe el problema en detalle...',
                fr: 'Veuillez décrire le problème en détail...',
                pt: 'Por favor, descreva o problema em detalhes...'
            }
        };

        // Update form input placeholders
        const nameInput = document.getElementById('name');
        const emailInput = document.getElementById('email');
        const descInput = document.getElementById('issue-description');

        if (nameInput) nameInput.placeholder = placeholders.name[lang];
        if (emailInput) emailInput.placeholder = placeholders.email[lang];
        if (descInput) descInput.placeholder = placeholders.description[lang];
    } catch (error) {
        console.error('Error updating placeholders:', error);
    }
};

// Update app screenshot images based on language
const updateAppScreenshots = (lang) => {
    try {
        // Define image paths for each app and language
        const imagePaths = {
            'bricks-calc': {
                es: 'images/bricks-calc-img-es.png',
                en: 'images/bricks-calc-img-en.png',
                fr: 'images/bricks-calc-img-en.png', // Fallback
                pt: 'images/bricks-calc-img-en.png'  // Fallback
            },
            'bricks-calc-hero': {
                es: 'images/bricks-calc-hero-es.png',
                en: 'images/bricks-calc-hero-en.png'
            },
            'bricks-calc-hero-layer-back': {
                es: 'images/back-layer-es-03.png',
                en: 'images/back-layer-en-03.png'
            },
            'bricks-calc-hero-layer-middle': {
                es: 'images/mid-layer-es-02.png',
                en: 'images/mid-layer-en-02.png'
            },
            'bricks-calc-hero-layer-front': {
                es: 'images/top-layer-es-01.png',
                en: 'images/top-layer-en-01.png'
            },
            'bricks-calc-fusion-back': {
                es: 'images/fusion-es-01.png',
                en: 'images/fusion-en-01.png'
            },
            'bricks-calc-fusion-middle': {
                es: 'images/fusion-es-02.png',
                en: 'images/fusion-en-02.png'
            },
            // Key features gallery artwork toggles with locale-specific imagery
            'bricks-calc-feature-01': {
                es: 'images/feature-es-01.jpg',
                en: 'images/feature-en-01.jpg'
            },
            'bricks-calc-feature-02': {
                es: 'images/feature-es-02.jpg',
                en: 'images/feature-en-02.jpg'
            },
            'bricks-calc-feature-03': {
                es: 'images/feature-es-03.jpg',
                en: 'images/feature-en-03.jpg'
            },
            'bricks-calc-feature-04': {
                es: 'images/feature-es-04.jpg',
                en: 'images/feature-en-04.jpg'
            },
            'bricks-calc-feature-05': {
                es: 'images/feature-es-05.jpg',
                en: 'images/feature-en-05.jpg'
            },
            'bricks-leads': {
                es: 'images/bricks-leads-img-es.png',
                en: 'images/bricks-leads-img-en.png',
                fr: 'images/bricks-leads-img-en.png', // Fallback
                pt: 'images/bricks-leads-img-en.png'  // Fallback
            },
            'bricks-leads-layer-back': {
                es: 'images-bricks-leads/leads-back-layer-es.png',
                en: 'images-bricks-leads/leads-back-layer-en.png'
            },
            'bricks-leads-layer-middle': {
                es: 'images-bricks-leads/leads-mid-layer-es.png',
                en: 'images-bricks-leads/leads-mid-layer-en.png'
            },
            'bricks-leads-layer-front': {
                es: 'images-bricks-leads/leads-top-layer-es.png',
                en: 'images-bricks-leads/leads-top-layer-en.png'
            },
            // Bricks Scan
            'bricks-scan-hero-layer-back': {
                es: 'images-bricks-scan/back-layer-es-03.png',
                en: 'images-bricks-scan/back-layer-en-03.png'
            },
            'bricks-scan-hero-layer-middle': {
                es: 'images-bricks-scan/mid-layer-es-02.png',
                en: 'images-bricks-scan/mid-layer-en-02.png'
            },
            'bricks-scan-hero-layer-front': {
                es: 'images-bricks-scan/top-layer-es-01.png',
                en: 'images-bricks-scan/top-layer-en-01.png'
            },
            'bricks-scan-fusion-back': {
                es: 'images-bricks-scan/fusion-es-01.png',
                en: 'images-bricks-scan/fusion-en-01.png'
            },
            'bricks-scan-fusion-middle': {
                es: 'images-bricks-scan/fusion-es-02.png',
                en: 'images-bricks-scan/fusion-en-02.png'
            },
            'bricks-scan-feature-01': {
                es: 'images-bricks-scan/scan-feature-es-01.png',
                en: 'images-bricks-scan/scan-feature-en-01.png'
            },
            'bricks-scan-feature-02': {
                es: 'images-bricks-scan/scan-feature-es-02.png',
                en: 'images-bricks-scan/scan-feature-en-02.png'
            },
            'bricks-scan-feature-03': {
                es: 'images-bricks-scan/scan-feature-es-03.png',
                en: 'images-bricks-scan/scan-feature-en-03.png'
            },
            'bricks-scan-feature-04': {
                es: 'images-bricks-scan/scan-feature-es-04.png',
                en: 'images-bricks-scan/scan-feature-en-04.png'
            },
            'bricks-scan-feature-05': {
                es: 'images-bricks-scan/scan-feature-es-05.png',
                en: 'images-bricks-scan/scan-feature-en-05.png'
            },
            'bricks-scan-feature-06': {
                es: 'images-bricks-scan/scan-feature-es-06.png',
                en: 'images-bricks-scan/scan-feature-en-06.png'
            },
            'bricks-scan-feature-07': {
                es: 'images-bricks-scan/scan-feature-es-07.png',
                en: 'images-bricks-scan/scan-feature-en-07.png'
            }
        };

        // Find all images with data-app-image attribute and update their sources
        document.querySelectorAll('[data-app-image]').forEach(img => {
            const appName = img.getAttribute('data-app-image');
            let imagePath = imagePaths[appName]?.[lang];

            // For English, try to use English version, but fallback to Spanish as placeholder
            if (lang === 'en' && imagePath && imagePath.includes('-en.png')) {
                // Test if English image exists, otherwise use Spanish placeholder
                const testImg = new Image();
                testImg.onerror = () => {
                    // English image doesn't exist, use Spanish version as placeholder
                    img.src = imagePaths[appName].es;
                };
                testImg.onload = () => {
                    // English image exists, use it
                    img.src = imagePath;
                };
                testImg.src = imagePath;
            } else if (lang === 'es' && imagePath && imagePath.includes('-es.png')) {
                // For Spanish, test if Spanish image exists, otherwise fallback to English
                const testImg = new Image();
                testImg.onerror = () => {
                    // Spanish image doesn't exist, use English version as fallback
                    img.src = imagePaths[appName].en || imagePath;
                };
                testImg.onload = () => {
                    // Spanish image exists, use it
                    img.src = imagePath;
                };
                testImg.src = imagePath;
            } else if (imagePath) {
                // Direct path assignment if no language-specific testing needed
                img.src = imagePath;
            }
        });
    } catch (error) {
        console.error('Error updating app screenshots:', error);
    }
};

// Gentle parallax for the Apps Overview stacks
const initAppsParallax = () => {
    // Respect user preference for reduced motion and bail if animation should be skipped
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
        return;
    }

    const parallaxCards = document.querySelectorAll('[data-app-parallax]');
    if (!parallaxCards.length) {
        return;
    }

    let pointerX = 0;
    let pointerY = 0;
    let rafId = null;

    const updateParallax = () => {
        rafId = null;

        const writes = [];

        // READ PHASE: Calculate all positions first
        parallaxCards.forEach((card) => {
            const rect = card.getBoundingClientRect();
            const distanceFromCenter = rect.top + rect.height / 2 - window.innerHeight / 2;

            card.querySelectorAll('[data-parallax-depth]').forEach((layer) => {
                const depth = Number(layer.dataset.parallaxDepth || 0);
                writes.push({ layer, depth, distanceFromCenter });
            });
        });

        // WRITE PHASE: Apply all transforms in a batch
        writes.forEach(({ layer, depth, distanceFromCenter }) => {
            const scrollOffset = -distanceFromCenter * depth * 0.18;
            const pointerOffsetX = pointerX * depth * 24;
            const pointerOffsetY = pointerY * depth * 16;

            layer.style.transform = `translate3d(${pointerOffsetX}px, ${scrollOffset + pointerOffsetY}px, 0)`;
        });
    };

    const scheduleUpdate = () => {
        if (rafId !== null) {
            return;
        }
        rafId = requestAnimationFrame(updateParallax);
    };

    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);
    window.addEventListener('pointermove', (event) => {
        pointerX = event.clientX / window.innerWidth - 0.5;
        pointerY = event.clientY / window.innerHeight - 0.5;
        scheduleUpdate();
    });

    // Run once so the layers start in the right spot without needing user input
    scheduleUpdate();
};



// Language switcher setup
const setupLanguageSwitcher = () => {
    const languageSwitcher = document.getElementById('language-switcher');
    const languageMenu = document.getElementById('language-menu');
    const languageSelect = document.getElementById('language-select');

    // Initial language
    const savedLang = localStorage.getItem('bricksLanguage');
    const initialLang = savedLang || detectUserLanguage();
    changeLanguage(initialLang);

    // Sync the footer dropdown select to the initial language
    if (languageSelect) {
        languageSelect.value = initialLang;
        languageSelect.addEventListener('change', () => {
            changeLanguage(languageSelect.value);
        });
    }

    // Legacy toggle menu (globe button) – still used on other pages
    if (languageSwitcher && languageMenu) {
        languageSwitcher.addEventListener('click', (e) => {
            e.stopPropagation();
            languageMenu.classList.toggle('is-visible');
        });

        // Close menu on outside click
        document.addEventListener('click', () => {
            languageMenu.classList.remove('is-visible');
        });

        // Prevent menu from closing when clicking inside it
        languageMenu.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        // Handle language selection from menu
        languageMenu.querySelectorAll('.lang-option').forEach(option => {
            option.addEventListener('click', () => {
                const lang = option.getAttribute('data-lang');
                changeLanguage(lang);
                languageMenu.classList.remove('is-visible');
                // Keep the select dropdown in sync if present
                if (languageSelect) {
                    languageSelect.value = lang;
                }
            });
        });
    }
};

// Cookie Consent Management
const initializeCookieConsent = () => {
    // Check for previously stored consent on page load
    const storedConsent = localStorage.getItem('analytics_consent');
    const banner = document.getElementById('cookie-consent-banner');

    if (banner) {
        if (storedConsent === 'granted') {
            updateConsent('granted');
        } else if (storedConsent === 'denied') {
            // User explicitly denied before
            banner.style.display = 'none';
        } else {
            // Show the banner if no stored preference
            banner.style.display = 'flex';
        }
    }
};

window.updateConsent = function (consent) {
    if (typeof gtag === 'function') {
        if (consent === 'granted') {
            gtag('consent', 'update', {
                'analytics_storage': 'granted'
            });
            localStorage.setItem('analytics_consent', 'granted');
        } else {
            gtag('consent', 'update', {
                'analytics_storage': 'denied'
            });
            localStorage.setItem('analytics_consent', 'denied');
        }
    } else {
        // Fallback if gtag is not defined
        localStorage.setItem('analytics_consent', consent);
    }

    const banner = document.getElementById('cookie-consent-banner');
    if (banner) {
        banner.style.display = 'none';
    }
};

// Bricks Scan specific layout logic (Parallax, Scroll Progress, etc.)
const initBricksScanAnimations = () => {
    // Note: Intersection Observer for .reveal-on-scroll is now handled by setupIntersectionObserver()

    const problemSection = document.getElementById("problem-section");
    const expandingBg = problemSection ? problemSection.querySelector(".expanding-bg") : null;

    if (problemSection && expandingBg) {
        let bgTicking = false;
        const handleScroll = () => {
            if (bgTicking) return;
            bgTicking = true;
            requestAnimationFrame(() => {
                const rect = problemSection.getBoundingClientRect();
                const windowHeight = window.innerHeight;

                const triggerPoint = windowHeight * 0.2;
                const totalDistance = windowHeight - triggerPoint;

                let progress = (windowHeight - rect.top) / totalDistance;
                progress = Math.min(Math.max(progress, 0), 1);

                const startWidth = 50;
                const endWidth = 100;
                const startRadius = 24;
                const endRadius = 0;

                const currentWidth = startWidth + (endWidth - startWidth) * progress;
                const currentRadius = startRadius - (startRadius - endRadius) * progress;

                expandingBg.style.width = `${currentWidth}%`;
                expandingBg.style.borderRadius = `${currentRadius}px`;
                bgTicking = false;
            });
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll();
    }

    const stackContainer = document.querySelector(".screenshot-stack");
    const leftScreenshots = stackContainer ? stackContainer.querySelectorAll(".screenshot-side.left") : [];
    const rightScreenshots = stackContainer
        ? stackContainer.querySelectorAll(".screenshot-side.right")
        : [];

    if (stackContainer && leftScreenshots.length > 0 && rightScreenshots.length > 0) {
        let fanoutTicking = false;
        const handleSolutionScroll = () => {
            if (fanoutTicking) return;
            fanoutTicking = true;
            requestAnimationFrame(() => {
                const rect = stackContainer.getBoundingClientRect();
                const windowHeight = window.innerHeight;

                const startPoint = windowHeight * 0.9;
                const endPoint = windowHeight * 0.3;
                const totalDistance = startPoint - endPoint;

                let progress = (startPoint - rect.top) / totalDistance;
                progress = Math.min(Math.max(progress, 0), 1);

                const isMobile = window.innerWidth <= 768;
                const maxTranslateX = isMobile ? 40 : 80;
                const maxTranslateY = isMobile ? -10 : -20;

                const currentTranslateX = maxTranslateX * progress;
                const currentTranslateY = maxTranslateY * progress;

                leftScreenshots.forEach((el) => {
                    el.style.transform = `translateX(-${currentTranslateX}px) translateY(${currentTranslateY}px)`;
                });
                rightScreenshots.forEach((el) => {
                    el.style.transform = `translateX(${currentTranslateX}px) translateY(${currentTranslateY}px)`;
                });
                fanoutTicking = false;
            });
        };

        window.addEventListener("scroll", handleSolutionScroll, { passive: true });
        handleSolutionScroll();
    }

    const heroSection = document.querySelector('.section-hero');
    const cursorGlow = document.querySelector('.hero-cursor-glow');
    const dotGrid = document.querySelector('.hero-dot-grid');

    if (dotGrid || cursorGlow) {
        let dotX = 50, dotY = 42;
        let cursorActive = false;
        let targetX = 50, targetY = 42;

        function autoPos(t) {
            return {
                x: 50 + 32 * Math.sin(t * 0.22),
                y: 42 + 20 * Math.sin(t * 0.37 + 1.0)
            };
        }

        function tick() {
            const t = Date.now() / 1000;
            const target = cursorActive ? { x: targetX, y: targetY } : autoPos(t);

            const speed = cursorActive ? 0.12 : 0.04;
            dotX += (target.x - dotX) * speed;
            dotY += (target.y - dotY) * speed;

            const xPct = dotX.toFixed(2) + '%';
            const yPct = dotY.toFixed(2) + '%';

            if (dotGrid) {
                dotGrid.style.setProperty('--dot-x', xPct);
                dotGrid.style.setProperty('--dot-y', yPct);
            }

            if (cursorGlow && !cursorActive) {
                cursorGlow.style.left = xPct;
                cursorGlow.style.top = yPct;
            }

            requestAnimationFrame(tick);
        }

        requestAnimationFrame(tick);

        if (heroSection) {
            heroSection.addEventListener('mousemove', (e) => {
                const rect = heroSection.getBoundingClientRect();
                targetX = ((e.clientX - rect.left) / rect.width) * 100;
                targetY = ((e.clientY - rect.top) / rect.height) * 100;
                cursorActive = true;

                if (cursorGlow) {
                    cursorGlow.style.left = targetX.toFixed(2) + '%';
                    cursorGlow.style.top = targetY.toFixed(2) + '%';
                }
            }, { passive: true });

            heroSection.addEventListener('mouseleave', () => {
                cursorActive = false;
            }, { passive: true });
        }
    }
};

/**
 * ── Centralized Micro-Animations ─────────────────────────────
 * Handles scroll progress, header scroll-states, and hero
 * background interactivity (dot grid spotlight + glow).
 */
const setupMicroAnimations = () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ── Single rAF scroll loop (progress + header + parallax) ──
    const progressBar = document.getElementById('scroll-progress');
    const header = document.querySelector('.site-header');
    
    // Look for any hero background (supports .index-hero and .section-hero)
    const heroBg = document.querySelector('.hero-bg');

    let scrollTicking = false;

    window.addEventListener('scroll', () => {
        if (scrollTicking) return;
        scrollTicking = true;
        requestAnimationFrame(() => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;

            // Scroll progress bar
            if (progressBar && docHeight > 0) {
                progressBar.style.width = ((scrollTop / docHeight) * 100).toFixed(2) + '%';
            }

            // Header: shrink + deepen shadow past 60 px
            if (header) {
                header.classList.toggle('scrolled', scrollTop > 60);
            }

            // Parallax hero background
            if (heroBg) {
                heroBg.style.transform = `translateY(${scrollTop * 0.35}px)`;
            }

            scrollTicking = false;
        });
    }, { passive: true });

    if (prefersReducedMotion) return;

    // ── Dot Grid + Glow: Autonomous drift + cursor override ───
    // Targeted at hero sections (either .index-hero or .section-hero)
    const heroSection = document.querySelector('.index-hero, .section-hero');
    const cursorGlow = document.querySelector('.hero-cursor-glow');
    const dotGrid = document.querySelector('.hero-dot-grid');

    if (dotGrid || cursorGlow) {
        // Lerp state — starts at offset to feel natural
        let dotX = 50, dotY = 42;
        let cursorActive = false;
        let targetX = 50, targetY = 42;

        // Lissajous figure — slow, smooth drift
        function autoPos(t) {
            return {
                x: 50 + 32 * Math.sin(t * 0.22),
                y: 42 + 20 * Math.sin(t * 0.37 + 1.0)
            };
        }

        function tick() {
            const t = Date.now() / 1000;
            const target = cursorActive ? { x: targetX, y: targetY } : autoPos(t);

            // Cursor mode: snappier; Auto mode: slower
            const speed = cursorActive ? 0.12 : 0.04;
            dotX += (target.x - dotX) * speed;
            dotY += (target.y - dotY) * speed;

            const xPct = dotX.toFixed(2) + '%';
            const yPct = dotY.toFixed(2) + '%';

            if (dotGrid) {
                dotGrid.style.setProperty('--dot-x', xPct);
                dotGrid.style.setProperty('--dot-y', yPct);
            }

            if (cursorGlow && !cursorActive) {
                cursorGlow.style.left = xPct;
                cursorGlow.style.top = yPct;
            }

            requestAnimationFrame(tick);
        }

        requestAnimationFrame(tick);

        if (heroSection) {
            heroSection.addEventListener('mousemove', (e) => {
                const rect = heroSection.getBoundingClientRect();
                targetX = ((e.clientX - rect.left) / rect.width) * 100;
                targetY = ((e.clientY - rect.top) / rect.height) * 100;
                cursorActive = true;

                if (cursorGlow) {
                    cursorGlow.style.left = targetX.toFixed(2) + '%';
                    cursorGlow.style.top = targetY.toFixed(2) + '%';
                }
            }, { passive: true });

            heroSection.addEventListener('mouseleave', () => {
                cursorActive = false;
            }, { passive: true });
        }
    }
};

/**
 * ── Desktop App Banner ───────────────────────────────────────
 * Shows a banner on macOS browsers to promote the App Store app.
 */
const initializeDesktopBanner = () => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const isMacOS = navigator.platform && navigator.platform.toUpperCase().indexOf("MAC") >= 0;
    const bannerElement = document.getElementById("desktop-app-banner");
    const closeBannerButton = document.getElementById("desktop-app-banner-close");
    const bannerDismissed = localStorage.getItem("app_banner_dismissed");
    
    if (bannerElement && closeBannerButton) {
        if (isMacOS && !isMobile && !bannerDismissed) {
            bannerElement.style.display = "flex";
        }
        
        closeBannerButton.addEventListener("click", () => {
            bannerElement.style.display = "none";
            localStorage.setItem("app_banner_dismissed", "true");
        });
    }
};

/**
 * ── Privacy Cards 3D Mouse Tilt ──────────────────────────────
 * Applies a liquid glass 3D hover effect to elements with the `.privacy-card` class.
 */
const initPrivacyCards = () => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;
    
    document.querySelectorAll('.privacy-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const r = card.getBoundingClientRect();
            // Calculate hover position relative to the center of the card
            const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
            const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
            card.style.transform =
                `perspective(600px) rotateX(${(-dy * 7).toFixed(2)}deg) rotateY(${(dx * 7).toFixed(2)}deg) translateY(-6px)`;
            card.style.transition = 'transform 0.1s ease, box-shadow 0.1s ease';
        }, { passive: true });
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
            card.style.transition = 'transform 0.4s var(--ease-out-expo), box-shadow 0.4s var(--ease-out-expo)';
        }, { passive: true });
    });
};

// Global Initialization
document.addEventListener('DOMContentLoaded', () => {
    initializeHeroWordSwap();
    setupLanguageSwitcher();
    setupIntersectionObserver();
    initAppsParallax();
    initBricksScanAnimations();
    setupMicroAnimations();
    initializeCookieConsent();
    initializeDesktopBanner(); // Added banner logic
    initPrivacyCards();

    const storedLang = localStorage.getItem('bricksLanguage');
    const userLang = storedLang || detectUserLanguage();
    changeLanguage(userLang);

    window.addEventListener('resize', debounce(() => {
        heroWordControllers.forEach((controller) => controller.refresh());
    }, 250));
});
