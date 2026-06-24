window.Badge = function Badge({ status, label }) {
  return <span className={`living-badge tone-${window.livingStatusTone(status)}`}>{label || window.LIVING_STATUS_LABELS[status] || status}</span>;
};

window.LivingNavIcon = function LivingNavIcon({ name }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true",
  };

  switch (name) {
    case "dashboard":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="8" height="8" rx="2" />
          <rect x="13" y="3" width="8" height="5" rx="2" />
          <rect x="13" y="10" width="8" height="11" rx="2" />
          <rect x="3" y="13" width="8" height="8" rx="2" />
        </svg>
      );
    case "calendar":
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="17" rx="3" />
          <line x1="8" y1="2.5" x2="8" y2="6.5" />
          <line x1="16" y1="2.5" x2="16" y2="6.5" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      );
    case "approvals":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M8.5 12.5l2.4 2.4 4.8-5.1" />
        </svg>
      );
    case "payments":
      return (
        <svg {...common}>
          <path d="M12 2v20" />
          <path d="M17 6.5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6.5" />
        </svg>
      );
    case "deposits":
      return (
        <svg {...common}>
          <path d="M12 3l7 4v5c0 4.5-2.8 7.6-7 9-4.2-1.4-7-4.5-7-9V7l7-4z" />
          <path d="M9.5 12.5l1.8 1.8 3.6-3.8" />
        </svg>
      );
    case "areas":
      return (
        <svg {...common}>
          <path d="M4 20V10.5L12 4l8 6.5V20" />
          <path d="M9 20v-5h6v5" />
        </svg>
      );
    case "residents":
      return (
        <svg {...common}>
          <circle cx="9" cy="8" r="3.25" />
          <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
          <path d="M16 8h4" />
          <path d="M18 6v4" />
        </svg>
      );
    case "security":
      return (
        <svg {...common}>
          <rect x="4" y="11" width="16" height="9" rx="2.5" />
          <path d="M7.5 11V8a4.5 4.5 0 0 1 9 0v3" />
        </svg>
      );
    case "cleaning":
      return (
        <svg {...common}>
          <path d="M8 4h8" />
          <path d="M10 4v4" />
          <path d="M14 4v4" />
          <path d="M6 9h12" />
          <path d="M8 9l1.2 10h5.6L16 9" />
        </svg>
      );
    case "incidents":
      return (
        <svg {...common}>
          <path d="M12 4l8 14H4L12 4z" />
          <path d="M12 9v4" />
          <circle cx="12" cy="16.5" r="0.8" fill="currentColor" stroke="none" />
        </svg>
      );
    case "reports":
      return (
        <svg {...common}>
          <path d="M5 20V10" />
          <path d="M12 20V4" />
          <path d="M19 20v-7" />
        </svg>
      );
    case "messages":
      return (
        <svg {...common}>
          <path d="M5 6.5h14A2.5 2.5 0 0 1 21.5 9v7A2.5 2.5 0 0 1 19 18.5H9l-4.5 3V9A2.5 2.5 0 0 1 7 6.5" />
          <path d="M8.5 11.5h7" />
          <path d="M8.5 14.5h4.5" />
        </svg>
      );
    case "settings":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1 1 0 0 0 .2 1.1l.1.1a2 2 0 0 1-2.8 2.8l-.1-.1a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.9V20a2 2 0 0 1-4 0v-.2a1 1 0 0 0-.6-.9 1 1 0 0 0-1.1.2l-.1.1a2 2 0 0 1-2.8-2.8l.1-.1a1 1 0 0 0 .2-1.1 1 1 0 0 0-.9-.6H4a2 2 0 0 1 0-4h.2a1 1 0 0 0 .9-.6 1 1 0 0 0-.2-1.1l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1 1 0 0 0 1.1.2 1 1 0 0 0 .6-.9V4a2 2 0 0 1 4 0v.2a1 1 0 0 0 .6.9 1 1 0 0 0 1.1-.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1 1 0 0 0-.2 1.1 1 1 0 0 0 .9.6h.2a2 2 0 0 1 0 4h-.2a1 1 0 0 0-.9.6z" />
        </svg>
      );
    case "superadmin":
      return (
        <svg {...common}>
          <path d="M12 3l2.6 5.2 5.7.8-4.1 4 1 5.7L12 16l-5.2 2.7 1-5.7-4.1-4 5.7-.8L12 3z" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8" />
        </svg>
      );
  }
};

window.SectionTitle = function SectionTitle({ eyebrow, title, body, actions, iconName }) {
  return (
    <div className="living-section-title">
      <div>
        {eyebrow ? <div className="living-eyebrow">{eyebrow}</div> : null}
        <div className="living-section-heading">
          {iconName ? (
            <span className="living-section-heading-icon">
              <window.LivingNavIcon name={iconName} />
            </span>
          ) : null}
          <h1>{title}</h1>
        </div>
        {body ? <p>{body}</p> : null}
      </div>
      {actions ? <div className="living-actions-row">{actions}</div> : null}
    </div>
  );
};

