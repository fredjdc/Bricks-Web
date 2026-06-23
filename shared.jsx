// Bricks Page — shared React/Babel module
// Loaded via <script type="text/babel" src="shared.jsx">
// Contains the cross-page copy dictionary, hooks, styles, and components
// used by every product page (leads, calc, future index).

// ==========================================================================
// COPY
// ==========================================================================

window.COPY = {
  en: {
    nav: { products: 'Products', philosophy: 'Philosophy', changelog: "What's new", download: 'Download' },
    hero: {
      eyebrow: 'A suite for real estate',
      title: ['Three focused tools.', 'One quiet suite.'],
      body: 'Scan, calculate, follow up. Without bloat, without accounts, without distractions.',
      cta: 'Explore the suite',
      secondary: 'See what changed',
      pickLabel: 'Pick a tool',
    },
    products: {
      scan: { name: 'Scan', tagline: 'Documents, organized.', pitch: 'Scan, read, file.' },
      calc: { name: 'Calc', tagline: 'Mortgages, instantly.', pitch: 'Model a deal.' },
      leads: { name: 'Leads', tagline: 'A calm CRM.', pitch: 'Stay on follow-up.' },
    },
    cta: {
      title: ['Three tools.', 'One quiet suite.'],
      sub: 'Free to try. No account. Native on Apple.',
      primary: 'Download on the App Store',
    },
    footer: {
      tag: 'Focused apps for real estate agents on Apple.',
      sections: [
        { h: 'Apps', l: [{ label: 'Bricks Scan', href: 'scan.html' }, { label: 'Bricks Calc', href: 'calc.html' }, { label: 'Bricks Leads', href: 'leads.html' }] },
        { h: 'Business', l: [{ label: 'About', href: 'about.html' }, { label: 'Purchase guide', href: 'purchase-guide-01.html' }, { label: 'hello@bricks.pe', href: 'mailto:hello@bricks.pe' }] },
        { h: 'Support', l: [{ label: 'Contact', href: 'support.html' }, { label: 'Vote on features', href: 'https://bricksapps.userjot.com' }, { label: 'Guides', href: 'help.html' }, { label: 'Survey', href: 'survey.html' }] },
      ],
      legal: [{ label: 'Privacy Policy', href: 'privacy.html' }, { label: 'Terms of Service', href: 'terms.html' }],
      copyright: '\u00a9 2026 Bricks Apps. Made with care.',
      language: 'Language', appearance: 'Appearance',
      light: 'Light', dark: 'Dark', auto: 'System',
    },
  },
  es: {
    nav: { products: 'Productos', philosophy: 'Filosof\u00eda', changelog: 'Novedades', download: 'Descargar' },
    hero: {
      eyebrow: 'Una suite para bienes ra\u00edces',
      title: ['Tres herramientas.', 'Una suite tranquila.'],
      body: 'Escanea, calcula, da seguimiento. Sin relleno, sin cuentas, sin distracciones.',
      cta: 'Explorar la suite',
      secondary: 'Ver novedades',
      pickLabel: 'Elige una herramienta',
    },
    products: {
      scan: { name: 'Scan', tagline: 'Documentos ordenados.', pitch: 'Escanea, lee, archiva.' },
      calc: { name: 'Calc', tagline: 'Hipotecas al instante.', pitch: 'Modela una oferta.' },
      leads: { name: 'Leads', tagline: 'Un CRM tranquilo.', pitch: 'Mant\u00e9n el seguimiento.' },
    },
    cta: {
      title: ['Tres herramientas.', 'Una suite tranquila.'],
      sub: 'Gratis para empezar. Sin cuenta. Nativa en Apple.',
      primary: 'Descargar en el App Store',
    },
    footer: {
      tag: 'Apps enfocadas para agentes inmobiliarios en Apple.',
      sections: [
        { h: 'Apps', l: [{ label: 'Bricks Scan', href: 'scan.html' }, { label: 'Bricks Calc', href: 'calc.html' }, { label: 'Bricks Leads', href: 'leads.html' }] },
        { h: 'Empresa', l: [{ label: 'Sobre nosotros', href: 'about.html' }, { label: 'Gu\u00eda de compra', href: 'purchase-guide-01.html' }, { label: 'hello@bricks.pe', href: 'mailto:hello@bricks.pe' }] },
        { h: 'Soporte', l: [{ label: 'Contacto', href: 'support.html' }, { label: 'Votar funciones', href: 'https://bricksapps.userjot.com' }, { label: 'Gu\u00edas', href: 'help.html' }, { label: 'Encuesta', href: 'survey.html' }] },
      ],
      legal: [{ label: 'Pol\u00edtica de privacidad', href: 'privacy.html' }, { label: 'T\u00e9rminos del servicio', href: 'terms.html' }],
      copyright: '\u00a9 2026 Bricks Apps. Hecho con cuidado.',
      language: 'Idioma', appearance: 'Apariencia',
      light: 'Claro', dark: 'Oscuro', auto: 'Sistema',
    },
  },
};

