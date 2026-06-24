window.BRICKS_LIVING_PUBLIC_ASSET = function BRICKS_LIVING_PUBLIC_ASSET(path) {
  return `./images-bricks-living/${path}`;
};

window.BRICKS_LIVING_PUBLIC_PORTAL_URL = ["", "localhost", "127.0.0.1"].includes(window.location.hostname)
  ? "./living/portal.html#login"
  : "https://living.bricks.pe/portal/dashboard";

window.LivingPublicSectionTitle = function LivingPublicSectionTitle({ eyebrow, title, body }) {
  return (
    <div className="living-section-title">
      <div className="living-eyebrow">{eyebrow}</div>
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
    <header
      className="living-public-header"
      style={{
        position: "fixed",
        top: isMobile ? 12 : 24,
        left: isMobile ? 16 : 48,
        right: isMobile ? 16 : 48,
        zIndex: 100,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 20,
        padding: isMobile ? "10px 10px 10px 18px" : "12px 14px 12px 24px",
        background: "color-mix(in srgb, var(--living-surface) 92%, transparent)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        borderRadius: 100,
        border: "1px solid var(--living-border)",
        boxShadow: "0 8px 32px rgba(11,15,20,0.06)",
        transform: hidden ? "translateY(-130%)" : "translateY(0)",
        opacity: hidden ? 0 : 1,
        transition: "transform 0.45s cubic-bezier(0.16,1,0.3,1), opacity 0.35s ease",
      }}
    >
      <a
        href="#top"
        onClick={(event) => {
          event.preventDefault();
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}
      >
        <img src={window.BRICKS_LIVING_PUBLIC_ASSET("bricks-living-logo.svg")} alt="Bricks Living" style={{ height: 24, display: "block" }} />
      </a>

      <nav className="living-public-nav" aria-label="Navegación principal" style={{ display: "flex", gap: 6, alignItems: "center", justifyContent: "flex-end", flexWrap: "wrap" }}>
        {!isMobile ? links.map((link) => (
          <a
            key={link.id}
            href={`#${link.id}`}
            onClick={(event) => {
              event.preventDefault();
              const target = document.getElementById(link.id);
              target?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: "var(--living-text)",
              padding: "8px 14px",
              borderRadius: 100,
              letterSpacing: "-0.01em",
              opacity: 0.8,
              textDecoration: "none",
            }}
          >
            {link.label}
          </a>
        )) : null}

        <a className="living-button living-button-primary" href={window.BRICKS_LIVING_PUBLIC_PORTAL_URL}>Entrar al portal</a>
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
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      )
    },
    {
      label: "Pagos verificados",
      value: "S/ 6,320",
      detail: "Con comprobante por WhatsApp",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      )
    },
    {
      label: "Áreas configuradas",
      value: "5",
      detail: "Gimnasio, Terraza, BBQ y más",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      )
    },
    {
      label: "Roles operativos",
      value: "6",
      detail: "Admin, seguridad, limpieza y más",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      )
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
                <span className="living-hero-badge">NUEVA VERSIÓN</span>
                <span className="living-eyebrow">Bricks Living</span>
              </div>
              <h1>Reservas ordenadas. Operación bajo control.</h1>
              <p>
                Bricks Living centraliza y automatiza lo que hoy se resuelve a medias por chats y cuadernos:
                el flujo completo de reservas, aprobaciones, validación de pagos, control de acceso y limpieza.
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
              title="El ciclo operativo resuelto de extremo a extremo"
              body="Una historia operativa totalmente integrada: desde que el residente solicita por WhatsApp, hasta que la junta directiva visualiza las finanzas consolidadas."
            />
            <div className="living-timeline">
              {[
                "El residente solicita una reserva en segundos vía WhatsApp.",
                "Envía el comprobante de pago y se registra en la cola.",
                "El administrador valida el pago y aprueba con un solo clic.",
                "Seguridad recibe la lista automatizada y controla el ingreso.",
                "Limpieza recibe tareas automáticas de preparación y cierre.",
                "El sistema consolida ingresos, incidentes y auditoría del mes.",
              ].map((step, index) => (
                <div className="living-timeline-item living-card" key={step}>
                  <div className="living-step-number">0{index + 1}</div>
                  <p>{step}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="living-story-section" id="landing/whatsapp">
            <div className="living-whatsapp-copy">
              <span className="living-eyebrow">Canal Conversacional</span>
              <h2>La forma más simple de reservar para tus residentes</h2>
              <p>
                Sin descargar aplicaciones pesadas ni recordar contraseñas. El flujo guía a los residentes en consulta, aceptación de reglamento y envío de constancias de pago.
              </p>
            </div>

            <div className="living-whatsapp-features">
              <div className="feature-item">
                <strong>⚡ Consulta instantánea</strong>
                <span>Disponibilidad en tiempo real para todas las áreas comunes.</span>
              </div>
              <div className="feature-item">
                <strong>🧾 Validación integrada</strong>
                <span>Sube fotos de transferencias, Yape o Plin directamente en el chat.</span>
              </div>
              <div className="feature-item">
                <strong>🔒 Reglas y aforos</strong>
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
              title="Un mismo portal. Vistas optimizadas por rol."
              body="Asigna accesos específicos para que cada miembro del equipo trabaje de manera coordinada."
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
              title="Información real para una simulación completa"
              body="La base de demostración contiene datos cargados para reflejar una operación residencial viva."
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
