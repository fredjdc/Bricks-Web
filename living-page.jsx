window.BRICKS_LIVING_PUBLIC_ASSET = function BRICKS_LIVING_PUBLIC_ASSET(path) {
  return `./images-bricks-living/${path}`;
};

window.BRICKS_LIVING_PUBLIC_PORTAL_URL = ["", "localhost", "127.0.0.1"].includes(window.location.hostname)
  ? "./living/portal.html#login"
  : "./living/portal.html#login";

window.LivingPublicIcon = function LivingPublicIcon({ name, size = 22 }) {
  const assets = {
    building: "./images-bricks-leads/icon-context.svg",
    chart: "./images-bricks-calc/icon-spreadsheets.svg",
    chat: "./images-bricks-leads/icon-follow-up.svg",
    check: "./images-bricks-calc/icon-compare.svg",
    lock: "./images-bricks-calc/icon-adjust.svg",
    people: "./images-bricks-leads/icon-context.svg",
    receipt: "./images-bricks-leads/icon-capture.svg",
    workflow: "./images-bricks-calc/icon-compare.svg",
  };
  const iconPath = assets[name] || assets.building;

  return (
    <span
      className="living-icon"
      style={{ width: size, height: size, WebkitMaskImage: `url(${iconPath})`, maskImage: `url(${iconPath})` }}
      aria-hidden="true"
    />
  );
};

window.LivingPublicSectionTitle = function LivingPublicSectionTitle({ eyebrow, title, body, icon }) {
  return (
    <div className="living-section-title living-public-section-title">
      <div className="living-section-heading">
        {icon ? <span className="living-section-heading-icon"><window.LivingPublicIcon name={icon} /></span> : null}
        <div className="living-eyebrow">{eyebrow}</div>
      </div>
      <h2>{title}</h2>
      {body ? <p>{body}</p> : null}
    </div>
  );
};

window.LivingPublicMetricCard = function LivingPublicMetricCard({ label, value, detail, icon }) {
  return (
    <article className="living-card living-metric-card">
      <div className="living-card-header-row">
        <div className="living-card-label">{label}</div>
        <div className="living-card-icon">{icon}</div>
      </div>
      <div className="living-metric-value">{value}</div>
      <div className="living-card-detail">{detail}</div>
    </article>
  );
};

