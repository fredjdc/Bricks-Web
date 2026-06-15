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

window.MetricCard = function MetricCard({ label, value, detail }) {
  return (
    <div className="living-card living-metric-card">
      <div className="living-card-label">{label}</div>
      <div className="living-metric-value">{value}</div>
      <div className="living-card-detail">{detail}</div>
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
    { label: "Reservas este mes", value: "90", detail: "Entre terraza, BBQ, salón y coworking" },
    { label: "Pagos verificados", value: window.livingFormatCurrency(4820), detail: "Cobros manuales con respaldo por WhatsApp" },
    { label: "Áreas piloto", value: "4", detail: "Gimnasio visible, pero sin reserva" },
    { label: "Usuarios operativos", value: "6 roles", detail: "Admin, seguridad, limpieza, junta y super admin" },
  ];

  return (
    <div className="living-public">
      <header className="living-public-header">
        <a href="../index.html" className="living-brand">
          <img src="../images/bricks-dark-logo.svg" alt="Bricks" />
          <span>Living</span>
        </a>
        <nav className="living-public-nav">
          <a href="#landing/workflow">Flujo</a>
          <a href="#landing/roles">Roles</a>
          <a href="#landing/reportes">Reportes</a>
          <button className="living-button living-button-primary" onClick={onEnterPortal}>Entrar al portal</button>
        </nav>
      </header>

      <main>
        <section className="living-hero">
          <div className="living-hero-copy">
            <div className="living-eyebrow">Bricks Living</div>
            <h1>Reservas claras. Operación completa. Un solo flujo.</h1>
            <p>
              Bricks Living ordena lo que hoy suele resolverse por WhatsApp y hojas sueltas:
              reservas, aprobaciones, pagos, control de acceso, limpieza, incidentes y reportes.
            </p>
            <div className="living-hero-actions">
              <button className="living-button living-button-primary" onClick={onEnterPortal}>Ver demo del portal</button>
              <a className="living-button living-button-secondary" href="#landing/workflow">Ver flujo operativo</a>
            </div>
            <div className="living-inline-note">Piloto demo: Edificio Torres del Parque, Miraflores</div>
          </div>

          <div className="living-card living-hero-panel">
            <div className="living-surface-header">
              <span className="living-pill">WhatsApp</span>
              <span className="living-pill accent">Aprobación pendiente</span>
            </div>
            <div className="living-chat-stack">
              <div className="living-chat-bubble incoming">Hola Ana 👋<br />Bienvenida a Bricks Living. ¿Qué deseas hacer?</div>
              <div className="living-chat-bubble outgoing">1️⃣ Nueva reserva</div>
              <div className="living-chat-bubble incoming">Terraza · 18 Jul · 17:00–23:00<br />Tarifa S/ 120 · Garantía S/ 300</div>
              <div className="living-chat-bubble outgoing">Acepto las reglas. 25 invitados. Pago enviado.</div>
              <div className="living-chat-bubble incoming">Reserva creada.<br />Código: TRL-2026-0718-0024<br />Estado: Pendiente de aprobación</div>
            </div>
          </div>
        </section>

        <section className="living-grid living-kpis">
          {kpis.map((item) => <window.MetricCard key={item.label} {...item} />)}
        </section>

        <section className="living-story-section" id="landing/workflow">
          <window.SectionTitle
            eyebrow="Flujo principal"
            title="Del mensaje inicial al reporte mensual"
            body="La demo sigue una sola historia operativa completa: Ana reserva la terraza, administración valida, seguridad recibe la lista, limpieza ejecuta tareas y la junta ve el resultado consolidado."
          />
          <div className="living-timeline">
            {[
              "Ana inicia la reserva por WhatsApp y el motor valida reglas.",
              "Se registra el pago por Yape y la reserva queda pendiente de aprobación.",
              "Administración revisa, aprueba y deja el historial auditado.",
              "Seguridad recibe la lista de invitados y valida el acceso.",
              "Limpieza completa preparación, cierre e inspección.",
              "El mes consolida reservas, ingresos, garantías e incidentes.",
            ].map((step, index) => (
              <div className="living-timeline-item living-card" key={step}>
                <div className="living-step-number">0{index + 1}</div>
                <p>{step}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="living-story-section" id="landing/roles">
          <window.SectionTitle
            eyebrow="Cobertura"
            title="Un mismo portal. Vistas distintas por rol."
            body="Cada rol ve lo que necesita. No más permisos mezclados ni pantallas genéricas."
          />
          <div className="living-grid living-role-grid">
            {[
              ["Super Admin", "Edificios, plantillas de WhatsApp, onboarding, soporte y suscripciones."],
              ["Admin edificio", "Dashboard, calendario, aprobaciones, pagos, garantías, residentes, áreas y reportes."],
              ["Asistente", "Apoya operación diaria con las mismas colas principales."],
              ["Seguridad", "Ve reservas activas, lista de invitados, notas e incidentes."],
              ["Limpieza", "Gestiona preparación, limpieza posterior e inspecciones."],
              ["Junta", "Consulta reportes, incidentes, garantías y cumplimiento."],
            ].map(([name, body]) => (
              <div className="living-card" key={name}>
                <div className="living-card-label">{name}</div>
                <p>{body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="living-story-section" id="landing/reportes">
          <window.SectionTitle
            eyebrow="Base de demo"
            title="Datos suficientes para que se sienta real"
            body="La demo parte de un edificio completo, 50+ residentes cargados, historial de reservas, incidentes, pagos y reportes mensuales."
          />
          <div className="living-split-panel">
            <div className="living-card">
              <div className="living-card-label">Edificio demo</div>
              <h3>Torres del Parque</h3>
              <ul className="living-list">
                <li>168 departamentos</li>
                <li>5 áreas comunes registradas</li>
                <li>2 puestos de seguridad</li>
                <li>Equipo interno de limpieza</li>
              </ul>
            </div>
            <div className="living-card">
              <div className="living-card-label">Reportes julio 2026</div>
              <h3>90 reservas y S/ 5,280 cobrados</h3>
              <ul className="living-list">
                <li>Terraza: 18 reservas</li>
                <li>BBQ: 22 reservas</li>
                <li>Salón de eventos: 9 reservas</li>
                <li>Coworking: 41 reservas</li>
              </ul>
            </div>
          </div>
        </section>
      </main>
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
