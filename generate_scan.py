import sys
import os

with open('calc.html', 'r') as f:
    calc_html = f.read()

# Extract shared JSX core
shared_start = calc_html.find('// ==========================================================================\n        // COPY')
shared_end = calc_html.find('// ==========================================================================\n        // CALC_COPY')

if shared_start == -1 or shared_end == -1:
    print("Could not find shared JSX boundaries")
    sys.exit(1)

shared_jsx = calc_html[shared_start:shared_end]

scan_app_jsx = """
        // ==========================================================================
        // SCAN_COPY — page-specific copy (EN/ES)
        // ==========================================================================

        const SCAN_COPY = {
            en: {
                hero: {
                    eyebrow: 'Bricks Scan',
                    title: ['Scan once.', 'Ready to find.'],
                    body: 'Bricks Scan keeps your documents organized, searchable, and ready when you need them—right on your device.',
                    cta: 'Download on the App Store',
                    sub: 'Free to start. No account required.',
                },
                pillars: {
                    eyebrow: 'Privacy',
                    title: ['Private', 'by design.'],
                    body: 'Processing stays on your device. Your documents are never uploaded for analysis or organization.',
                    items: [
                        { t: '100% Offline', d: 'Works offline wherever you need to scan.' },
                        { t: 'On-Device Processing', d: 'Your data stays on your device from the first scan.' },
                        { t: 'Optional iCloud Sync', d: 'Sync across devices only when you choose to.' },
                    ],
                },
                feature_org: {
                    eyebrow: 'Organize',
                    title: ['Named and filed,', 'automatically.'],
                    body: 'Documents that organize themselves. Every scan gets a clear name and lands in the right folder based on its content.',
                    bullets: [
                        { t: 'Auto-Sort', d: 'Every scan gets a clear name and lands in the right folder.' },
                        { t: 'Smart Folders & Tags', d: 'Folders and tags are applied dynamically based on content.' },
                    ],
                },
                feature_search: {
                    eyebrow: 'Access',
                    title: ['Find anything,', 'in seconds.'],
                    body: 'Don\\'t waste time scrolling through a generic camera roll. Everything in Bricks Scan is instantly searchable.',
                    bullets: [
                        { t: 'Instant Search', d: 'Find any document via keyword, name, or address.' },
                        { t: 'Apple Integration', d: 'Native system integration lets you use Spotlight, Calendar, and Reminders with your scans.' },
                    ],
                },
                feature_tools: {
                    eyebrow: 'Act',
                    title: ['Ready to share,', 'ready to sign.'],
                    body: 'Clean PDFs from every scan. Review, sign, and share without jumping between different apps.',
                    bullets: [
                        { t: 'Ready to Share', d: 'Ready to attach, forward, or print without extra steps.' },
                        { t: 'Markup & Notes', d: 'Review without leaving the app. Highlight, annotate, and save notes directly on any scan.' },
                        { t: 'Paperless Signing', d: 'Sign without printing. Add your signature to any document, directly on-device.' },
                    ],
                },
                testimony: {
                    eyebrow: 'User testimony',
                    quote: 'I was at the embassy to pick up my father\\'s passport when they told me I needed a signed authorization letter from him. He wasn\\'t with me and isn\\'t tech savvy. He sent me a photo of his signature on paper, I added it to the letter in Bricks Scan, printed it nearby, and solved it on the spot. It saved me from wasting the trip and starting over.',
                    summary: 'The value was simple: extract the signature, place it on the letter, and export a clean document ready to print.',
                    tags: ['Signature from paper', 'Placed on document', 'Ready to print'],
                    metadata: 'Shared by a Bricks Scan user.'
                },
                ecosystem: {
                    eyebrow: 'The suite',
                    title: 'Part of a quiet toolkit.',
                    sub: 'Three apps, one approach. Each one removes a single friction from the day.',
                    items: [
                        { id: 'scan', name: 'Bricks Scan', tagline: 'Documents, organized.', href: 'scan.html', active: true },
                        { id: 'calc', name: 'Bricks Calc', tagline: 'Mortgages, instantly.', href: 'calc.html', active: false },
                        { id: 'leads', name: 'Bricks Leads', tagline: 'A calm CRM.', href: 'leads.html', active: false },
                    ],
                },
            },
            es: {
                hero: {
                    eyebrow: 'Bricks Scan',
                    title: ['Escanea una vez.', 'Listo para encontrar.'],
                    body: 'Texto buscable, nombres claros y todo organizado en tu dispositivo.',
                    cta: 'Descargar en App Store',
                    sub: 'Gratis para empezar. Sin cuenta obligatoria.',
                },
                pillars: {
                    eyebrow: 'Privacidad',
                    title: ['Privado', 'por diseño.'],
                    body: 'El procesamiento ocurre en tu dispositivo. Tus documentos nunca se suben para analizarlos ni organizarlos.',
                    items: [
                        { t: '100% sin conexión', d: 'Funciona sin internet donde necesites escanear.' },
                        { t: 'Procesamiento Local', d: 'Tus datos se quedan en tu dispositivo desde el primer escaneo.' },
                        { t: 'iCloud Sync Opcional', d: 'Sincroniza entre dispositivos solo cuando lo elijas.' },
                    ],
                },
                feature_org: {
                    eyebrow: 'Organizar',
                    title: ['Nombrado y archivado,', 'automáticamente.'],
                    body: 'Documentos que se organizan solos. Carpetas y etiquetas aplicadas automáticamente según el contenido.',
                    bullets: [
                        { t: 'Auto-Sort', d: 'Con nombre y archivado automáticamente. Cada escaneo obtiene un nombre claro.' },
                        { t: 'Smart Folders & Tags', d: 'Carpetas y etiquetas aplicadas según el contenido del documento.' },
                    ],
                },
                feature_search: {
                    eyebrow: 'Acceso',
                    title: ['Encuentra todo,', 'en segundos.'],
                    body: 'Encuentra cualquier documento en segundos. Busca por palabra clave, nombre o dirección.',
                    bullets: [
                        { t: 'Búsqueda Instantánea', d: 'Busca por palabras que están dentro del documento.' },
                        { t: 'Apple Integration', d: 'Usa Spotlight, Calendario y Recordatorios con tus documentos.' },
                    ],
                },
                feature_tools: {
                    eyebrow: 'Actuar',
                    title: ['Listos para compartir,', 'listos para firmar.'],
                    body: 'PDFs limpios de cada escaneo. Revisa, firma y comparte sin cambiar de app.',
                    bullets: [
                        { t: 'Listo para Compartir', d: 'Listos para adjuntar, reenviar o imprimir sin pasos extra.' },
                        { t: 'Marcado y Notas', d: 'Resalta, anota y guarda notas en cualquier escaneo.' },
                        { t: 'Firma sin Imprimir', d: 'Añade tu firma a cualquier documento, directamente en tu dispositivo.' },
                    ],
                },
                testimony: {
                    eyebrow: 'Testimonio de usuario',
                    quote: 'Estaba en la embajada para recoger el pasaporte de mi papá cuando me dijeron que necesitaba una carta de autorización firmada por él. No estaba conmigo y no es muy hábil con la tecnología. Me envió una foto de su firma en papel, la añadí a la carta en Bricks Scan, la imprimí cerca y lo resolví en el momento. Me evitó perder el viaje y empezar de nuevo.',
                    summary: 'El valor fue simple: extraer la firma, colocarla en la carta y exportar un documento limpio, listo para imprimir.',
                    tags: ['Firma desde papel', 'Colocada en el documento', 'Lista para imprimir'],
                    metadata: 'Compartido por un usuario de Bricks Scan.'
                },
                ecosystem: {
                    eyebrow: 'La suite',
                    title: 'Parte de un kit tranquilo.',
                    sub: 'Tres apps, un solo enfoque. Cada una quita una fricción del día.',
                    items: [
                        { id: 'scan', name: 'Bricks Scan', tagline: 'Documentos ordenados.', href: 'scan.html', active: true },
                        { id: 'calc', name: 'Bricks Calc', tagline: 'Hipotecas al instante.', href: 'calc.html', active: false },
                        { id: 'leads', name: 'Bricks Leads', tagline: 'Un CRM tranquilo.', href: 'leads.html', active: false },
                    ],
                },
            },
        };

        const SCAN_ACCENT = window.ACCENTS.scan.light;

        // ==========================================================================
        // ScanHero
        // ==========================================================================

        function ScanHero({ t, lang, theme }) {
            const reveal = window.useReveal();
            const isMobile = window.useIsMobile();
            const videoSrc = `images-bricks-scan/hero-video-${lang}.mp4`;
            const posterSrc = `images-bricks-scan/hero-video-img-${lang}.png`;

            return (
                <section ref={reveal} style={{
                    padding: isMobile ? '120px 20px 48px' : '160px 48px 80px',
                    maxWidth: 1280, margin: '0 auto',
                }}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: isMobile ? '1fr' : '1.1fr 1fr',
                        gap: isMobile ? 40 : 64,
                        alignItems: 'center',
                    }}>
                        <div>
                            <div className="reveal" style={{
                                ...window.eyebrowStyle,
                                color: SCAN_ACCENT,
                            }}>{t.hero.eyebrow}</div>

                            <h1 className="reveal reveal-d1" style={{
                                fontSize: isMobile ? 44 : 72,
                                fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.02,
                                margin: '0 0 24px', color: 'var(--b-text)',
                            }}>
                                {t.hero.title[0]}<br />
                                <span style={{ color: 'var(--b-text-2)' }}>{t.hero.title[1]}</span>
                            </h1>

                            <p className="reveal reveal-d2" style={{
                                fontSize: isMobile ? 17 : 19, lineHeight: 1.6, color: 'var(--b-text-2)',
                                margin: '0 0 36px', maxWidth: 520,
                            }}>{t.hero.body}</p>

                            <div className="reveal reveal-d3">
                                <a href="https://apps.apple.com/us/app/bricks-scan-scan-to-pdf/id6758148083"
                                    style={{
                                        display: 'inline-flex', alignItems: 'center', gap: 10,
                                        padding: isMobile ? '14px 26px' : '16px 32px',
                                        background: SCAN_ACCENT,
                                        color: '#fff', textDecoration: 'none',
                                        border: 'none', borderRadius: 100, fontSize: 15, fontWeight: 600,
                                        fontFamily: 'inherit', letterSpacing: '-0.01em',
                                        boxShadow: `0 12px 28px ${SCAN_ACCENT}40`,
                                        transition: 'transform 0.15s ease',
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
                                >
                                    {t.hero.cta}
                                </a>
                                <p style={{
                                    fontSize: 13, color: 'var(--b-text-3)', lineHeight: 1.55, marginTop: 12
                                }}>
                                    {t.hero.sub}
                                </p>
                            </div>
                        </div>

                        {!isMobile && (
                            <div className="reveal reveal-d2">
                                <window.ScreenshotVideo
                                    src={videoSrc}
                                    posterSrc={posterSrc}
                                    alt="Bricks Scan interface"
                                    accent={SCAN_ACCENT}
                                    lang={lang}
                                />
                            </div>
                        )}
                    </div>

                    {isMobile && (
                        <div className="reveal reveal-d3" style={{ marginTop: 48 }}>
                            <window.ScreenshotVideo
                                src={videoSrc}
                                posterSrc={posterSrc}
                                alt="Bricks Scan interface"
                                accent={SCAN_ACCENT}
                                lang={lang}
                            />
                        </div>
                    )}
                </section>
            );
        }

        // ==========================================================================
        // ScanFeatureSplit
        // ==========================================================================

        function ScanFeatureSplit({ feature, reverse, shotSrc }) {
            const reveal = window.useReveal();
            const isMobile = window.useIsMobile();
            return (
                <section ref={reveal} style={{
                    padding: isMobile ? '56px 20px' : '96px 48px',
                    maxWidth: 1280, margin: '0 auto',
                }}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                        gap: isMobile ? 40 : 96,
                        alignItems: 'center',
                        direction: reverse && !isMobile ? 'rtl' : 'ltr',
                    }}>
                        <div className="reveal" style={{ direction: 'ltr' }}>
                            <div style={{ ...window.eyebrowStyle, color: SCAN_ACCENT }}>{feature.eyebrow}</div>
                            <h2 style={{
                                fontSize: isMobile ? 36 : 52, fontWeight: 900, letterSpacing: '-0.035em',
                                lineHeight: 1.02, margin: '0 0 20px', color: 'var(--b-text)',
                            }}>
                                {feature.title[0]}<br />
                                <span style={{ color: 'var(--b-text-2)' }}>{feature.title[1]}</span>
                            </h2>
                            <p style={{ ...window.leadP, marginBottom: 28 }}>{feature.body}</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                                {feature.bullets.map((b, i) => (
                                    <window.Bullet key={i} accent={SCAN_ACCENT} t={b.t} d={b.d} />
                                ))}
                            </div>
                        </div>
                        <div className="reveal reveal-d1" style={{ direction: 'ltr' }}>
                            <window.ScreenshotPhone src={shotSrc} alt={feature.title.join(' ')} accent={SCAN_ACCENT} />
                        </div>
                    </div>
                </section>
            );
        }

        // ==========================================================================
        // ScanPillars (Privacy)
        // ==========================================================================

        function ScanPillars({ t }) {
            const reveal = window.useReveal();
            const isMobile = window.useIsMobile();
            return (
                <section ref={reveal} style={{
                    padding: isMobile ? '56px 20px' : '120px 48px',
                    maxWidth: 1200, margin: '0 auto',
                }}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: isMobile ? '1fr' : '1fr 1.2fr',
                        gap: isMobile ? 32 : 80,
                        alignItems: 'start', marginBottom: isMobile ? 40 : 64,
                    }}>
                        <div className="reveal">
                            <div style={{ ...window.eyebrowStyle, color: SCAN_ACCENT }}>{t.pillars.eyebrow}</div>
                            <h2 style={{
                                fontSize: isMobile ? 36 : 56, fontWeight: 900, letterSpacing: '-0.035em',
                                lineHeight: 1.02, margin: 0, color: 'var(--b-text)',
                            }}>
                                {t.pillars.title[0]}<br />
                                <span style={{ color: 'var(--b-text-2)' }}>{t.pillars.title[1]}</span>
                            </h2>
                        </div>
                        <p className="reveal reveal-d1" style={{
                            fontSize: 18, lineHeight: 1.6, color: 'var(--b-text-2)', margin: 0,
                        }}>{t.pillars.body}</p>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
                        gap: isMobile ? 16 : 24,
                    }}>
                        {t.pillars.items.map((p, i) => (
                            <div key={i} className={`reveal reveal-d${i + 1}`} style={{
                                background: 'var(--b-bg-elevated)', borderRadius: 32,
                                padding: isMobile ? 28 : 36,
                                boxShadow: 'var(--emboss-soft)',
                                border: '1px solid var(--b-border)',
                            }}>
                                <div style={{
                                    width: 36, height: 36, borderRadius: 12,
                                    background: `${SCAN_ACCENT}1a`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    marginBottom: 20,
                                }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke={SCAN_ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                </div>
                                <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--b-text)', marginBottom: 8, letterSpacing: '-0.01em' }}>{p.t}</div>
                                <div style={{ fontSize: 15, color: 'var(--b-text-2)', lineHeight: 1.55 }}>{p.d}</div>
                            </div>
                        ))}
                    </div>
                </section>
            );
        }

        // ==========================================================================
        // ScanTestimony
        // ==========================================================================

        function ScanTestimony({ t }) {
            const reveal = window.useReveal();
            const isMobile = window.useIsMobile();
            return (
                <section ref={reveal} style={{
                    padding: isMobile ? '56px 20px' : '120px 48px',
                    maxWidth: 1280, margin: '0 auto',
                }}>
                    <div className="reveal" style={{ textAlign: 'center', marginBottom: isMobile ? 32 : 56 }}>
                        <div style={{ ...window.eyebrowStyle, color: SCAN_ACCENT }}>{t.testimony.eyebrow}</div>
                    </div>
                    <div className="reveal reveal-d1" style={{
                        maxWidth: 860, margin: '0 auto',
                        background: 'var(--b-bg-elevated)', borderRadius: 48,
                        padding: isMobile ? '36px 24px' : '56px 64px',
                        boxShadow: 'var(--emboss-soft)',
                        border: '1px solid var(--b-border)',
                        display: 'flex', flexDirection: 'column', gap: 32,
                    }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" style={{ opacity: 0.6 }}>
                            <path d="M6 11c0-3 2-5 5-5v2c-2 0-3 1-3 3h3v5H6V11zm8 0c0-3 2-5 5-5v2c-2 0-3 1-3 3h3v5h-5V11z" fill={SCAN_ACCENT} />
                        </svg>
                        
                        <blockquote style={{
                            margin: 0, fontSize: isMobile ? 20 : 26, lineHeight: 1.45,
                            fontWeight: 500, color: 'var(--b-text)', letterSpacing: '-0.015em',
                        }}>
                            "{t.testimony.quote}"
                        </blockquote>

                        <div style={{
                            paddingTop: 32, borderTop: '1px solid var(--b-border)',
                        }}>
                            <p style={{ fontSize: 16, color: 'var(--b-text-2)', lineHeight: 1.5, margin: '0 0 20px' }}>
                                {t.testimony.summary}
                            </p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 24 }}>
                                {t.testimony.tags.map((tag, i) => (
                                    <span key={i} style={{
                                        fontSize: 13, fontWeight: 600, color: SCAN_ACCENT,
                                        background: `${SCAN_ACCENT}1a`, padding: '6px 12px', borderRadius: 100,
                                    }}>{tag}</span>
                                ))}
                            </div>
                            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--b-text-3)' }}>
                                {t.testimony.metadata}
                            </div>
                        </div>
                    </div>
                </section>
            );
        }

        // ==========================================================================
        // ScanEcosystem
        // ==========================================================================

        function ScanEcosystem({ t }) {
            const reveal = window.useReveal();
            const isMobile = window.useIsMobile();
            return (
                <section ref={reveal} style={{
                    padding: isMobile ? '56px 20px' : '120px 48px',
                    maxWidth: 1200, margin: '0 auto',
                }}>
                    <div className="reveal" style={{ textAlign: 'center', marginBottom: isMobile ? 32 : 48 }}>
                        <div style={{ ...window.eyebrowStyle, color: SCAN_ACCENT }}>{t.ecosystem.eyebrow}</div>
                        <h2 style={{
                            fontSize: isMobile ? 32 : 44, fontWeight: 900, letterSpacing: '-0.035em',
                            lineHeight: 1.05, margin: '0 0 12px', color: 'var(--b-text)',
                        }}>{t.ecosystem.title}</h2>
                        <p style={{ fontSize: 16, color: 'var(--b-text-2)', margin: 0, maxWidth: 520, marginLeft: 'auto', marginRight: 'auto' }}>{t.ecosystem.sub}</p>
                    </div>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
                        gap: isMobile ? 16 : 20,
                    }}>
                        {t.ecosystem.items.map((it, i) => {
                            const accent = window.ACCENTS[it.id].light;
                            return (
                                <a key={i} href={it.href} className={`reveal reveal-d${i + 1}`} style={{
                                    background: 'var(--b-bg-elevated)', borderRadius: 28,
                                    padding: isMobile ? 24 : 32,
                                    boxShadow: 'var(--emboss-soft)',
                                    border: `1px solid ${it.active ? accent + '55' : 'var(--b-border)'}`,
                                    display: 'flex', flexDirection: 'column', gap: 14,
                                    textDecoration: 'none',
                                    transition: 'transform 0.2s ease',
                                    position: 'relative',
                                }}
                                    onMouseEnter={(e) => { if (!it.active) e.currentTarget.style.transform = 'translateY(-3px)'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <div style={{ width: 12, height: 12, borderRadius: 6, background: accent }} />
                                        <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--b-text)', letterSpacing: '-0.01em' }}>{it.name}</div>
                                        {it.active && (
                                            <span style={{
                                                marginLeft: 'auto', fontSize: 11, fontWeight: 700,
                                                color: accent, letterSpacing: '0.08em', textTransform: 'uppercase',
                                            }}>Now</span>
                                        )}
                                    </div>
                                    <div style={{ fontSize: 15, color: 'var(--b-text-2)', lineHeight: 1.5 }}>{it.tagline}</div>
                                </a>
                            );
                        })}
                    </div>
                </section>
            );
        }

        // ==========================================================================
        // App
        // ==========================================================================

        const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
            "lang": "en",
            "theme": "auto"
        }/*EDITMODE-END*/;

        function App() {
            const [lang, setLang] = React.useState(TWEAK_DEFAULTS.lang);
            const [theme, setTheme] = React.useState(TWEAK_DEFAULTS.theme);

            React.useEffect(() => {
                const mq = window.matchMedia('(prefers-color-scheme: dark)');
                const apply = () => {
                    const effective = theme === 'auto' ? (mq.matches ? 'dark' : 'light') : theme;
                    document.documentElement.setAttribute('data-theme', effective);
                };
                apply();
                if (theme === 'auto') {
                    mq.addEventListener('change', apply);
                    return () => mq.removeEventListener('change', apply);
                }
            }, [theme]);

            React.useEffect(() => {
                document.documentElement.setAttribute('lang', lang);
            }, [lang]);

            const effectiveTheme = window.useTheme();
            const t = window.COPY[lang] || window.COPY.en;
            const scanT = SCAN_COPY[lang] || SCAN_COPY.en;

            // Note: images from legacy app
            const shotOrg = `images-bricks-scan/feature-${lang}-01.png`;
            const shotSearch = `images-bricks-scan/feature-${lang}-02.png`;
            const shotTools = `images-bricks-scan/feature-${lang}-06.png`;

            return (
                <div style={{ background: 'var(--b-bg)', minHeight: '100vh', overflow: 'hidden' }}>
                    <window.Header
                        t={t}
                        lang={lang}
                        currentProduct="scan"
                        cta={{
                            label: t.nav.download,
                            href: 'https://apps.apple.com/us/app/bricks-scan-scan-to-pdf/id6758148083'
                        }}
                    />

                    <main>
                        <ScanHero t={scanT} lang={lang} theme={effectiveTheme} />
                        <ScanFeatureSplit feature={scanT.feature_org} reverse={false} shotSrc={shotOrg} />
                        <ScanFeatureSplit feature={scanT.feature_search} reverse={true} shotSrc={shotSearch} />
                        <ScanFeatureSplit feature={scanT.feature_tools} reverse={false} shotSrc={shotTools} />
                        <ScanPillars t={scanT} />
                        <ScanTestimony t={scanT} />
                        <window.DownloadCTA t={t} variant="default" />
                        <ScanEcosystem t={scanT} />
                    </main>

                    <window.Footer t={t} lang={lang} setLang={setLang} theme={theme} setTheme={setTheme} />

                    {/* Tweaks Menu (hidden in production unless activated) */}
                    <window.useTweaks lang={lang} setLang={setLang} theme={theme} setTheme={setTheme} />
                </div>
            );
        }

        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(<App />);

"""