window.ACCENTS = {
  scan: { light: '#00A6A1', vivid: '#00C7B2' },
  calc: { light: '#007AFF', vivid: '#2E90FF' },
  leads: { light: '#FF9500', vivid: '#FFAD33' },
};

window.eyebrowStyle = {
  fontSize: 12, fontWeight: 700, color: 'var(--b-text-3)',
  letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14,
};

window.h2Big = {
  fontSize: 56, fontWeight: 900, letterSpacing: '-0.035em', lineHeight: 1.02,
  margin: '0 0 24px', color: 'var(--b-text)',
};

window.leadP = {
  fontSize: 18, lineHeight: 1.6, color: 'var(--b-text-2)', margin: 0, maxWidth: 520,
};


// ==========================================================================
// Hooks + utilities
// ==========================================================================

window.useReveal = function useReveal() {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    el.querySelectorAll('.reveal').forEach(n => io.observe(n));
    return () => io.disconnect();
  }, []);
  return ref;
};

window.useCountUp = function useCountUp(target, when, durationMs = 1400) {
  const [val, setVal] = React.useState(0);
  React.useEffect(() => {
    if (!when) return;
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setVal(Math.floor(eased * target));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [when, target]);
  return val;
};

window.fmtNum = function fmtNum(n) {
  return n.toLocaleString('en-US');
};

window.smoothScrollTo = function smoothScrollTo(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const y = el.getBoundingClientRect().top + window.scrollY - 24;
  window.scrollTo({ top: y, behavior: 'smooth' });
};

window.useScrollDirection = function useScrollDirection() {
  const [state, setState] = React.useState({ dir: 'up', atTop: true });
  React.useEffect(() => {
    let last = window.scrollY;
    let lastDir = 'up';
    let ticking = false;
    const THRESHOLD = 10;
    const TOP_ZONE = 80;
    const update = () => {
      ticking = false;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const y = Math.max(0, Math.min(window.scrollY, max));
      const atTop = y < TOP_ZONE;
      let dir = lastDir;
      if (atTop) {
        dir = 'up';
      } else if (y > last + THRESHOLD) {
        dir = 'down';
        last = y;
      } else if (y < last - THRESHOLD) {
        dir = 'up';
        last = y;
      }
      setState((prev) =>
        prev.dir === dir && prev.atTop === atTop ? prev : { dir, atTop }
      );
      lastDir = dir;
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return state;
};

window.useIsMobile = function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = React.useState(() => window.innerWidth <= breakpoint);
  React.useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`);
    setIsMobile(mq.matches);
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [breakpoint]);
  return isMobile;
};

window.useTheme = function useTheme() {
  const [theme, setTheme] = React.useState(
    () => document.documentElement.getAttribute('data-theme') || 'light'
  );
  React.useEffect(() => {
    const observer = new MutationObserver(() => {
      setTheme(document.documentElement.getAttribute('data-theme') || 'light');
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);
  return theme;
};


// ==========================================================================
// ThemeLogo
// ==========================================================================

window.ThemeLogo = function ThemeLogo({ height = 24, assetPrefix = "" }) {
  return (
    <React.Fragment>
      <img src={`${assetPrefix}images/bricks-dark-logo.svg`} alt="Bricks" className="logo-light-theme" style={{ height }} />
      <img src={`${assetPrefix}images/bricks-light-logo.svg`} alt="Bricks" className="logo-dark-theme" style={{ height }} />
    </React.Fragment>
  );
};


// ==========================================================================
// Header
//
// Props:
//   t, lang          — copy + current language
//   currentProduct   — string id of product page we're on (hides section nav)
//   cta              — optional { label, href, onClick } overriding the
//                      default Download dropdown. Used by leads.html for
//                      the "Join the beta" button.
// ==========================================================================

window.Header = function Header({ t, lang, currentProduct, cta }) {
  const { dir, atTop } = window.useScrollDirection();
  const isMobile = window.useIsMobile();
  const hidden = dir === 'down' && !atTop;
  const [dlOpen, setDlOpen] = React.useState(false);
  const dlRef = React.useRef(null);

  React.useEffect(() => {
    if (!dlOpen) return;
    const handler = (e) => {
      if (dlRef.current && !dlRef.current.contains(e.target)) setDlOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [dlOpen]);

  const downloadItems = [
    { label: 'Bricks Calc', href: 'https://apps.apple.com/us/app/bricks-calc-loan-calculator/id6754506837', accent: window.ACCENTS.calc.light, external: true },
    { label: 'Bricks Scan', href: 'https://apps.apple.com/us/app/bricks-scan-scan-to-pdf/id6758148083', accent: window.ACCENTS.scan.light, external: true },
    { label: 'Bricks Leads', href: 'leads.html', accent: window.ACCENTS.leads.light, external: false },
  ];

  const links = currentProduct ? [] : [
    { id: 'product-scan', label: t.nav.products },
    { id: 'philosophy', label: t.nav.philosophy },
    { id: 'changelog', label: t.nav.changelog },
  ];

  return (
    <header style={{
      position: 'fixed', top: isMobile ? 12 : 24,
      left: isMobile ? 16 : 48, right: isMobile ? 16 : 48, zIndex: 100,
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: isMobile ? '10px 10px 10px 18px' : '12px 14px 12px 24px',
      background: 'color-mix(in srgb, var(--b-bg-elevated) 65%, transparent)',
      backdropFilter: 'blur(20px) saturate(180%)',
      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      borderRadius: 100,
      border: '1px solid var(--b-border)',
      boxShadow: '0 8px 32px rgba(11,15,20,0.06)',
      transform: hidden ? 'translateY(-130%)' : 'translateY(0)',
      opacity: hidden ? 0 : 1,
      transition: 'transform 0.45s cubic-bezier(0.16,1,0.3,1), opacity 0.35s ease',
    }}>
      <a href={currentProduct ? 'index.html' : '#top'}
        onClick={(e) => { if (!currentProduct) { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); } }}
        style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <window.ThemeLogo height={24} />
      </a>

      <nav style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        {!isMobile && links.map(link => (
          <a key={link.id} href={'#' + link.id}
            onClick={(e) => { e.preventDefault(); window.smoothScrollTo(link.id); }}
            style={{
              fontSize: 14, fontWeight: 500, color: 'var(--b-text)',
              padding: '8px 14px', borderRadius: 100,
              letterSpacing: '-0.01em', opacity: 0.8,
              transition: 'opacity 0.2s, background 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
            onMouseLeave={(e) => e.currentTarget.style.opacity = 0.8}
          >{link.label}</a>
        ))}

        {cta ? (
          <a href={cta.href}
            onClick={(e) => {
              if (cta.href && cta.href.startsWith('#')) {
                e.preventDefault();
                window.smoothScrollTo(cta.href.slice(1));
              }
              if (cta.onClick) cta.onClick(e);
            }}
            style={{
              marginLeft: isMobile ? 0 : 6,
              padding: isMobile ? '9px 16px' : '10px 18px', borderRadius: 100,
              background: 'var(--b-text)', color: 'var(--b-bg)',
              border: 'none', fontSize: 14, fontWeight: 600,
              letterSpacing: '-0.01em',
              boxShadow: '0 8px 20px rgba(11,15,20,0.18)',
              transition: 'transform 0.15s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
          >{cta.label}</a>
        ) : (
          <div ref={dlRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setDlOpen(v => !v)}
              style={{
                marginLeft: isMobile ? 0 : 6,
                padding: isMobile ? '9px 16px' : '10px 18px', borderRadius: 100,
                background: 'var(--b-text)', color: 'var(--b-bg)',
                border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                fontFamily: 'inherit', letterSpacing: '-0.01em',
                display: 'inline-flex', alignItems: 'center', gap: 6,
                boxShadow: '0 8px 20px rgba(11,15,20,0.18)',
                transition: 'transform 0.15s ease, box-shadow 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              {t.nav.download}
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{
                transform: dlOpen ? 'rotate(180deg)' : 'rotate(0)',
                transition: 'transform 0.25s ease',
              }}>
                <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <div style={{
              position: 'absolute', top: 'calc(100% + 10px)', right: 0,
              minWidth: 220,
              background: 'color-mix(in srgb, var(--b-bg-elevated) 85%, transparent)',
              backdropFilter: 'blur(24px) saturate(180%)',
              WebkitBackdropFilter: 'blur(24px) saturate(180%)',
              borderRadius: 20, border: '1px solid var(--b-border)',
              boxShadow: '0 16px 48px rgba(11,15,20,0.16)',
              padding: 8,
              opacity: dlOpen ? 1 : 0,
              transform: dlOpen ? 'translateY(0) scale(1)' : 'translateY(-8px) scale(0.96)',
              pointerEvents: dlOpen ? 'auto' : 'none',
              transition: 'opacity 0.25s ease, transform 0.3s cubic-bezier(0.16,1,0.3,1)',
            }}>
              {downloadItems.map((item, i) => (
                <a key={i} href={item.href}
                  target={item.external ? '_blank' : undefined}
                  rel={item.external ? 'noopener noreferrer' : undefined}
                  onClick={() => setDlOpen(false)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 16px', borderRadius: 14,
                    fontSize: 14, fontWeight: 500, color: 'var(--b-text)',
                    transition: 'background 0.15s ease',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--b-bg)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ width: 8, height: 8, borderRadius: 4, background: item.accent, flexShrink: 0 }} />
                  <span style={{ flex: 1 }}>{item.label}</span>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ opacity: 0.4 }}>
                    <path d={item.external ? 'M4 2h6v6M10 2L3 9' : 'M4 2l5 4-5 4'}
                      stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              ))}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};


// ==========================================================================
// ScreenshotPhone — frameless parallax phone
// ==========================================================================

window.ScreenshotPhone = function ScreenshotPhone({ src, alt, accent, tilt = 0 }) {
  const ref = React.useRef(null);
  const [y, setY] = React.useState(0);
  const isMobile = window.useIsMobile();

  React.useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const el = ref.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const vh = window.innerHeight;
        const progress = (vh * 0.5 - (rect.top + rect.height * 0.5)) / vh;
        setY(Math.max(-1, Math.min(1, progress)));
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const translateY = -y * 40;

  return (
    <div ref={ref} style={{
      position: 'relative',
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      perspective: 1800,
      minHeight: isMobile ? 360 : 640,
    }}>
      <div aria-hidden="true" style={{
        position: 'absolute', inset: '10% 15%',
        background: `radial-gradient(ellipse at 50% 55%, ${accent}22 0%, ${accent}10 35%, transparent 70%)`,
        filter: 'blur(40px)',
        pointerEvents: 'none',
        transform: `translateY(${translateY * 0.5}px)`,
        transition: 'transform 0.05s linear',
      }} />
      <img
        src={src + (window.location.search || '')}
        alt={alt}
        style={{
          width: isMobile ? '100%' : 340,
          maxWidth: isMobile ? 280 : 'none',
          height: 'auto',
          display: 'block',
          borderRadius: 48,
          transform: `translateY(${translateY}px) rotate(${tilt}deg)`,
          transition: 'transform 0.05s linear',
          boxShadow: '0 2px 4px rgba(0,0,0,0.04), 0 12px 24px rgba(0,0,0,0.08), 0 40px 80px rgba(0,0,0,0.12), 0 80px 140px rgba(0,0,0,0.14)',
          willChange: 'transform',
        }}
      />
    </div>
  );
};


// ==========================================================================
// MoreInfoLink + Bullet
// ==========================================================================

window.MoreInfoLink = function MoreInfoLink({ href, accent, label }) {
  const [hover, setHover] = React.useState(false);
  const fullHref = href + (typeof window !== 'undefined' ? (window.location.search || '') : '');
  return (
    <a href={fullHref}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 10,
        marginTop: 40, padding: '12px 0',
        fontSize: 15, fontWeight: 600,
        color: accent, letterSpacing: '-0.01em',
        borderBottom: '1px solid ' + accent + (hover ? 'CC' : '44'),
        transition: 'border-color 0.25s ease',
        alignSelf: 'flex-start', width: 'fit-content',
      }}>
      <span>{label}</span>
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{
        transform: hover ? 'translateX(4px)' : 'translateX(0)',
        transition: 'transform 0.25s cubic-bezier(0.2,1,0.3,1)',
      }}>
        <path d="M2.5 7h9M8 3.5L11.5 7 8 10.5" stroke={accent} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </a>
  );
};

window.Bullet = function Bullet({ accent, t, d }) {
  return (
    <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
      <div style={{ width: 8, height: 8, borderRadius: 4, background: accent, marginTop: 9, flexShrink: 0 }} />
      <div>
        <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--b-text)', marginBottom: 3 }}>{t}</div>
        <div style={{ fontSize: 15, color: 'var(--b-text-2)', lineHeight: 1.5 }}>{d}</div>
      </div>
    </div>
  );
};


// ==========================================================================
// DownloadCTA
//
// Props:
//   t        — shared copy
//   variant  — 'default' (App Store buttons) | 'beta' (single "Join the
//              beta" button that scrolls to #join-beta)
//   betaCopy — when variant='beta', required: { title, sub, primary }
// ==========================================================================

window.DownloadCTA = function DownloadCTA({ t, variant = 'default', betaCopy, accent }) {
  const reveal = window.useReveal();
  const isMobile = window.useIsMobile();
  const [hovered, setHovered] = React.useState(null);

  const isBeta = variant === 'beta';
  const title = isBeta ? betaCopy.title : t.cta.title;
  const sub = isBeta ? betaCopy.sub : t.cta.sub;

  const apps = [
    { label: 'Bricks Calc', href: 'https://apps.apple.com/us/app/bricks-calc-loan-calculator/id6754506837', accent: window.ACCENTS.calc.light, external: true },
    { label: 'Bricks Scan', href: 'https://apps.apple.com/us/app/bricks-scan-scan-to-pdf/id6758148083', accent: window.ACCENTS.scan.light, external: true },
    { label: 'Bricks Leads', href: 'leads.html', accent: window.ACCENTS.leads.light, external: false },
  ];

  return (
    <section id="download" ref={reveal} style={{
      padding: isMobile ? '32px 20px 64px' : '60px 48px 120px', maxWidth: 1200, margin: '0 auto',
    }}>
      <div className="reveal" style={{
        background: 'var(--b-text)', borderRadius: isMobile ? 32 : 48,
        padding: isMobile ? '56px 24px' : '96px 64px',
        textAlign: 'center', position: 'relative', overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(11,15,20,0.25)',
      }}>
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(circle at 20% 10%, rgba(0,166,161,0.1), transparent 55%), radial-gradient(circle at 80% 90%, rgba(255,149,0,0.08), transparent 55%)',
        }} />
        <h2 style={{
          fontSize: isMobile ? 40 : 64, fontWeight: 900, letterSpacing: '-0.035em',
          lineHeight: 1.02, margin: '0 0 20px', color: 'var(--b-bg)', position: 'relative',
        }}>
          {title[0]}<br />
          <span style={{ opacity: 0.55 }}>{title[1]}</span>
        </h2>
        <p style={{
          fontSize: isMobile ? 16 : 18, color: 'var(--b-bg)', opacity: 0.7,
          lineHeight: 1.6, margin: '0 auto 40px', maxWidth: 520, position: 'relative',
        }}>
          {sub}
        </p>

        {isBeta ? (
          <div style={{ position: 'relative' }}>
            <a href="#join-beta"
              onClick={(e) => { e.preventDefault(); window.smoothScrollTo('join-beta'); }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                padding: isMobile ? '14px 26px' : '16px 32px',
                background: accent || window.ACCENTS.leads.light,
                color: '#fff', textDecoration: 'none',
                border: 'none', borderRadius: 100, fontSize: 15, fontWeight: 600,
                fontFamily: 'inherit', letterSpacing: '-0.01em',
                boxShadow: '0 12px 28px rgba(0,0,0,0.25)',
                transition: 'transform 0.15s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              {betaCopy.primary}
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2.5 7h9M8 3.5L11.5 7 8 10.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>
        ) : (
          <div style={{ position: 'relative', display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            {apps.map((app, i) => (
              <a key={i} href={app.href}
                target={app.external ? '_blank' : undefined}
                rel={app.external ? 'noopener noreferrer' : undefined}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 10,
                  padding: isMobile ? '14px 22px' : '16px 28px',
                  background: hovered === i ? app.accent : 'var(--b-bg)',
                  color: hovered === i ? '#fff' : 'var(--b-text)',
                  textDecoration: 'none',
                  border: 'none', borderRadius: 100, fontSize: 15, fontWeight: 600,
                  fontFamily: 'inherit', letterSpacing: '-0.01em',
                  boxShadow: '0 12px 28px rgba(0,0,0,0.25)',
                  transition: 'background 0.25s ease, color 0.25s ease, transform 0.15s ease',
                  transform: hovered === i ? 'translateY(-2px)' : 'translateY(0)',
                }}
              >
                <div style={{ width: 8, height: 8, borderRadius: 4, background: hovered === i ? 'rgba(255,255,255,0.6)' : app.accent, flexShrink: 0, transition: 'background 0.25s ease' }} />
                {app.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};


// ==========================================================================
// Footer
// ==========================================================================

window.Footer = function Footer({ t, lang, setLang, theme, setTheme, assetPrefix = "" }) {
  const isMobile = window.useIsMobile();
  return (
    <footer style={{
      padding: isMobile ? '48px 20px 32px' : '80px 48px 48px', borderTop: '1px solid var(--b-border)',
      background: 'var(--b-bg)',
    }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1.4fr 1fr 1fr 1fr',
        gap: isMobile ? 32 : 48,
        marginBottom: isMobile ? 40 : 56,
      }}>
        <div style={{ gridColumn: isMobile ? '1 / -1' : undefined }}>
          <window.ThemeLogo assetPrefix={assetPrefix} />
          <p style={{ fontSize: 14, color: 'var(--b-text-2)', lineHeight: 1.6, margin: '16px 0 24px', maxWidth: 300 }}>
            {t.footer.tag}
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            {[
              { kind: 'instagram', href: 'https://www.instagram.com/hellobricksapps/' },
              { kind: 'x', href: 'https://x.com/hellobricksapps' },
              { kind: 'linkedin', href: 'https://www.linkedin.com/company/bricksapps/' },
            ].map(s => (
              <a key={s.kind} href={s.href} target="_blank" rel="noopener noreferrer" style={{
                width: 36, height: 36, borderRadius: '50%', background: 'var(--b-bg-elevated)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: 'var(--emboss-soft)', color: 'var(--b-text-2)',
                transition: 'color 0.2s',
              }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--b-text)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--b-text-2)'}>
                <SocialIcon kind={s.kind} />
              </a>
            ))}
          </div>
        </div>
        {t.footer.sections.map((s, i) => (
          <div key={i}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--b-text-3)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 18 }}>{s.h}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {s.l.map((l, j) => (
                <a key={j} href={l.href} style={{ fontSize: 14, color: 'var(--b-text)', opacity: 0.85 }}>{l.label}</a>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{
        maxWidth: 1200, margin: '0 auto',
        padding: isMobile ? '24px 0' : '32px 0', borderTop: '1px solid var(--b-border)',
        display: 'flex', gap: isMobile ? 20 : 32, flexWrap: 'wrap', alignItems: 'center',
      }}>
        <ToggleGroup label={t.footer.language} options={[{ v: 'en', l: 'EN' }, { v: 'es', l: 'ES' }]} value={lang} setValue={setLang} />
        <ToggleGroup label={t.footer.appearance} options={[{ v: 'auto', l: t.footer.auto }, { v: 'light', l: t.footer.light }, { v: 'dark', l: t.footer.dark }]} value={theme} setValue={setTheme} />
      </div>

      <div style={{
        maxWidth: 1200, margin: '24px auto 0',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: 16,
      }}>
        <div style={{ fontSize: 13, color: 'var(--b-text-2)' }}>{t.footer.copyright}</div>
        <div style={{ display: 'flex', gap: 20 }}>
          {t.footer.legal.map((l, i) => (
            <a key={i} href={l.href} style={{ fontSize: 13, color: 'var(--b-text-2)' }}>{l.label}</a>
          ))}
        </div>
      </div>
    </footer>
  );
};

function ToggleGroup({ label, options, value, setValue }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
      <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--b-text-3)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</div>
      <div style={{ display: 'inline-flex', gap: 2 }}>
        {options.map((o, i) => (
          <React.Fragment key={o.v}>
            {i > 0 && <span style={{ color: 'var(--b-text-3)', fontSize: 12, alignSelf: 'center', opacity: 0.5 }}>·</span>}
            <button onClick={() => setValue(o.v)}
              style={{
                border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit',
                padding: '2px 6px', fontSize: 12,
                fontWeight: value === o.v ? 600 : 400,
                color: value === o.v ? 'var(--b-text)' : 'var(--b-text-2)',
                opacity: value === o.v ? 1 : 0.7,
                transition: 'opacity 0.2s ease, color 0.2s ease',
              }}
              onMouseEnter={(e) => { if (value !== o.v) e.currentTarget.style.opacity = 1; }}
              onMouseLeave={(e) => { if (value !== o.v) e.currentTarget.style.opacity = 0.7; }}
            >{o.l}</button>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

function SocialIcon({ kind }) {
  const s = { stroke: 'currentColor', fill: 'none', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' };
  if (kind === 'instagram') return (
    <svg width="15" height="15" viewBox="0 0 20 20"><rect x="3" y="3" width="14" height="14" rx="4" {...s} /><circle cx="10" cy="10" r="3.2" {...s} /><circle cx="14.3" cy="5.7" r="0.5" fill="currentColor" /></svg>
  );
  if (kind === 'x') return (
    <svg width="13" height="13" viewBox="0 0 20 20" fill="currentColor"><path d="M15.2 2h2.8l-6.1 7 7.2 9h-5.6l-4.4-5.8L4 18H1.2l6.5-7.5L1 2h5.7l4 5.3zm-1 14.6h1.5L5.9 3.3H4.3z" /></svg>
  );
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path d="M5.4 7.5h2.4v8.6H5.4zM6.6 3.5c-.8 0-1.4.6-1.4 1.4s.6 1.4 1.4 1.4 1.4-.6 1.4-1.4-.6-1.4-1.4-1.4zM9.4 7.5h2.3v1.2c.3-.6 1.1-1.3 2.3-1.3 2.4 0 2.9 1.6 2.9 3.7v5h-2.4v-4.4c0-1-.02-2.4-1.5-2.4-1.5 0-1.7 1.2-1.7 2.3v4.5H9.4z" /></svg>
  );
}


// ==========================================================================
// Tweaks (edit-mode toolbar)
// ==========================================================================

window.useTweaks = function useTweaks({ lang, setLang, theme, setTheme }) {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const handler = (e) => {
      const d = e.data || {};
      if (d.type === '__activate_edit_mode') setVisible(true);
      if (d.type === '__deactivate_edit_mode') setVisible(false);
    };
    window.addEventListener('message', handler);
    window.parent.postMessage({ type: '__edit_mode_available' }, '*');
    return () => window.removeEventListener('message', handler);
  }, []);

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed', right: 24, bottom: 24, zIndex: 200,
      background: 'var(--b-bg-elevated)', borderRadius: 24,
      boxShadow: '0 12px 40px rgba(0,0,0,0.18), var(--emboss-soft)',
      padding: 20, minWidth: 260,
      border: '1px solid var(--b-border)',
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--b-text-3)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14 }}>Tweaks</div>
      <TweakRow label="Language">
        {['en', 'es'].map(v => (
          <button key={v} onClick={() => { setLang(v); tweakPersist({ lang: v }); }} style={tweakBtn(lang === v)}>{v.toUpperCase()}</button>
        ))}
      </TweakRow>
      <TweakRow label="Appearance">
        {[['auto', 'System'], ['light', 'Light'], ['dark', 'Dark']].map(([v, l]) => (
          <button key={v} onClick={() => { setTheme(v); tweakPersist({ theme: v }); }} style={tweakBtn(theme === v)}>{l}</button>
        ))}
      </TweakRow>
    </div>
  );
};

function tweakPersist(edits) {
  window.parent.postMessage({ type: '__edit_mode_set_keys', edits }, '*');
}
function TweakRow({ label, children }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 11, color: 'var(--b-text-2)', marginBottom: 6 }}>{label}</div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{children}</div>
    </div>
  );
}
function tweakBtn(active) {
  return {
    padding: '6px 12px', borderRadius: 100, border: 'none', cursor: 'pointer',
    fontSize: 12, fontWeight: 600, fontFamily: 'inherit',
    background: active ? 'var(--b-text)' : 'var(--b-bg)',
    color: active ? 'var(--b-bg)' : 'var(--b-text)',
    boxShadow: active ? 'none' : 'var(--emboss-soft)',
  };
}