window.SparklineChart = function SparklineChart({ values = [], label = "Tendencia" }) {
  const chartId = React.useId();
  const safeValues = values.length ? values : [0];
  const max = Math.max(...safeValues, 1);
  const points = safeValues.map((value, index) => {
    const x = safeValues.length === 1 ? 2 : (index / (safeValues.length - 1)) * 96 + 2;
    const y = 38 - ((value / max) * 30);
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  }).join(" ");
  const area = `M 2 38 L ${points.replaceAll(" ", " L ")} L 98 38 Z`;
  const lastIndex = safeValues.length - 1;
  const lastX = safeValues.length === 1 ? 2 : (lastIndex / (safeValues.length - 1)) * 96 + 2;
  const lastY = 38 - ((safeValues[lastIndex] / max) * 30);
  return (
    <figure className="living-sparkline" aria-label={label}>
      <svg viewBox="0 0 100 40" role="img" aria-label={label} preserveAspectRatio="none">
        <defs>
          <linearGradient id={`living-sparkline-fill-${chartId}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.28" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill={`url(#living-sparkline-fill-${chartId})`} />
        <polyline points={points} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={lastX} cy={lastY} r="2.6" fill="currentColor" />
      </svg>
    </figure>
  );
};

window.HorizontalBarChart = function HorizontalBarChart({ items = [], formatValue = (value) => value, labelKey = "label", valueKey = "value", metaKey = "meta" }) {
  const max = Math.max(...items.map((item) => item[valueKey]), 1);
  return (
    <div className="living-bar-chart" role="list" aria-label="Gráfico de barras">
      {items.map((item) => (
        <div className="living-bar-chart-row" key={item[labelKey]} role="listitem">
          <div className="living-bar-chart-label">
            <strong>{item[labelKey]}</strong>
            {item[metaKey] ? <span>{item[metaKey]}</span> : null}
          </div>
          <div className="living-bar-chart-track" aria-hidden="true">
            <span className="living-bar-chart-fill" style={{ width: `${(item[valueKey] / max) * 100}%` }} />
          </div>
          <div className="living-bar-chart-value">{formatValue(item[valueKey])}</div>
        </div>
      ))}
    </div>
  );
};

window.DashboardPriorityList = function DashboardPriorityList({ items = [], onOpenReservation }) {
  if (!items.length) {
    return <div className="living-empty-state">No hay acciones prioritarias.</div>;
  }

  return (
    <div className="living-priority-list" role="list">
      {items.map((item) => (
        <article className="living-priority-row" key={item.id} role="listitem">
          <div className="living-priority-copy">
            <div className="living-priority-kicker">{item.kind}</div>
            <h4>{item.title}</h4>
            <p>{item.detail}</p>
          </div>
          <button type="button" className="living-link-button living-priority-action" onClick={() => onOpenReservation(item.reservationId)}>
            {item.action}
          </button>
        </article>
      ))}
    </div>
  );
};

window.MetricCard = function MetricCard({ label, value, detail, icon, onClick, trend, trendLabel, sparkline, sparklineLabel }) {
  const content = (
    <>
      <div className="living-card-header-row">
        <div className="living-card-label">{label}</div>
        {icon && <span className="living-metric-icon">{icon}</span>}
      </div>
      <div className="living-metric-value">{value}</div>
      {typeof trend === "number" || trendLabel ? (
        <div className={`living-metric-trend ${typeof trend === "number" ? (trend >= 0 ? "is-up" : "is-down") : ""}`}>
          <span>{typeof trend === "number" ? `${trend >= 0 ? "↑" : "↓"} ${Math.abs(Math.round(trend))}%` : "—"}</span>
          {trendLabel ? <small>{trendLabel}</small> : null}
        </div>
      ) : null}
      {sparkline ? <window.SparklineChart values={sparkline} label={sparklineLabel || `${label} - tendencia`} /> : null}
      {detail ? <div className="living-card-detail">{detail}</div> : null}
    </>
  );
  return onClick ? <button type="button" className="living-card living-metric-card living-metric-card-action" onClick={onClick}>{content}</button> : <div className="living-card living-metric-card">{content}</div>;
};

window.DataTable = function DataTable({ columns, rows, empty }) {
  if (!rows.length) {
    return <div className="living-empty-state">{empty || "Sin resultados."}</div>;
  }

  const orderedColumns = window.livingOrderTableColumns(columns);
  const sourceOrder = new Map(columns.map((column, index) => [column.key, index]));
  const tableWidth = orderedColumns.reduce((total, column) => total + window.livingTableColumnWidth(column), 0);

  return (
    <div className="living-table-wrap">
      <table className="living-table" style={{ width: `${tableWidth}px` }}>
        <colgroup>
          {orderedColumns.map((column) => <col key={column.key} style={{ width: `${window.livingTableColumnWidth(column)}px` }} />)}
        </colgroup>
        <thead>
          <tr>
            {orderedColumns.map((column) => <th key={column.key} data-column-kind={window.livingTableColumnKind(column)}>{column.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.id || index}>
              {orderedColumns.map((column) => (
                <td key={column.key} data-label={column.label} data-column-kind={window.livingTableColumnKind(column)} style={{ "--living-mobile-order": sourceOrder.get(column.key) }}>{column.render ? column.render(row) : row[column.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

window.CollectionToolbar = function CollectionToolbar({ query, onQueryChange, placeholder, filter, onFilterChange, options = [], resultCount }) {
  return (
    <div className="living-collection-toolbar">
      <label className="living-search-field">
        <span className="living-sr-only">Buscar</span>
        <input type="search" value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder={placeholder || "Buscar"} />
      </label>
      {options.length ? (
        <label className="living-filter-field">
          <span className="living-sr-only">Filtrar</span>
          <select value={filter} onChange={(event) => onFilterChange(event.target.value)}>
            {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
      ) : null}
      <span className="living-result-count">{resultCount} resultados</span>
    </div>
  );
};

window.Pagination = function Pagination({ page, pageCount, onPageChange }) {
  if (pageCount <= 1) return null;
  return (
    <nav className="living-pagination" aria-label="Paginación">
      <button className="living-button living-button-secondary" disabled={page === 1} onClick={() => onPageChange(page - 1)}>Anterior</button>
      <span>Página {page} de {pageCount}</span>
      <button className="living-button living-button-secondary" disabled={page === pageCount} onClick={() => onPageChange(page + 1)}>Siguiente</button>
    </nav>
  );
};

window.FormPanel = function FormPanel({ title, description, children, onCancel }) {
  const panelRef = React.useRef(null);
  const returnFocusRef = React.useRef(document.activeElement);
  React.useEffect(() => {
    panelRef.current?.focus();
    const background = [...document.querySelectorAll(".living-sidebar, .living-topbar, .living-screen > :not(.living-dialog-backdrop)")];
    background.forEach((element) => element.setAttribute("inert", ""));
    function handleKey(event) {
      if (event.key === "Escape") onCancel?.();
      if (event.key !== "Tab") return;
      const focusable = [...panelRef.current.querySelectorAll("button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], summary")];
      if (!focusable.length) return;
      const edge = event.shiftKey ? focusable[0] : focusable[focusable.length - 1];
      if (document.activeElement !== edge) return;
      event.preventDefault();
      (event.shiftKey ? focusable[focusable.length - 1] : focusable[0]).focus();
    }
    document.addEventListener("keydown", handleKey);
    return () => { background.forEach((element) => element.removeAttribute("inert")); document.removeEventListener("keydown", handleKey); returnFocusRef.current?.focus?.(); };
  }, []);
  return (
    <div className="living-dialog-backdrop">
      <section ref={panelRef} className="living-card living-form-panel" role="dialog" aria-modal="true" aria-label={title} tabIndex="-1">
        <div className="living-story-header">
          <div>
            <div className="living-card-label">Acción</div>
            <h3>{title}</h3>
            {description ? <p>{description}</p> : null}
          </div>
          {onCancel ? <button className="living-link-button" type="button" onClick={onCancel}>Cancelar</button> : null}
        </div>
        {children}
      </section>
    </div>
  );
};

window.LoginScreen = function LoginScreen({ onLogin }) {
  return (
    <div className="living-login-shell">
      <div className="living-login-card living-card">
        <a href={window.LIVING_MARKETING_URL} className="living-back-link">← Volver a la presentación</a>
        <div className="living-eyebrow">Acceso demo</div>
        <h1>Entrar al portal</h1>
        <p>Elija una vista. Cada rol abre solo las tareas que necesita.</p>
        <div className="living-role-choices">
          {window.LIVING_DEMO_ACCOUNTS.map((account) => (
            <button type="button" className="living-role-choice" key={account.email} onClick={() => onLogin(account)}>
              <span><strong>{window.LIVING_ROLE_LABELS[account.role]}</strong><small>{account.name}</small></span>
              <span aria-hidden="true">Continuar</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

window.Sidebar = function Sidebar({ role, currentPage, collapsed, onToggleCollapsed, onNavigate }) {
  const asset = window.livingAsset;
  const items = window.LIVING_NAV_ITEMS.filter((item) => item.roles.includes(role));
  const groups = [...new Set(items.map((item) => item.group))];
  const primaryGroups = new Set(["Inicio", "Reservas", "Operación"]);
  function renderLink(item) {
    return (
      <button key={item.id} className={`living-sidebar-link ${currentPage === item.id ? "is-active" : ""}`} onClick={() => onNavigate(item.id)} aria-label={collapsed ? item.label : undefined} title={collapsed ? item.label : undefined}>
        <span className="living-sidebar-link-icon"><window.LivingNavIcon name={item.icon || item.id} /></span>
        {!collapsed ? <span className="living-sidebar-link-label">{item.label}</span> : null}
      </button>
    );
  }
  return (
    <aside className={`living-sidebar ${collapsed ? "is-collapsed" : ""}`}>
      <div className="living-sidebar-header">
        <div className="living-brand">
          <img src={asset("images/bricks-living-logo.svg")} alt="Bricks Living" />
        </div>
        <div className="living-sidebar-building">Torres del Parque</div>
        <button type="button" className="living-sidebar-collapse" onClick={onToggleCollapsed} aria-label={collapsed ? "Expandir menú" : "Minimizar menú"} title={collapsed ? "Expandir menú" : "Minimizar menú"}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={collapsed ? "M9 18l6-6-6-6" : "M15 18l-6-6 6-6"} /></svg>
        </button>
      </div>
      <label className="living-mobile-nav">
        <span>Ir a</span>
        <select value={currentPage} onChange={(event) => onNavigate(event.target.value)}>
          {currentPage === "reservation" ? <option value="reservation">Detalle de reserva</option> : null}
          {groups.map((group) => <optgroup label={group} key={group}>{items.filter((item) => item.group === group).map((item) => <option value={item.id} key={item.id}>{item.label}</option>)}</optgroup>)}
        </select>
      </label>
      <nav className="living-sidebar-nav" aria-label="Portal">
        {collapsed ? groups.filter((group) => primaryGroups.has(group)).map((group) => (
          <div className="living-collapsed-nav-group" key={group} aria-label={group}>
            <span className="living-nav-group-label living-collapsed-nav-label" aria-hidden="true">{group}</span>
            {items.filter((item) => item.group === group).map(renderLink)}
          </div>
        )) : groups.map((group) => primaryGroups.has(group) ? (
          <section className="living-nav-group living-nav-group-fixed" key={group} aria-labelledby={`living-nav-${group}`}>
            <div className="living-nav-group-label" id={`living-nav-${group}`}>{group}</div>
            {items.filter((item) => item.group === group).map(renderLink)}
          </section>
        ) : (
          <details className="living-nav-group" key={group} defaultOpen={items.some((item) => item.group === group && item.id === currentPage)}>
            <summary className="living-nav-group-label">{group}</summary>
            {items.filter((item) => item.group === group).map(renderLink)}
          </details>
        ))}
      </nav>
    </aside>
  );
};

window.ActionFeedback = function ActionFeedback({ feedback, onDismiss }) {
  if (!feedback) return null;
  return (
    <div className={`living-feedback living-feedback-${feedback.tone}`} role="status" aria-live="polite">
      <span>{feedback.message}</span>
      <button type="button" onClick={onDismiss} aria-label="Cerrar aviso">Cerrar</button>
    </div>
  );
};

window.TopBar = function TopBar({ account, role, onRoleChange, onLogout, onResetDemo }) {
  const avatarMap = {
    building_admin: window.livingAsset("images/user-profile-admin.jpg"),
    assistant_admin: window.livingAsset("images/user-profile-asistant.jpg"),
    security: window.livingAsset("images/user-profile-security.jpg"),
    cleaning: window.livingAsset("images/user-progile-cleaning.jpg"),
    junta: window.livingAsset("images/user-profile-junta.jpg"),
    super_admin: window.livingAsset("images/user-super-admin.jpg"),
  };
  const avatarSrc = avatarMap[role] || window.livingAsset("images/user-profile-asistant.jpg");

  return (
    <div className="living-topbar">
      <div className="living-topbar-profile">
        <img className="living-topbar-avatar" src={avatarSrc} alt={account.name} />
        <div className="living-topbar-account">
          <strong>{account.name}</strong>
          <div className="living-card-detail">{window.LIVING_ROLE_LABELS[role]}</div>
        </div>
      </div>
      <details className="living-account-menu">
        <summary>Cuenta demo</summary>
        <div className="living-account-menu-panel">
          <label><span>Ver como</span><select value={role} onChange={(event) => onRoleChange(event.target.value)}>{window.LIVING_DEMO_ACCOUNTS.map((accountOption) => <option value={accountOption.role} key={accountOption.role}>{window.LIVING_ROLE_LABELS[accountOption.role]}</option>)}</select></label>
          <button className="living-button living-button-secondary" onClick={onResetDemo}>Restablecer datos</button>
          <button className="living-button living-button-secondary" onClick={onLogout}>Salir del portal</button>
        </div>
      </details>
    </div>
  );
};