full_html = f"""<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <!-- SEO -->
    <title>Bricks Scan - Searchable PDF Scanner for iPhone, iPad, and Mac</title>
    <meta name="description" content="Scan documents, find them fast, and keep everything organized. Bricks Scan makes text searchable, gives every file a clear name, and organizes it on your device." />
    <meta name="keywords" content="pdf scanner, scan documents, offline scanner, ios scanner, apple" />
    <link rel="canonical" href="https://bricks.pe/scan.html" />

    <!-- Open Graph -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://bricks.pe/scan.html" />
    <meta property="og:title" content="Bricks Scan - Searchable PDF Scanner for iPhone, iPad, and Mac" />
    <meta property="og:description" content="Scan documents, find them fast, and keep everything organized. Bricks Scan makes text searchable, gives every file a clear name, and organizes it on your device." />
    <meta property="og:image" content="https://bricks.pe/images-bricks-scan/hero-video-img-en.png" />
    <meta name="twitter:card" content="summary_large_image" />

    <!-- Favicon & Styles -->
    <link rel="icon" href="favicon.ico" sizes="32x32" />
    <link rel="icon" type="image/png" href="images-bricks-scan/favicon-32x32.png" sizes="32x32" />
    <link rel="apple-touch-icon" href="images-bricks-scan/apple-touch-icon.png" />
    <link rel="manifest" href="site.webmanifest" />
    <meta name="theme-color" content="#00A6A1" />
    <link rel="stylesheet" href="styles.css" />

    <!-- React & Babel -->
    <script src="https://unpkg.com/react@18.3.1/umd/react.development.js" crossorigin="anonymous"></script>
    <script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js" crossorigin="anonymous"></script>
    <script src="https://unpkg.com/@babel/standalone@7.29.0/babel.min.js" crossorigin="anonymous"></script>

    <!-- Google Tag Manager -->
    <script>
        (function (w, d, s, l, i) {{
            w[l] = w[l] || [];
            w[l].push({{ "gtm.start": new Date().getTime(), event: "gtm.js" }});
            var f = d.getElementsByTagName(s)[0],
                j = d.createElement(s),
                dl = l != "dataLayer" ? "&l=" + l : "";
            j.async = true;
            j.src = "https://www.googletagmanager.com/gtm.js?id=" + i + dl;
            f.parentNode.insertBefore(j, f);
        }})(window, document, "script", "dataLayer", "GTM-P5P8LRC2");
    </script>
    <!-- End Google Tag Manager -->

    <!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-0NE96SRV4V"></script>
    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag() {{ dataLayer.push(arguments); }}
        gtag("js", new Date());
        gtag("config", "G-0NE96SRV4V");
    </script>

    <!-- Meta Pixel Code -->
    <script>
        !(function (f, b, e, v, n, t, s) {{
            if (f.fbq) return;
            n = f.fbq = function () {{
                n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
            }};
            if (!f._fbq) f._fbq = n;
            n.push = n;
            n.loaded = !0;
            n.version = "2.0";
            n.queue = [];
            t = b.createElement(e);
            t.async = !0;
            t.src = v;
            s = b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t, s);
        }})(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
        fbq("init", "1088148306858128");
        fbq("track", "PageView");
    </script>
    <noscript>
        <img height="1" width="1" style="display: none"
            src="https://www.facebook.com/tr?id=1088148306858128&ev=PageView&noscript=1" />
    </noscript>
    <!-- End Meta Pixel Code -->
</head>

<body>
    <!-- Google Tag Manager (noscript) -->
    <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-P5P8LRC2" height="0" width="0" style="display: none; visibility: hidden"></iframe></noscript>
    <!-- End Google Tag Manager (noscript) -->

    <div id="root"></div>

    <script type="text/babel">
{shared_jsx}
    </script>

    <script type="text/babel">
{scan_app_jsx}
    </script>
</body>
</html>"""

with open('scan.html', 'w') as f:
    f.write(full_html)
