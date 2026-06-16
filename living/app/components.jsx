window.Badge = function Badge({ status, label }) {
  return <span className={`living-badge tone-${window.livingStatusTone(status)}`}>{label || window.LIVING_STATUS_LABELS[status] || status}</span>;
};

window.SectionTitle = function SectionTitle({ eyebrow, title, body, actions }) {
  return (
    <div className="living-section-title">
      <div>
        {eyebrow ? <div className="living-eyebrow">{eyebrow}</div> : null}
        <h1>{title}</h1>
        {body ? <p>{body}</p> : null}
      </div>
      {actions ? <div className="living-actions-row">{actions}</div> : null}
    </div>
  );
};

window.MetricCard = function MetricCard({ label, value, detail, icon }) {
  return (
    <div className="living-card living-metric-card">
      <div className="living-card-header-row">
        <div className="living-card-label">{label}</div>
        {icon && <span className="living-metric-icon">{icon}</span>}
      </div>
      <div className="living-metric-value">{value}</div>
      {detail ? <div className="living-card-detail">{detail}</div> : null}
    </div>
  );
};

window.DataTable = function DataTable({ columns, rows, empty }) {
  if (!rows.length) {
    return <div className="living-empty-state">{empty || "Sin resultados."}</div>;
  }

  return (
    <div className="living-table-wrap">
      <table className="living-table">
        <thead>
          <tr>
            {columns.map((column) => <th key={column.key}>{column.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.id || index}>
              {columns.map((column) => (
                <td key={column.key}>{column.render ? column.render(row) : row[column.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

window.PublicLanding = function PublicLanding({ onEnterPortal }) {
  const kpis = [
    {
      label: "Reservas este mes",
      value: "90",
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
      value: window.livingFormatCurrency(4820),
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
      detail: "Gimnasio, Terraza, BBQ, etc.",
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

  return (
    <div className="living-public">
      <div className="living-public-shell">
        <header className="living-public-header">
          <a href="../index.html" className="living-brand">
            <img src="../images/bricks-dark-logo.svg" alt="Bricks" />
            <span>Living</span>
          </a>
          <nav className="living-public-nav" aria-label="Navegación principal">
            <a href="#landing/workflow">Operación</a>
            <a href="#landing/whatsapp">WhatsApp</a>
            <a href="#landing/roles">Roles</a>
            <a href="#landing/reportes">Métricas</a>
            <button className="living-button living-button-primary" onClick={onEnterPortal}>Entrar al portal</button>
          </nav>
        </header>

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
              <button className="living-button living-button-primary" onClick={onEnterPortal}>Probar demo interactiva</button>
              <a className="living-button living-button-secondary" href="#landing/workflow">Ver flujo paso a paso</a>
            </div>
            <div className="living-inline-note">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: 6, verticalAlign: 'middle'}}>
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              Piloto: Edificio Torres del Parque, Miraflores
            </div>
          </div>

          <div className="living-hero-visual">
            <div className="browser-mockup">
              <div className="browser-header">
                <span className="browser-dot red"></span>
                <span className="browser-dot yellow"></span>
                <span className="browser-dot green"></span>
                <div className="browser-address">living.bricks.pe/portal/dashboard</div>
              </div>
              <img src="images/Bricks Living Hero UI.png" alt="Bricks Living Portal Dashboard" className="browser-image" />
            </div>
          </div>
        </section>

        <section className="living-grid living-kpis">
          {kpis.map((item) => <window.MetricCard key={item.label} {...item} />)}
        </section>

        <section className="living-story-section" id="landing/workflow">
          <window.SectionTitle
            eyebrow="Flujo principal"
            title="El ciclo operativo resuelto de extremo a extremo"
            body="Una historia operativa totalmente integrada: desde que el residente solicita por WhatsApp, hasta que la junta directiva visualiza las finanzas consolidadas."
          />
          <div className="living-timeline">
            {[
              "El residente solicita una reserva en segundos vía WhatsApp.",
              "Envía el comprobante de pago/garantía y se registra en la cola.",
              "El administrador valida el pago y aprueba con un solo clic.",
              "Seguridad recibe la lista automatizada y controla el ingreso.",
              "Limpieza recibe tareas automáticas de preparación y entrega.",
              "El sistema genera los reportes de ingresos e incidentes del mes.",
            ].map((step, index) => (
              <div className="living-timeline-item living-card" key={step}>
                <div className="living-step-number">0{index + 1}</div>
                <p>{step}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="living-story-section" id="landing/whatsapp">
          <div className="living-split-whatsapp">
            <div className="living-whatsapp-copy">
              <span className="living-eyebrow">Canal Conversacional</span>
              <h2>La forma más simple de reservar para tus residentes</h2>
              <p>
                Sin descargar aplicaciones pesadas ni recordar contraseñas. El chatbot de Bricks Living guía a los residentes en un flujo rápido de consulta, aceptación de reglamento y envío de constancias de pago.
              </p>
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
                  <strong>🔒 Reglas y Aforos</strong>
                  <span>El motor valida deudas, límites de reservas y aforos del reglamento.</span>
                </div>
              </div>
            </div>
            
            <div className="living-whatsapp-gallery">
              <div className="whatsapp-mock">
                <div className="whatsapp-header">
                  <div className="whatsapp-title">Bricks Living Chat</div>
                </div>
                <div className="whatsapp-body">
                  <img src="images/whatsapp-01.png" alt="Paso 1: Selección de áreas" className="whatsapp-screen" />
                </div>
                <div className="whatsapp-footer">Paso 1: Selección de área</div>
              </div>
              <div className="whatsapp-mock">
                <div className="whatsapp-header">
                  <div className="whatsapp-title">Bricks Living Chat</div>
                </div>
                <div className="whatsapp-body">
                  <img src="images/whatsapp-02.png" alt="Paso 2: Reglas y tarifas" className="whatsapp-screen" />
                </div>
                <div className="whatsapp-footer">Paso 2: Reglamento y costos</div>
              </div>
              <div className="whatsapp-mock">
                <div className="whatsapp-header">
                  <div className="whatsapp-title">Bricks Living Chat</div>
                </div>
                <div className="whatsapp-body">
                  <img src="images/whatsapp-03.png" alt="Paso 3: Envío de comprobante" className="whatsapp-screen" />
                </div>
                <div className="whatsapp-footer">Paso 3: Envío de pago</div>
              </div>
            </div>
          </div>
        </section>

        <section className="living-story-section" id="landing/roles">
          <window.SectionTitle
            eyebrow="Cobertura Completa"
            title="Un mismo portal. Vistas optimizadas por rol."
            body="Asigna accesos específicos para que cada miembro del equipo trabaje de manera coordinada."
          />
          <div className="living-grid living-role-grid">
            {[
              ["Super Admin", "Control global de edificios, plantillas, integraciones de WhatsApp y suscripciones.", (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              )],
              ["Admin edificio", "Gestión total del dashboard, reservas, validación de pagos y reportes de caja.", (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <line x1="9" y1="3" x2="9" y2="21" />
                </svg>
              )],
              ["Asistente", "Atención del flujo operativo diario, soporte a residentes y control de agenda.", (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              )],
              ["Seguridad", "Consulta de reservas del día, control de ingresos de invitados y registro de incidentes.", (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              )],
              ["Limpieza", "Tareas de alistamiento y cierre de áreas, con checklist digital en tiempo real.", (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                  <path d="M12 6v6l4 2" />
                </svg>
              )],
              ["Junta Directiva", "Monitoreo financiero, auditoría de depósitos y reportes mensuales de gestión.", (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
              )],
            ].map(([name, body, icon]) => (
              <div className="living-card role-card" key={name}>
                <div className="role-icon-row">
                  {icon}
                  <div className="living-card-label">{name}</div>
                </div>
                <p>{body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="living-story-section" id="landing/reportes">
          <window.SectionTitle
            eyebrow="Datos del Piloto"
            title="Información real para una simulación completa"
            body="La base de demostración contiene datos cargados de 168 departamentos para reflejar una operación residencial viva."
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
              <h3>90 reservas confirmadas</h3>
              <ul className="living-list">
                <li>Terraza: 18 reservas (S/ 2,160 recaudados)</li>
                <li>BBQ: 22 reservas (S/ 1,760 recaudados)</li>
                <li>Salón de eventos: 9 reservas (S/ 1,350 recaudados)</li>
                <li>Coworking: 41 reservas (Uso gratuito regulado)</li>
              </ul>
            </div>
          </div>
        </section>
        </main>
      </div>
    </div>
  );
};

window.LoginScreen = function LoginScreen({ onLogin }) {
  const [email, setEmail] = React.useState(window.LIVING_DEMO_ACCOUNTS[0].email);
  const [password, setPassword] = React.useState("demo123");
  const [error, setError] = React.useState("");

  function submit(event) {
    event.preventDefault();
    const match = window.LIVING_DEMO_ACCOUNTS.find((account) => account.email === email && account.password === password);
    if (!match) {
      setError("Credenciales inválidas. Use una cuenta demo.");
      return;
    }
    setError("");
    onLogin(match);
  }

  return (
    <div className="living-login-shell">
      <div className="living-login-card living-card">
        <a href="#landing" className="living-back-link">← Volver a la presentación</a>
        <div className="living-eyebrow">Acceso demo</div>
        <h1>Entrar al portal</h1>
        <p>Seleccione un rol demo para recorrer el sistema. Cada cuenta abre un menú distinto sobre la misma base operativa.</p>
        <form onSubmit={submit} className="living-form">
          <label>
            <span>Email</span>
            <select value={email} onChange={(event) => setEmail(event.target.value)}>
              {window.LIVING_DEMO_ACCOUNTS.map((account) => (
                <option key={account.email} value={account.email}>{account.email} · {window.LIVING_ROLE_LABELS[account.role]}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Contraseña</span>
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
          </label>
          {error ? <div className="living-form-error">{error}</div> : null}
          <button className="living-button living-button-primary" type="submit">Entrar</button>
        </form>
        <div className="living-account-hints">
          {window.LIVING_DEMO_ACCOUNTS.map((account) => (
            <div className="living-hint-row" key={account.email}>
              <strong>{window.LIVING_ROLE_LABELS[account.role]}</strong>
              <span>{account.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

window.Sidebar = function Sidebar({ role, currentPage, onNavigate }) {
  const items = window.LIVING_NAV_ITEMS.filter((item) => item.roles.includes(role));
  return (
    <aside className="living-sidebar">
      <div className="living-sidebar-header">
        <div className="living-brand">
          <img src="../images/bricks-dark-logo.svg" alt="Bricks" />
          <span>Living</span>
        </div>
        <div className="living-sidebar-building">Torres del Parque</div>
      </div>
      <nav className="living-sidebar-nav">
        {items.map((item) => (
          <button
            key={item.id}
            className={`living-sidebar-link ${currentPage === item.id ? "is-active" : ""}`}
            onClick={() => onNavigate(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
};

window.TopBar = function TopBar({ account, role, onRoleChange, onLogout }) {
  return (
    <div className="living-topbar">
      <div>
        <strong>{account.name}</strong>
        <div className="living-card-detail">{window.LIVING_ROLE_LABELS[role]}</div>
      </div>
      <div className="living-topbar-actions">
        <select value={role} onChange={(event) => onRoleChange(event.target.value)}>
          {window.LIVING_DEMO_ACCOUNTS.map((accountOption) => (
            <option value={accountOption.role} key={accountOption.role}>{window.LIVING_ROLE_LABELS[accountOption.role]}</option>
          ))}
        </select>
        <button className="living-button living-button-primary" onClick={onLogout}>Salir</button>
      </div>
    </div>
  );
};