window.LivingPublicHeaderStandalone = function LivingPublicHeaderStandalone() {
  const { dir, atTop } = window.useScrollDirection();
  const isMobile = window.useIsMobile();
  const hidden = dir === "down" && !atTop;
  const links = [
    { id: "landing/workflow", label: "Operación" },
    { id: "landing/whatsapp", label: "WhatsApp" },
    { id: "landing/roles", label: "Roles" },
    { id: "landing/reportes", label: "Métricas" },
  ];

  return (
    <header style={{
      position: 'fixed', top: isMobile ? 12 : 24, left: isMobile ? 16 : 48, right: isMobile ? 16 : 48, zIndex: 100,
      display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: isMobile ? '10px 10px 10px 18px' : '12px 14px 12px 24px',
      background: 'color-mix(in srgb, var(--b-bg-elevated) 65%, transparent)', backdropFilter: 'blur(20px) saturate(180%)',
      WebkitBackdropFilter: 'blur(20px) saturate(180%)', borderRadius: 100, border: '1px solid var(--b-border)',
      boxShadow: '0 8px 32px rgba(11,15,20,0.06)', transform: hidden ? 'translateY(-130%)' : 'translateY(0)',
      opacity: hidden ? 0 : 1, transition: 'transform 0.45s cubic-bezier(0.16,1,0.3,1), opacity 0.35s ease',
    }}>
      <a href="#top" onClick={(event) => { event.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <window.ThemeLogo height={24} />
      </a>

      <nav style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        {!isMobile ? links.map(link => (
          <a key={link.id} href={`#${link.id}`} onClick={(event) => { event.preventDefault(); window.smoothScrollTo(link.id); }} style={{ fontSize: 14, fontWeight: 500, color: 'var(--b-text)', padding: '8px 14px', borderRadius: 100, letterSpacing: '-0.01em', opacity: 0.8, transition: 'opacity 0.2s, background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.opacity = 1} onMouseLeave={(e) => e.currentTarget.style.opacity = 0.8}>{link.label}</a>
        )) : null}

        <a href={window.BRICKS_LIVING_PUBLIC_PORTAL_URL} style={{ marginLeft: isMobile ? 0 : 6, padding: isMobile ? '9px 16px' : '10px 18px', borderRadius: 100, background: 'var(--b-text)', color: 'var(--b-bg)', border: 'none', fontSize: 14, fontWeight: 600, letterSpacing: '-0.01em', boxShadow: '0 8px 20px rgba(11,15,20,0.18)', transition: 'transform 0.15s ease' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}>Entrar al portal</a>
      </nav>
    </header>
  );
};

window.LivingStandalonePage = function LivingStandalonePage() {
  const metrics = [
    {
      label: "Reservas este mes",
      value: "113",
      detail: "Terraza, BBQ, salón y coworking",
      icon: <window.LivingPublicIcon name="building" size={20} />
    },
    {
      label: "Pagos verificados",
      value: "S/ 6,320",
      detail: "Con comprobante por WhatsApp",
      icon: <window.LivingPublicIcon name="receipt" size={20} />
    },
    {
      label: "Áreas configuradas",
      value: "5",
      detail: "Gimnasio, Terraza, BBQ y más",
      icon: <window.LivingPublicIcon name="workflow" size={20} />
    },
    {
      label: "Roles operativos",
      value: "6",
      detail: "Admin, seguridad, limpieza y más",
      icon: <window.LivingPublicIcon name="people" size={20} />
    },
  ];

  const roleCards = [
    ["Super Admin", "Control global de edificios, plantillas, integraciones de WhatsApp y suscripciones."],
    ["Admin edificio", "Gestión total del dashboard, reservas, validación de pagos y reportes de caja."],
    ["Asistente", "Atención del flujo operativo diario, soporte a residentes y control de agenda."],
    ["Seguridad", "Consulta de reservas del día, control de ingresos de invitados y registro de incidentes."],
    ["Limpieza", "Tareas de alistamiento y cierre de áreas, con checklist digital en tiempo real."],
    ["Junta Directiva", "Monitoreo financiero, auditoría de depósitos y reportes mensuales de gestión."],
  ];

  const areaStats = [
    "Terraza: 28 reservas",
    "Salón de eventos: 24 reservas",
    "Zona BBQ: 22 reservas",
    "Coworking: 21 reservas",
    "Gimnasio: 18 reservas",
  ];

  return (
    <div className="living-public">
      <div className="living-public-shell">
        <window.LivingPublicHeaderStandalone />

        <main className="living-public-main">
          <section className="living-hero">
            <div className="living-hero-copy">
              <div className="living-eyebrow-container">
                <span className="living-hero-badge"><window.LivingPublicIcon name="building" size={14} /> Operación residencial</span>
                <span className="living-eyebrow">Bricks Living</span>
              </div>
              <h1>Reservas ordenadas. Operación bajo control.</h1>
              <p>
                Centraliza reservas, aprobaciones, pagos, accesos y limpieza en un flujo claro para administración, residentes y equipo operativo.
              </p>
              <div className="living-hero-actions">
                <a className="living-button living-button-primary" href={window.BRICKS_LIVING_PUBLIC_PORTAL_URL}>Entrar al portal</a>
                <a className="living-button living-button-secondary" href="#landing/workflow">Ver flujo paso a paso</a>
              </div>
              <div className="living-inline-note">
                Piloto: Edificio Torres del Parque, Miraflores
              </div>
            </div>

            <div className="living-hero-visual">
              <div className="browser-mockup">
                <div className="browser-header">
                  <span className="browser-dot red"></span>
                  <span className="browser-dot yellow"></span>
                  <span className="browser-dot green"></span>
                  <div className="browser-address">{window.BRICKS_LIVING_PUBLIC_PORTAL_URL.replace(/^https?:\/\//, "")}</div>
                </div>
                <img src={window.BRICKS_LIVING_PUBLIC_ASSET("bricks-living-hero.png")} alt="Bricks Living Portal Dashboard" className="browser-image" />
              </div>
            </div>
          </section>

          <section className="living-grid living-kpis">
            {metrics.map((item) => <window.LivingPublicMetricCard key={item.label} {...item} />)}
          </section>

          <section className="living-story-section" id="landing/workflow">
            <window.LivingPublicSectionTitle
              eyebrow="Flujo principal"
              icon="workflow"
              title="El ciclo operativo resuelto de extremo a extremo"
              body="Desde la solicitud por WhatsApp hasta reportes claros para administración y junta."
            />
            <div className="living-timeline">
              {[
                ["Solicitud", "El residente reserva en segundos vía WhatsApp."],
                ["Pago", "El comprobante se adjunta y queda listo para validar."],
                ["Aprobación", "Administración confirma la reserva con un clic."],
                ["Ingreso", "Seguridad recibe la lista del día y controla visitas."],
                ["Limpieza", "El equipo recibe tareas de preparación y cierre."],
                ["Cierre", "El sistema consolida ingresos, incidentes y auditoría."],
              ].map(([label, step]) => (
                <div className="living-timeline-item living-card" key={label}>
                  <div className="living-step-label"><window.LivingPublicIcon name="check" size={18} /> {label}</div>
                  <p>{step}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="living-story-section" id="landing/whatsapp">
            <div className="living-whatsapp-copy">
              <div className="living-section-heading">
                <span className="living-section-heading-icon"><window.LivingPublicIcon name="chat" /></span>
                <span className="living-eyebrow">Canal conversacional</span>
              </div>
              <h2>La forma más simple de reservar para tus residentes</h2>
              <p>
                Sin descargar apps ni recordar contraseñas. El flujo guía consulta, reglamento y pago.
              </p>
            </div>

            <div className="living-whatsapp-features">
              <div className="feature-item">
                <strong><window.LivingPublicIcon name="chat" size={18} /> Consulta instantánea</strong>
                <span>Disponibilidad en tiempo real para todas las áreas comunes.</span>
              </div>
              <div className="feature-item">
                <strong><window.LivingPublicIcon name="receipt" size={18} /> Validación integrada</strong>
                <span>Sube fotos de transferencias, Yape o Plin directamente en el chat.</span>
              </div>
              <div className="feature-item">
                <strong><window.LivingPublicIcon name="lock" size={18} /> Reglas y aforos</strong>
                <span>El flujo valida deudas, límites de reservas y aforos del reglamento.</span>
              </div>
            </div>

            <div className="living-whatsapp-gallery">
              {[
                ["whatsapp-01.png", "Paso 1: Selección de área"],
                ["whatsapp-02.png", "Paso 2: Reglamento y costos"],
                ["whatsapp-03.png", "Paso 3: Envío de pago"],
                ["whatsapp-04.png", "Paso 4: Confirmación"],
              ].map(([image, label]) => (
                <div className="whatsapp-mock" key={image}>
                  <div className="whatsapp-body">
                    <img src={window.BRICKS_LIVING_PUBLIC_ASSET(image)} alt={label} className="whatsapp-screen" />
                  </div>
                  <div className="whatsapp-footer">{label}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="living-story-section" id="landing/roles">
            <window.LivingPublicSectionTitle
              eyebrow="Cobertura completa"
              icon="people"
              title="Un mismo portal. Vistas optimizadas por rol."
              body="Cada equipo ve solo lo que necesita para operar sin ruido."
            />
            <div className="living-grid living-role-grid">
              {roleCards.map(([name, body]) => (
                <div className="living-card role-card" key={name}>
                  <div className="living-card-label">{name}</div>
                  <p>{body}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="living-story-section" id="landing/reportes">
            <window.LivingPublicSectionTitle
              eyebrow="Datos del piloto"
              icon="chart"
              title="Información real para una simulación completa"
              body="Datos cargados para revisar reservas, pagos y operación mensual."
            />
            <div className="living-split-panel">
              <div className="living-card">
                <div className="living-card-label">Edificio demo</div>
                <h3>Torres del Parque</h3>
                <ul className="living-list">
                  <li>168 departamentos registrados</li>
                  <li>5 áreas comunes operativas</li>
                  <li>2 puestos de vigilancia física</li>
                  <li>Personal de mantenimiento integrado</li>
                </ul>
              </div>
              <div className="living-card">
                <div className="living-card-label">Historial del mes</div>
                <h3>113 reservas registradas</h3>
                <ul className="living-list">
                  {areaStats.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>
            </div>
          </section>
        </main>

        <window.Footer
          assetPrefix="./"
          t={{
            footer: {
              tag: 'Focused apps for real estate agents on Apple.',
              sections: [
                { h: 'Apps', l: [{ label: 'Bricks Scan', href: './scan.html' }, { label: 'Bricks Calc', href: './calc.html' }, { label: 'Bricks Leads', href: './leads.html' }] },
                { h: 'Business', l: [{ label: 'About', href: './about.html' }, { label: 'Purchase guide', href: './purchase-guide-01.html' }, { label: 'hello@bricks.pe', href: 'mailto:hello@bricks.pe' }] },
                { h: 'Support', l: [{ label: 'Contact', href: './support.html' }, { label: 'Vote on features', href: 'https://bricksapps.userjot.com' }, { label: 'Guides', href: './help.html' }, { label: 'Survey', href: './survey.html' }] },
              ],
              legal: [{ label: 'Privacy Policy', href: './privacy.html' }, { label: 'Terms of Service', href: './terms.html' }],
              copyright: '© 2026 Bricks Apps. Made with care.',
              language: 'Language',
              appearance: 'Appearance',
              light: 'Light',
              dark: 'Dark',
              auto: 'System',
            }
          }}
          lang="en"
          setLang={() => { }}
          theme="auto"
          setTheme={() => { }}
        />
      </div>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(<window.LivingStandalonePage />);
