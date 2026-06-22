window.useLivingPagedRows = function useLivingPagedRows(items, searchText, filterValue, filterKey, pageSize = 8) {
  const [query, setQuery] = React.useState("");
  const [filter, setFilter] = React.useState(filterValue || "all");
  const [page, setPage] = React.useState(1);
  const deferredQuery = React.useDeferredValue(query.trim().toLowerCase());
  const filtered = items.filter((item) => {
    const matchesQuery = !deferredQuery || searchText(item).toLowerCase().includes(deferredQuery);
    const matchesFilter = filter === "all" || !filterKey || item[filterKey] === filter;
    return matchesQuery && matchesFilter;
  });
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const rows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);
  function changeQuery(value) { setQuery(value); setPage(1); }
  function changeFilter(value) { setFilter(value); setPage(1); }
  return { query, setQuery: changeQuery, filter, setFilter: changeFilter, page: safePage, setPage, pageCount, rows, total: filtered.length };
};

window.DashboardScreen = function DashboardScreen({ data, onOpenReservation, onNavigate }) {
  const kpis = window.livingGetKpis(data);
  const storyReservation = data.reservations.find((item) => item.id === "TRL-2026-0718-0024");
  const activeTasks = data.tasks.filter((task) => task.status !== "completed");
  const storyline = [
    { label: "Reserva creada", done: true },
    { label: "Pago verificado", done: storyReservation.paymentStatus === "verified" },
    { label: "Aprobación admin", done: ["approved", "confirmed", "completed"].includes(storyReservation.status) },
    { label: "Acceso validado", done: storyReservation.securityResidentArrived && storyReservation.securityGuestsVerified },
    { label: "Limpieza completada", done: data.tasks.filter((task) => task.reservationId === storyReservation.id).every((task) => task.status === "completed") },
  ];
  const dashboardIcons = {
    pending: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="8" />
        <path d="M12 8v4l2.5 2.5" />
      </svg>
    ),
    payments: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 2v20" />
        <path d="M17 6.5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6.5" />
      </svg>
    ),
    reservations: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="4" width="18" height="17" rx="3" />
        <line x1="8" y1="2.5" x2="8" y2="6.5" />
        <line x1="16" y1="2.5" x2="16" y2="6.5" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
    revenue: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 16l5-5 4 4 7-8" />
        <path d="M20 10V7h-3" />
      </svg>
    ),
    story: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M7 4.5h8a3.5 3.5 0 0 1 3.5 3.5v11l-3-1.8-3 1.8-3-1.8-3 1.8V8A3.5 3.5 0 0 1 7 4.5z" />
        <path d="M9 9.5h6" />
        <path d="M9 13h4.5" />
      </svg>
    ),
    queue: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M6 7h12" />
        <path d="M6 12h12" />
        <path d="M6 17h8" />
      </svg>
    ),
    open: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M7 17L17 7" />
        <path d="M9 7h8v8" />
      </svg>
    ),
    task: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="8" />
        <path d="M9 12.5l2 2 4-4.5" />
      </svg>
    ),
  };

  return (
    <div className="living-screen">
      <window.SectionTitle eyebrow="Vista general" title="Operación de hoy" iconName="dashboard" />
      <div className="living-grid living-kpis">
        <window.MetricCard label="Pendientes" value={kpis.pendingApprovals} detail="Abrir aprobaciones" icon={dashboardIcons.pending} onClick={() => onNavigate("approvals")} />
        <window.MetricCard label="Pagos por revisar" value={kpis.pendingPayments} detail="Abrir comprobantes" icon={dashboardIcons.payments} onClick={() => onNavigate("payments")} />
        <window.MetricCard label="Reservas hoy" value={kpis.todayReservations} detail="Abrir calendario" icon={dashboardIcons.reservations} onClick={() => onNavigate("calendar")} />
        <window.MetricCard label="Ingresos del mes" value={window.livingFormatCurrency(kpis.revenueThisMonth)} detail="Abrir reportes" icon={dashboardIcons.revenue} onClick={() => onNavigate("reports")} />
      </div>
      <div className="living-dashboard-columns">
        <div className="living-card">
          <div className="living-card-label living-dashboard-label">
            <span className="living-dashboard-label-icon">{dashboardIcons.story}</span>
            <span>Historia demo</span>
          </div>
          <div className="living-story-header">
            <h3>{storyReservation.code}</h3>
            <button className="living-link-button living-link-button-inline" onClick={() => onOpenReservation(storyReservation.id)}>
              <span>Abrir</span>
              <span className="living-link-button-icon">{dashboardIcons.open}</span>
            </button>
          </div>
          <p>Ana García · Terraza · 18 Jul · 17:00–23:00</p>
          <div className="living-checklist">
            {storyline.map((item) => (
              <div className={`living-check-row ${item.done ? "done" : ""}`} key={item.label}>
                <span className="living-check-icon" aria-hidden="true">{item.done ? "●" : "○"}</span>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="living-card">
          <div className="living-card-label living-dashboard-label">
            <span className="living-dashboard-label-icon">{dashboardIcons.queue}</span>
            <span>Cola operativa</span>
          </div>
          <ul className="living-list living-queue-list">
            <li><button type="button" className="living-queue-action" onClick={() => onNavigate("approvals")}><span className="living-queue-icon">{dashboardIcons.pending}</span><span>{kpis.pendingApprovals} aprobaciones por resolver</span></button></li>
            <li><button type="button" className="living-queue-action" onClick={() => onNavigate("cleaning")}><span className="living-queue-icon">{dashboardIcons.task}</span><span>{activeTasks.length} tareas de limpieza activas</span></button></li>
          </ul>
        </div>
      </div>
    </div>
  );
};

const CALENDAR_WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

function calendarDateLabel(date, options) {
  return new Intl.DateTimeFormat("es-PE", { timeZone: "UTC", ...options }).format(new Date(`${date}T12:00:00Z`));
}

window.CalendarEventCard = function CalendarEventCard({ entry, compact, onOpenReservation }) {
  const content = <><span className="living-calendar-event-time">{entry.start}</span><span className="living-calendar-event-title">{compact ? entry.areaName : entry.title}</span></>;
  const className = `living-calendar-event living-calendar-event-${entry.type}`;
  return entry.reservationId ? <button type="button" className={className} onClick={() => onOpenReservation(entry.reservationId)} aria-label={`Abrir ${entry.title} a las ${entry.start}`}>{content}</button> : <div className={className}>{content}</div>;
};

window.CalendarScreen = function CalendarScreen({ data, pendingActions, onCreateReservation, onOpenReservation }) {
  const today = window.LIVING_DEMO_TODAY;
  const [showCreate, setShowCreate] = React.useState(false);
  const [fileError, setFileError] = React.useState("");
  const [view, setView] = React.useState("week");
  const [focusDate, setFocusDate] = React.useState(today);
  const [selectedDate, setSelectedDate] = React.useState(today);
  const [values, setValues] = React.useState({ residentId: "resident-402", areaId: "terrace", date: "2026-07-22", start: "17:00", end: "21:00", guestCount: "10", reason: "Reunión de residentes", paymentMethod: "Yape", paymentProofName: "", paymentProofType: "", paymentProofSize: 0 });
  const entries = window.livingSelectors.calendarEntries(data);
  const weekStart = window.livingSelectors.startOfWeek(focusDate);
  const weekDates = Array.from({ length: 7 }, (_item, index) => window.livingSelectors.addDays(weekStart, index));
  const monthDates = window.livingSelectors.monthGrid(focusDate);
  const monthRows = Array.from({ length: 6 }, (_item, index) => monthDates.slice(index * 7, (index + 1) * 7));
  const selectedEntries = entries.filter((entry) => entry.date === selectedDate);
  const monthPrefix = focusDate.slice(0, 7);
  const title = view === "week" ? `${calendarDateLabel(weekDates[0], { day: "numeric", month: "short" })} – ${calendarDateLabel(weekDates[6], { day: "numeric", month: "short", year: "numeric" })}` : calendarDateLabel(`${monthPrefix}-01`, { month: "long", year: "numeric" });
  const reservableAreas = data.areas.filter((area) => { const policy = window.livingSelectors.areaPolicyOnDate(area, values.date); return policy?.status === "active" && policy.reservable; });
  const selectedArea = reservableAreas.find((area) => area.id === values.areaId) || reservableAreas[0];
  const selectedPolicy = selectedArea ? window.livingSelectors.areaPolicyOnDate(selectedArea, values.date) : null;
  const acceptedMethods = selectedPolicy ? window.livingSelectors.paymentMethodsForPolicy(selectedPolicy) : [];

  function update(key, value) { setValues((current) => ({ ...current, [key]: value })); }
  function selectDate(date) {
    setFocusDate(date);
    setSelectedDate(date);
    setValues((current) => ({ ...current, date }));
  }
  function movePeriod(direction) {
    React.startTransition(() => {
      const next = view === "week" ? window.livingSelectors.addDays(focusDate, direction * 7) : window.livingSelectors.addMonths(focusDate, direction);
      setFocusDate(next);
      selectDate(next);
    });
  }
  function goToday() {
    React.startTransition(() => selectDate(today));
  }
  function updateArea(areaId) {
    const area = data.areas.find((item) => item.id === areaId);
    const policy = area ? window.livingSelectors.areaPolicyOnDate(area, values.date) : null;
    const methods = policy ? window.livingSelectors.paymentMethodsForPolicy(policy) : [];
    setValues((current) => ({ ...current, areaId, paymentMethod: methods[0] || "Transferencia" }));
  }
  function chooseProof(event) {
    const file = event.target.files[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "application/pdf"].includes(file.type) || file.size > 5 * 1024 * 1024) { setFileError("Use JPG, PNG o PDF de hasta 5 MB."); return; }
    setFileError("");
    setValues((current) => ({ ...current, paymentProofName: file.name, paymentProofType: file.type, paymentProofSize: file.size }));
  }
  async function submit(event) {
    event.preventDefault();
    const result = await onCreateReservation({ ...values, areaId: selectedArea?.id || values.areaId, paymentMethod: acceptedMethods.includes(values.paymentMethod) ? values.paymentMethod : acceptedMethods[0] || values.paymentMethod });
    if (result) setShowCreate(false);
  }

  return (
    <div className="living-screen">
      <window.SectionTitle eyebrow="Calendario" title={title} body="Reservas, mantenimiento y cierres en una sola línea operativa." iconName="calendar" actions={<button className="living-button living-button-primary" onClick={() => { setValues((current) => ({ ...current, date: selectedDate })); setShowCreate(true); }}>Nueva reserva</button>} />
      {showCreate ? <window.FormPanel title="Crear reserva" description="La disponibilidad se valida contra políticas, reservas, mantenimiento y cierres." onCancel={() => setShowCreate(false)}><form className="living-form" onSubmit={submit}><label><span>Residente</span><select value={values.residentId} onChange={(event) => update("residentId", event.target.value)}>{data.residents.filter((item) => item.status === "active" && item.debt === 0).map((item) => <option key={item.id} value={item.id}>{item.name} · Dpto. {item.apartment}</option>)}</select></label><label><span>Área</span><select value={selectedArea?.id || ""} onChange={(event) => updateArea(event.target.value)}>{reservableAreas.map((area) => { const policy = window.livingSelectors.areaPolicyOnDate(area, values.date); return <option key={area.id} value={area.id}>{policy.name} · {window.livingFormatCurrency((policy.payment.amount || 0) + (policy.guarantee.amount || 0))}</option>; })}</select></label>{selectedPolicy ? <div className="living-form-hint">Disponible {selectedPolicy.availability.start}–{selectedPolicy.availability.end} · bloques de {selectedPolicy.availability.blockMinutes / 60} h · máximo {selectedPolicy.availability.maxDurationMinutes / 60} h</div> : null}<label><span>Fecha</span><input type="date" value={values.date} onChange={(event) => update("date", event.target.value)} required /></label><div className="living-form-columns"><label><span>Inicio</span><input type="time" value={values.start} onChange={(event) => update("start", event.target.value)} required /></label><label><span>Fin</span><input type="time" value={values.end} onChange={(event) => update("end", event.target.value)} required /></label></div><label><span>Invitados</span><input type="number" min="0" max={selectedPolicy?.capacity || undefined} value={values.guestCount} onChange={(event) => update("guestCount", event.target.value)} required /></label><label><span>Motivo</span><textarea value={values.reason} onChange={(event) => update("reason", event.target.value)} minLength="5" required /></label>{acceptedMethods.length ? <label><span>Método de pago</span><select value={acceptedMethods.includes(values.paymentMethod) ? values.paymentMethod : acceptedMethods[0]} onChange={(event) => update("paymentMethod", event.target.value)}>{acceptedMethods.map((method) => <option key={method}>{method}</option>)}</select></label> : null}{acceptedMethods.length ? <label><span>Comprobante</span><input type="file" accept="image/jpeg,image/png,application/pdf" onChange={chooseProof} /></label> : null}{fileError ? <div className="living-form-error">{fileError}</div> : null}<button className="living-button living-button-primary" disabled={!selectedPolicy || Boolean(pendingActions["create_reservation:new"]) || Boolean(fileError)}>Crear reserva</button></form></window.FormPanel> : null}
      <div className="living-calendar-toolbar">
        <div className="living-calendar-nav"><button type="button" className="living-button living-button-secondary" onClick={() => movePeriod(-1)} aria-label="Periodo anterior">Anterior</button><button type="button" className="living-button living-button-secondary" onClick={goToday}>Hoy (demo)</button><button type="button" className="living-button living-button-secondary" onClick={() => movePeriod(1)} aria-label="Periodo siguiente">Siguiente</button></div>
        <div className="living-segmented" aria-label="Vista del calendario"><button type="button" aria-pressed={view === "week"} className={view === "week" ? "is-active" : ""} onClick={() => setView("week")}>Semana</button><button type="button" aria-pressed={view === "month"} className={view === "month" ? "is-active" : ""} onClick={() => setView("month")}>Mes</button></div>
      </div>
      <div className="living-calendar-scroll-hint">Deslice horizontalmente para ver todos los días.</div>
      {view === "week" ? (
        <div className="living-card living-calendar-shell">
          <div className="living-calendar-week" role="grid" aria-label={`Semana ${title}`}>
            <div className="living-calendar-row" role="row">
              {weekDates.map((date) => {
                const dayEntries = entries.filter((entry) => entry.date === date);
                const dateLabel = calendarDateLabel(date, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
                return <section role="gridcell" className={`living-calendar-day ${date === selectedDate ? "is-selected" : ""}`} key={date}><button type="button" className="living-calendar-day-heading" aria-label={dateLabel} aria-pressed={date === selectedDate} aria-current={date === today ? "date" : undefined} onClick={() => selectDate(date)}><span>{calendarDateLabel(date, { weekday: "short" })}</span><strong>{calendarDateLabel(date, { day: "numeric" })}</strong></button><div className="living-calendar-day-events">{dayEntries.length ? dayEntries.map((entry) => <window.CalendarEventCard key={`${entry.type}-${entry.id}`} entry={entry} onOpenReservation={onOpenReservation} />) : <span className="living-calendar-empty-day">Sin actividad</span>}</div></section>;
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="living-card living-calendar-shell">
          <div className="living-calendar-month-weekdays" aria-hidden="true">{CALENDAR_WEEKDAYS.map((day) => <span key={day}>{day}</span>)}</div>
          <div className="living-calendar-month" role="grid" aria-label={title}>
            {monthRows.map((row, rowIndex) => <div className="living-calendar-row" role="row" key={`row-${rowIndex}`}>{row.map((date) => {
              const dayEntries = entries.filter((entry) => entry.date === date);
              const outside = !date.startsWith(monthPrefix);
              const dateLabel = calendarDateLabel(date, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
              return <section role="gridcell" className={`living-calendar-month-day ${outside ? "is-outside" : ""} ${date === selectedDate ? "is-selected" : ""}`} key={date}><button type="button" className="living-calendar-month-date" aria-label={dateLabel} aria-pressed={date === selectedDate} aria-current={date === today ? "date" : undefined} onClick={() => selectDate(date)}>{calendarDateLabel(date, { day: "numeric" })}</button><div className="living-calendar-month-events">{dayEntries.slice(0, 3).map((entry) => <window.CalendarEventCard compact key={`${entry.type}-${entry.id}`} entry={entry} onOpenReservation={onOpenReservation} />)}{dayEntries.length > 3 ? <button type="button" className="living-calendar-more" onClick={() => selectDate(date)}>+{dayEntries.length - 3} más</button> : null}</div></section>;
            })}</div>)}
          </div>
        </div>
      )}
      <div className="living-card living-calendar-agenda"><div className="living-card-header-row"><div><div className="living-card-label">Agenda del día</div><h3>{calendarDateLabel(selectedDate, { weekday: "long", day: "numeric", month: "long" })}</h3></div><span className="living-card-detail">{selectedEntries.length} eventos</span></div>{selectedEntries.length ? <div className="living-calendar-agenda-list">{selectedEntries.map((entry) => <window.CalendarEventCard key={`agenda-${entry.type}-${entry.id}`} entry={entry} onOpenReservation={onOpenReservation} />)}</div> : <div className="living-empty-state">No hay actividad programada.</div>}</div>
    </div>
  );
};

window.ApprovalsScreen = function ApprovalsScreen({ data, pendingActions, onApprove, onOpenReservation }) {
  const rows = data.reservations.filter((item) => item.status === "pending_approval");
  const recentlyApproved = window.livingSelectors.recentApprovals(data);
  return (
    <div className="living-screen">
      <window.SectionTitle eyebrow="Aprobaciones" title="Cola de revisión" body="Reservas pendientes de validación." iconName="approvals" />
      <div className="living-card">
        <window.DataTable
          columns={[
            { key: "code", label: "Reserva" },
            { key: "residentName", label: "Residente" },
            { key: "apartment", label: "Dpto." },
            { key: "areaName", label: "Área" },
            { key: "date", label: "Fecha", render: (row) => window.livingFormatShortDate(row.date) },
            { key: "guestCount", label: "Invitados" },
            { key: "paymentStatus", label: "Pago", render: (row) => <window.Badge status={row.paymentStatus} /> },
            {
              key: "actions",
              label: "Acciones",
              render: (row) => (
                <div className="living-inline-actions">
                  <button className="living-link-button" disabled={row.paymentStatus !== "verified" || Boolean(pendingActions[`approve_reservation:${row.id}`])} onClick={() => onApprove(row.id)}>
                    {row.paymentStatus !== "verified" ? "Verificar pago" : pendingActions[`approve_reservation:${row.id}`] ? "Aprobando…" : "Aprobar"}
                  </button>
                  <button className="living-link-button" onClick={() => onOpenReservation(row.id)}>Detalle</button>
                </div>
              ),
            },
          ]}
          rows={rows}
          empty="No hay reservas pendientes de aprobación."
        />
      </div>
      <div className="living-card">
        <div className="living-card-header-row">
          <div><div className="living-card-label">Aprobadas recientemente</div><h3>Últimas decisiones</h3></div>
          <span className="living-card-detail">{recentlyApproved.length} reservas</span>
        </div>
        <window.DataTable
          columns={[
            { key: "code", label: "Reserva" },
            { key: "residentName", label: "Residente" },
            { key: "apartment", label: "Dpto." },
            { key: "areaName", label: "Área" },
            { key: "date", label: "Fecha", render: (row) => window.livingFormatShortDate(row.date) },
            { key: "guestCount", label: "Invitados" },
            { key: "paymentStatus", label: "Pago", render: (row) => <window.Badge status={row.paymentStatus} /> },
            { key: "approval", label: "Aprobación", render: (row) => <span>{window.livingFormatDateTime(row.approvedAt)} · {row.approvedBy}</span> },
            { key: "actions", label: "Acciones", render: (row) => <button className="living-link-button" onClick={() => onOpenReservation(row.id)}>Abrir</button> },
          ]}
          rows={recentlyApproved}
          empty="Todavía no hay aprobaciones registradas."
        />
      </div>
    </div>
  );
};

window.PaymentsScreen = function PaymentsScreen({ data, pendingActions, onVerify, onReject, onResubmit, onOpenReservation }) {
  const [selected, setSelected] = React.useState(null);
  const [resubmitting, setResubmitting] = React.useState(null);
  const [proof, setProof] = React.useState(null);
  const [proofError, setProofError] = React.useState("");
  const [reason, setReason] = React.useState("");
  const collection = window.useLivingPagedRows(window.livingSelectors.payments(data), (item) => `${item.code} ${item.residentName} ${item.apartment} ${item.paymentMethod || ""}`, "submitted", "paymentStatus");
  const ledger = window.livingSelectors.paymentLedger(data).slice(0, 12);
  async function submitRejection(event) {
    event.preventDefault();
    if (reason.trim().length < 5) return;
    const result = await onReject(selected.id, reason);
    if (result) { setSelected(null); setReason(""); }
  }
  function chooseReplacement(event) {
    const file = event.target.files[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "application/pdf"].includes(file.type) || file.size > 5 * 1024 * 1024) { setProofError("Use JPG, PNG o PDF de hasta 5 MB."); setProof(null); return; }
    setProofError("");
    setProof({ paymentProofName: file.name, paymentProofType: file.type, paymentProofSize: file.size });
  }
  async function submitReplacement(event) {
    event.preventDefault();
    if (!proof) return;
    const result = await onResubmit(resubmitting.id, proof);
    if (result) { setResubmitting(null); setProof(null); }
  }
  return (
    <div className="living-screen">
      <window.SectionTitle eyebrow="Pagos" title="Comprobantes" body="Verificación manual con trazabilidad de cada decisión." iconName="payments" />
      {selected ? (
        <window.FormPanel title={`Rechazar ${selected.code}`} description="El motivo será visible en el historial operativo." onCancel={() => setSelected(null)}>
          <form className="living-form" onSubmit={submitRejection}>
            <label><span>Motivo</span><textarea value={reason} onChange={(event) => setReason(event.target.value)} required minLength="5" /></label>
            <button className="living-button living-button-primary" disabled={reason.trim().length < 5 || Boolean(pendingActions[`reject_payment:${selected.id}`])}>Confirmar rechazo</button>
          </form>
        </window.FormPanel>
      ) : null}
      {resubmitting ? <window.FormPanel title={`Nuevo comprobante · ${resubmitting.code}`} description="El comprobante rechazado se conserva en el historial." onCancel={() => { setResubmitting(null); setProof(null); setProofError(""); }}><form className="living-form" onSubmit={submitReplacement}><label><span>Comprobante</span><input type="file" accept="image/jpeg,image/png,application/pdf" onChange={chooseReplacement} required /></label>{proofError ? <div className="living-form-error">{proofError}</div> : null}<button className="living-button living-button-primary" disabled={!proof || Boolean(pendingActions[`resubmit_payment:${resubmitting.id}`])}>Registrar comprobante</button></form></window.FormPanel> : null}
      <div className="living-card">
        <window.CollectionToolbar query={collection.query} onQueryChange={collection.setQuery} placeholder="Reserva, residente o método" filter={collection.filter} onFilterChange={collection.setFilter} resultCount={collection.total} options={[{ value: "submitted", label: "Recibidos" }, { value: "all", label: "Todos" }, { value: "verified", label: "Verificados" }, { value: "rejected", label: "Rechazados" }]} />
        <window.DataTable
          columns={[
            { key: "paymentSubmittedAt", label: "Recibido", render: (row) => window.livingFormatDateTime(row.paymentSubmittedAt) },
            { key: "code", label: "Reserva" },
            { key: "residentName", label: "Residente" },
            { key: "amount", label: "Monto", render: (row) => window.livingFormatCurrency(row.amount) },
            { key: "paymentStatus", label: "Estado", render: (row) => <window.Badge status={row.paymentStatus} /> },
            { key: "summary", label: "Detalle", render: (row) => `${row.paymentMethod || "Transferencia"}${row.paymentProof ? ` · ${row.paymentProof.name}` : ""}` },
            { key: "actions", label: "Acciones", render: (row) => <div className="living-inline-actions">{row.paymentStatus === "submitted" ? <><button className="living-link-button" disabled={Boolean(pendingActions[`verify_payment:${row.id}`])} onClick={() => window.confirm(`¿Verificar el pago de ${row.code}?`) && onVerify(row.id)}>Verificar</button><button className="living-link-button" onClick={() => setSelected(row)}>Rechazar</button></> : null}{row.paymentStatus === "rejected" ? <button className="living-link-button" onClick={() => setResubmitting(row)}>Nuevo comprobante</button> : null}<button className="living-link-button" onClick={() => onOpenReservation(row.id)}>Abrir</button></div> },
          ]}
          rows={collection.rows}
          empty="No hay comprobantes con estos filtros."
        />
        <window.Pagination page={collection.page} pageCount={collection.pageCount} onPageChange={collection.setPage} />
      </div>
      <div className="living-card"><div className="living-card-label">Libro de pagos y reembolsos</div><window.DataTable columns={[{ key: "createdAt", label: "Fecha", render: (row) => window.livingFormatDateTime(row.createdAt) }, { key: "reservationCode", label: "Reserva" }, { key: "type", label: "Movimiento", render: (row) => ({ payment_submitted: "Pago recibido", payment_resubmitted: "Comprobante reemplazado", payment_verified: "Pago verificado", payment_rejected: "Pago rechazado", refund_pending: "Reembolso pendiente", refund_completed: "Reembolso completado" }[row.type] || row.type) }, { key: "amount", label: "Monto", render: (row) => window.livingFormatCurrency(row.amount) }, { key: "status", label: "Estado", render: (row) => <window.Badge status={row.status} /> }, { key: "actor", label: "Actor" }]} rows={ledger} /></div>
    </div>
  );
};

window.DepositsScreen = function DepositsScreen({ data, role, pendingActions, onRelease, onRetain, onOpenReservation }) {
  const [selected, setSelected] = React.useState(null);
  const [amount, setAmount] = React.useState("");
  const [reason, setReason] = React.useState("");
  const collection = window.useLivingPagedRows(window.livingSelectors.deposits(data), (item) => `${item.code} ${item.residentName} ${item.areaName}`, "", "depositStatus");
  const ledger = window.livingSelectors.depositLedger(data).slice(0, 12);
  async function submitRetention(event) {
    event.preventDefault();
    const result = await onRetain(selected.id, amount, reason);
    if (result) { setSelected(null); setAmount(""); setReason(""); }
  }
  function renderActions(row) {
    const canResolve = row.status === "completed" && ["held", "retained"].includes(row.depositStatus);
    const requiresAdmin = row.depositStatus === "retained" && role !== "building_admin";
    return (
      <div className="living-inline-actions">
        {role !== "junta" && canResolve && !requiresAdmin ? <button className="living-link-button" disabled={Boolean(pendingActions[`release_deposit:${row.id}`])} onClick={() => window.confirm(`¿Liberar la garantía de ${row.code}?`) && onRelease(row.id)}>Liberar</button> : null}
        {role === "building_admin" && canResolve ? <button className="living-link-button" onClick={() => setSelected(row)}>Retener</button> : null}
        {role !== "junta" && !canResolve ? <span className="living-table-note">Esperando cierre</span> : null}
        {role !== "junta" && requiresAdmin ? <span className="living-table-note">Requiere administrador</span> : null}
        <button className="living-link-button" onClick={() => onOpenReservation(row.id)}>Abrir</button>
      </div>
    );
  }
  return (
    <div className="living-screen">
      <window.SectionTitle eyebrow="Garantías" title="Retenciones y liberaciones" iconName="deposits" />
      {selected ? <window.FormPanel title={`Retener garantía · ${selected.code}`} onCancel={() => setSelected(null)}><form className="living-form" onSubmit={submitRetention}><label><span>Monto</span><input type="number" min="1" value={amount} onChange={(event) => setAmount(event.target.value)} required /></label><label><span>Motivo</span><textarea value={reason} onChange={(event) => setReason(event.target.value)} required minLength="5" /></label><button className="living-button living-button-primary" disabled={Boolean(pendingActions[`retain_deposit:${selected.id}`])}>Registrar retención</button></form></window.FormPanel> : null}
      <div className="living-card">
        <window.CollectionToolbar query={collection.query} onQueryChange={collection.setQuery} placeholder="Reserva, residente o área" filter={collection.filter} onFilterChange={collection.setFilter} resultCount={collection.total} options={[{ value: "all", label: "Todas" }, { value: "held", label: "En garantía" }, { value: "retained", label: "Retenidas" }, { value: "released", label: "Liberadas" }]} />
        <window.DataTable
          columns={[
            { key: "code", label: "Reserva" },
            { key: "residentName", label: "Residente" },
            { key: "areaName", label: "Área" },
            { key: "depositStatus", label: "Estado", render: (row) => <window.Badge status={row.depositStatus} /> },
            { key: "status", label: "Reserva", render: (row) => <window.Badge status={row.status} /> },
            { key: "impact", label: "Observación", render: (row) => row.code === "EVR-2026-0712-0007" ? "Retener S/ 80 por silla dañada" : "Pendiente cierre operativo" },
            { key: "actions", label: "Acciones", render: renderActions },
          ]}
          rows={collection.rows}
          empty="No hay garantías con estos filtros."
        />
        <window.Pagination page={collection.page} pageCount={collection.pageCount} onPageChange={collection.setPage} />
      </div>
      <div className="living-card"><div className="living-card-label">Libro de garantías</div><window.DataTable columns={[{ key: "createdAt", label: "Fecha", render: (row) => window.livingFormatDateTime(row.createdAt) }, { key: "reservationCode", label: "Reserva" }, { key: "type", label: "Movimiento", render: (row) => ({ deposit_held: "Garantía recibida", deposit_released: "Garantía liberada", deposit_refunded: "Garantía reembolsada", deposit_retained: "Garantía retenida" }[row.type] || row.type) }, { key: "amount", label: "Monto", render: (row) => window.livingFormatCurrency(row.amount) }, { key: "status", label: "Estado", render: (row) => <window.Badge status={row.status} /> }, { key: "reason", label: "Motivo", render: (row) => row.reason || "Sin observación" }]} rows={ledger} /></div>
    </div>
  );
};

const AREA_MONTHS = [{ value: 1, label: "Ene" }, { value: 2, label: "Feb" }, { value: 3, label: "Mar" }, { value: 4, label: "Abr" }, { value: 5, label: "May" }, { value: 6, label: "Jun" }, { value: 7, label: "Jul" }, { value: 8, label: "Ago" }, { value: 9, label: "Sep" }, { value: 10, label: "Oct" }, { value: 11, label: "Nov" }, { value: 12, label: "Dic" }];
const AREA_WEEKDAYS = [{ value: 1, label: "Lun" }, { value: 2, label: "Mar" }, { value: 3, label: "Mié" }, { value: 4, label: "Jue" }, { value: 5, label: "Vie" }, { value: 6, label: "Sáb" }, { value: 0, label: "Dom" }];
const AREA_PAYMENT_METHODS = ["Yape", "Plin", "Transferencia", "Efectivo"];

window.AreaPolicyForm = function AreaPolicyForm({ area, values, setValues, pending, onSubmit, onCancel }) {
  function update(key, value) { setValues((current) => ({ ...current, [key]: value })); }
  function toggleList(key, value) { setValues((current) => ({ ...current, [key]: current[key].includes(value) ? current[key].filter((item) => item !== value) : [...current[key], value] })); }
  return (
    <window.FormPanel title={`Nueva política · ${area.name}`} description="Los cambios se aplican desde la fecha indicada. Las reservas existentes conservan sus condiciones." onCancel={onCancel}>
      <form className="living-form" onSubmit={onSubmit}>
        <div className="living-form-section"><div className="living-card-label">Identidad y estado</div><div className="living-form-columns"><label><span>Nombre</span><input value={values.name} onChange={(event) => update("name", event.target.value)} required /></label><label><span>Ubicación</span><input value={values.location} onChange={(event) => update("location", event.target.value)} required /></label></div><div className="living-form-columns"><label><span>Vigente desde</span><input type="date" min="2026-07-17" value={values.effectiveFrom} onChange={(event) => update("effectiveFrom", event.target.value)} required /></label><label><span>Estado desde vigencia</span><select value={values.status} onChange={(event) => update("status", event.target.value)}><option value="active">Activa</option><option value="closed">Cerrada</option></select></label></div>{values.status === "closed" ? <label><span>Mensaje de cierre</span><textarea value={values.closureReason} onChange={(event) => update("closureReason", event.target.value)} placeholder="Motivo opcional visible para administración" /></label> : null}<label className="living-check-row"><input type="checkbox" checked={values.reservable} onChange={(event) => update("reservable", event.target.checked)} /><span>Permitir reservas</span></label></div>
        <div className="living-form-section"><div className="living-card-label">Reglas y capacidad</div><label><span>Capacidad</span><input type="number" min="1" value={values.capacity} onChange={(event) => update("capacity", event.target.value)} required /></label><label><span>Reglas · una por línea</span><textarea value={values.rules} onChange={(event) => update("rules", event.target.value)} required /></label></div>
        <div className="living-form-section"><div className="living-card-label">Cobros</div><label className="living-check-row"><input type="checkbox" checked={values.paymentEnabled} onChange={(event) => update("paymentEnabled", event.target.checked)} /><span>Tarifa de reserva</span></label>{values.paymentEnabled ? <><label><span>Monto</span><input type="number" min="0" value={values.reservationFee} onChange={(event) => update("reservationFee", event.target.value)} required /></label><div><span className="living-field-label">Métodos aceptados</span><div className="living-choice-grid">{AREA_PAYMENT_METHODS.map((method) => <label className="living-check-row" key={`payment-${method}`}><input type="checkbox" checked={values.paymentMethods.includes(method)} onChange={() => toggleList("paymentMethods", method)} /><span>{method}</span></label>)}</div></div></> : null}<label className="living-check-row"><input type="checkbox" checked={values.guaranteeEnabled} onChange={(event) => update("guaranteeEnabled", event.target.checked)} /><span>Garantía</span></label>{values.guaranteeEnabled ? <><label><span>Monto</span><input type="number" min="0" value={values.deposit} onChange={(event) => update("deposit", event.target.value)} required /></label><div><span className="living-field-label">Métodos aceptados</span><div className="living-choice-grid">{AREA_PAYMENT_METHODS.map((method) => <label className="living-check-row" key={`guarantee-${method}`}><input type="checkbox" checked={values.guaranteeMethods.includes(method)} onChange={() => toggleList("guaranteeMethods", method)} /><span>{method}</span></label>)}</div></div></> : null}</div>
        <div className="living-form-section"><div className="living-card-label">Disponibilidad</div><span className="living-field-label">Meses</span><div className="living-choice-grid living-choice-grid-months">{AREA_MONTHS.map((month) => <label className="living-check-row" key={month.value}><input type="checkbox" checked={values.months.includes(month.value)} onChange={() => toggleList("months", month.value)} /><span>{month.label}</span></label>)}</div><span className="living-field-label">Días</span><div className="living-choice-grid">{AREA_WEEKDAYS.map((day) => <label className="living-check-row" key={day.value}><input type="checkbox" checked={values.weekdays.includes(day.value)} onChange={() => toggleList("weekdays", day.value)} /><span>{day.label}</span></label>)}</div><div className="living-form-columns"><label><span>Desde</span><input type="time" value={values.availabilityStart} onChange={(event) => update("availabilityStart", event.target.value)} required /></label><label><span>Hasta</span><input type="time" value={values.availabilityEnd} onChange={(event) => update("availabilityEnd", event.target.value)} required /></label></div><div className="living-form-columns"><label><span>Bloques</span><select value={values.blockMinutes} onChange={(event) => update("blockMinutes", event.target.value)}><option value="60">1 hora</option><option value="120">2 horas</option><option value="180">3 horas</option></select></label><label><span>Duración máxima</span><select value={values.maxDurationMinutes} onChange={(event) => update("maxDurationMinutes", event.target.value)}><option value="120">2 horas</option><option value="240">4 horas</option><option value="360">6 horas</option><option value="480">8 horas</option></select></label></div></div>
        <div className="living-form-section"><div className="living-card-label">Requisitos</div><label className="living-check-row"><input type="checkbox" checked={values.requiresGuestList} onChange={(event) => update("requiresGuestList", event.target.checked)} /><span>Lista de invitados obligatoria</span></label><label className="living-check-row"><input type="checkbox" checked={values.requiresApproval} onChange={(event) => update("requiresApproval", event.target.checked)} /><span>Aprobación administrativa</span></label></div>
        <button className="living-button living-button-primary" disabled={pending}>Programar política</button>
      </form>
    </window.FormPanel>
  );
};

window.AreasScreen = function AreasScreen({ data, pendingActions, onUpdate, onCreateMaintenance, onRemoveMaintenance, onCreateClosure, onRemoveClosure }) {
  const [selected, setSelected] = React.useState(null);
  const [showMaintenance, setShowMaintenance] = React.useState(false);
  const [showClosure, setShowClosure] = React.useState(false);
  const [maintenance, setMaintenance] = React.useState({ areaId: "bbq", date: "2026-07-23", start: "08:00", end: "12:00", reason: "Mantenimiento preventivo" });
  const [closure, setClosure] = React.useState({ areaId: "terrace", date: "2026-07-23", start: "08:00", end: "12:00", reason: "Cierre administrativo" });
  const [values, setValues] = React.useState(null);
  function open(area) {
    const policy = [...area.policyVersions].sort((a, b) => b.version - a.version)[0];
    setSelected(area);
    setValues({ name: policy.name, location: policy.location, effectiveFrom: "2026-07-23", status: policy.status, closureReason: policy.closureReason || "", reservable: policy.reservable, capacity: String(policy.capacity), rules: policy.rules.join("\n"), paymentEnabled: policy.payment.enabled, reservationFee: String(policy.payment.amount), paymentMethods: [...policy.payment.methods], guaranteeEnabled: policy.guarantee.enabled, deposit: String(policy.guarantee.amount), guaranteeMethods: [...policy.guarantee.methods], months: [...policy.availability.months], weekdays: [...policy.availability.weekdays], availabilityStart: policy.availability.start, availabilityEnd: policy.availability.end, blockMinutes: String(policy.availability.blockMinutes), maxDurationMinutes: String(policy.availability.maxDurationMinutes), requiresGuestList: policy.requirements.guestList, requiresApproval: policy.requirements.approval });
  }
  async function submit(event) {
    event.preventDefault();
    const result = await onUpdate(selected.id, values);
    if (result) setSelected(null);
  }
  async function submitMaintenance(event) {
    event.preventDefault();
    const result = await onCreateMaintenance(maintenance);
    if (result) setShowMaintenance(false);
  }
  async function submitClosure(event) {
    event.preventDefault();
    const result = await onCreateClosure(closure);
    if (result) setShowClosure(false);
  }
  return (
    <div className="living-screen">
      <window.SectionTitle eyebrow="Áreas comunes" title="Políticas y disponibilidad" iconName="areas" actions={<div className="living-inline-actions"><button className="living-button living-button-secondary" onClick={() => setShowClosure(true)}>Programar cierre</button><button className="living-button living-button-primary" onClick={() => setShowMaintenance(true)}>Programar mantenimiento</button></div>} />
      {selected && values ? <window.AreaPolicyForm area={selected} values={values} setValues={setValues} pending={Boolean(pendingActions[`update_area:${selected.id}`])} onSubmit={submit} onCancel={() => setSelected(null)} /> : null}
      {showMaintenance ? <window.FormPanel title="Programar mantenimiento" description="No puede cruzarse con una reserva o bloqueo activo." onCancel={() => setShowMaintenance(false)}><form className="living-form" onSubmit={submitMaintenance}><label><span>Área</span><select value={maintenance.areaId} onChange={(event) => setMaintenance((current) => ({ ...current, areaId: event.target.value }))}>{data.areas.map((area) => <option key={area.id} value={area.id}>{area.name}</option>)}</select></label><label><span>Fecha</span><input type="date" value={maintenance.date} onChange={(event) => setMaintenance((current) => ({ ...current, date: event.target.value }))} required /></label><div className="living-form-columns"><label><span>Inicio</span><input type="time" value={maintenance.start} onChange={(event) => setMaintenance((current) => ({ ...current, start: event.target.value }))} required /></label><label><span>Fin</span><input type="time" value={maintenance.end} onChange={(event) => setMaintenance((current) => ({ ...current, end: event.target.value }))} required /></label></div><label><span>Motivo</span><textarea value={maintenance.reason} onChange={(event) => setMaintenance((current) => ({ ...current, reason: event.target.value }))} minLength="5" required /></label><button className="living-button living-button-primary" disabled={Boolean(pendingActions[`create_maintenance:${maintenance.areaId}`])}>Programar</button></form></window.FormPanel> : null}
      {showClosure ? <window.FormPanel title="Programar cierre" description="Los cierres administrativos se reportan separados del mantenimiento." onCancel={() => setShowClosure(false)}><form className="living-form" onSubmit={submitClosure}><label><span>Área</span><select value={closure.areaId} onChange={(event) => setClosure((current) => ({ ...current, areaId: event.target.value }))}>{data.areas.map((area) => <option key={area.id} value={area.id}>{area.name}</option>)}</select></label><label><span>Fecha</span><input type="date" value={closure.date} onChange={(event) => setClosure((current) => ({ ...current, date: event.target.value }))} required /></label><div className="living-form-columns"><label><span>Inicio</span><input type="time" value={closure.start} onChange={(event) => setClosure((current) => ({ ...current, start: event.target.value }))} required /></label><label><span>Fin</span><input type="time" value={closure.end} onChange={(event) => setClosure((current) => ({ ...current, end: event.target.value }))} required /></label></div><label><span>Motivo</span><textarea value={closure.reason} onChange={(event) => setClosure((current) => ({ ...current, reason: event.target.value }))} minLength="5" required /></label><button className="living-button living-button-primary" disabled={Boolean(pendingActions[`create_area_closure:${closure.areaId}`])}>Programar cierre</button></form></window.FormPanel> : null}
      <div className="living-grid living-card-grid">
        {data.areas.map((area) => { const policy = [...area.policyVersions].sort((a, b) => b.version - a.version)[0]; return (
          <div className="living-card" key={area.id}>
            <div className="living-card-label">{policy.location} · Política v{policy.version}</div>
            <h3>{policy.name}</h3>
            <p>Capacidad {policy.capacity} · Tarifa {window.livingFormatCurrency(policy.payment.amount)} · Garantía {window.livingFormatCurrency(policy.guarantee.amount)}</p>
            <p>{policy.availability.start}–{policy.availability.end} · bloques de {policy.availability.blockMinutes / 60} h · desde {window.livingFormatShortDate(policy.effectiveFrom)}</p>
            <div className="living-tag-row">
              {policy.status === "closed" ? <window.Badge status="blocked" label="Área cerrada" /> : policy.requirements.approval ? <window.Badge status="pending_approval" label="Requiere aprobación" /> : <window.Badge status="active" label="Aprobación automática" />}
              {policy.requirements.guestList ? <window.Badge status="active" label="Lista obligatoria" /> : null}
            </div>
            <ul className="living-list compact">
              {policy.rules.map((rule) => <li key={rule}>{rule}</li>)}
            </ul>
            <button className="living-button living-button-secondary" onClick={() => open(area)}>Nueva versión</button>
          </div>
        ); })}
      </div>
      <div className="living-card"><div className="living-card-label">Bloqueos de mantenimiento</div><window.DataTable columns={[{ key: "date", label: "Fecha", render: (row) => window.livingFormatShortDate(row.date) }, { key: "areaName", label: "Área" }, { key: "schedule", label: "Horario", render: (row) => `${row.start}–${row.end}` }, { key: "reason", label: "Motivo" }, { key: "status", label: "Estado", render: (row) => <window.Badge status={row.status} /> }, { key: "actions", label: "Acciones", render: (row) => row.status === "active" ? <button className="living-link-button" disabled={Boolean(pendingActions[`remove_maintenance:${row.id}`])} onClick={() => window.confirm("¿Cancelar este mantenimiento?") && onRemoveMaintenance(row.id)}>Cancelar bloqueo</button> : "Cancelado" }]} rows={data.maintenanceBlocks} /></div>
      <div className="living-card"><div className="living-card-label">Cierres administrativos</div><window.DataTable columns={[{ key: "date", label: "Fecha", render: (row) => window.livingFormatShortDate(row.date) }, { key: "areaName", label: "Área" }, { key: "schedule", label: "Horario", render: (row) => `${row.start}–${row.end}` }, { key: "reason", label: "Motivo" }, { key: "status", label: "Estado", render: (row) => <window.Badge status={row.status} /> }, { key: "actions", label: "Acciones", render: (row) => row.status === "active" ? <button className="living-link-button" disabled={Boolean(pendingActions[`remove_area_closure:${row.id}`])} onClick={() => window.confirm("¿Cancelar este cierre?") && onRemoveClosure(row.id)}>Cancelar cierre</button> : "Cancelado" }]} rows={data.areaClosures} /></div>
    </div>
  );
};

window.ResidentsScreen = function ResidentsScreen({ data, pendingActions, onUpdate }) {
  const [selected, setSelected] = React.useState(null);
  const [phone, setPhone] = React.useState("");
  const [status, setStatus] = React.useState("active");
  const collection = window.useLivingPagedRows(data.residents, (item) => `${item.name} ${item.apartment} ${item.phone}`, "", "status", 10);
  function open(resident) { setSelected(resident); setPhone(resident.phone); setStatus(resident.status); }
  async function submit(event) {
    event.preventDefault();
    const result = await onUpdate(selected.id, { phone, status });
    if (result) setSelected(null);
  }
  return (
    <div className="living-screen">
      <window.SectionTitle eyebrow="Residentes" title="Base del edificio" iconName="residents" />
      {selected ? <window.FormPanel title={`Editar ${selected.name}`} onCancel={() => setSelected(null)}><form className="living-form" onSubmit={submit}><label><span>WhatsApp</span><input value={phone} onChange={(event) => setPhone(event.target.value)} pattern="\+51 9[0-9]{2} [0-9]{3} [0-9]{3}" required /></label><label><span>Estado</span><select value={status} onChange={(event) => setStatus(event.target.value)}><option value="active">Activo</option><option value="blocked">Bloqueado</option></select></label><button className="living-button living-button-primary" disabled={Boolean(pendingActions[`update_resident:${selected.id}`])}>Guardar residente</button></form></window.FormPanel> : null}
      <div className="living-card">
        <window.CollectionToolbar query={collection.query} onQueryChange={collection.setQuery} placeholder="Nombre, departamento o teléfono" filter={collection.filter} onFilterChange={collection.setFilter} resultCount={collection.total} options={[{ value: "all", label: "Todos" }, { value: "active", label: "Activos" }, { value: "blocked", label: "Bloqueados" }]} />
        <window.DataTable
          columns={[
            { key: "apartment", label: "Dpto." },
            { key: "tower", label: "Torre" },
            { key: "name", label: "Residente" },
            { key: "phone", label: "WhatsApp" },
            { key: "status", label: "Estado", render: (row) => <window.Badge status={row.status} /> },
            { key: "debt", label: "Deuda", render: (row) => row.debt ? window.livingFormatCurrency(row.debt) : "Al día" },
            { key: "actions", label: "Acciones", render: (row) => <button className="living-link-button" onClick={() => open(row)}>Editar</button> },
          ]}
          rows={collection.rows}
        />
        <window.Pagination page={collection.page} pageCount={collection.pageCount} onPageChange={collection.setPage} />
      </div>
    </div>
  );
};

window.SecurityScreen = function SecurityScreen({ data, pendingActions, onMarkArrival, onVerifyGuests, onMarkNoShow }) {
  const reservation = data.reservations.find((item) => item.id === "TRL-2026-0718-0024");
  const canOperate = ["approved", "confirmed"].includes(reservation.status);
  return (
    <div className="living-screen">
      <window.SectionTitle eyebrow="Seguridad" title="Vista diaria" iconName="security" />
      <div className="living-dashboard-columns">
        <div className="living-card">
          <div className="living-card-label">Reserva destacada</div>
          <h3>{reservation.code}</h3>
          <p>{reservation.residentName} · Dpto. {reservation.apartment} · {reservation.areaName}</p>
          <p>{reservation.start}–{reservation.end} · {reservation.guestCount} invitados</p>
          <div className="living-tag-row">
            <window.Badge status={reservation.status} />
            <window.Badge status={reservation.securityResidentArrived ? "approved" : "pending"} label={reservation.securityResidentArrived ? "Residente llegó" : "Falta llegada"} />
            <window.Badge status={reservation.securityGuestsVerified ? "approved" : "pending"} label={reservation.securityGuestsVerified ? "Invitados verificados" : "Falta verificación"} />
          </div>
          <div className="living-inline-actions">
            <button className="living-button living-button-secondary" disabled={!canOperate || reservation.securityResidentArrived || Boolean(pendingActions[`mark_arrival:${reservation.id}`])} onClick={() => onMarkArrival(reservation.id)}>
              {!canOperate ? "Esperando aprobación" : pendingActions[`mark_arrival:${reservation.id}`] ? "Registrando…" : reservation.securityResidentArrived ? "Llegada registrada" : "Marcar llegada"}
            </button>
            <button className="living-button living-button-primary" disabled={!canOperate || reservation.securityGuestsVerified || Boolean(pendingActions[`verify_guests:${reservation.id}`])} onClick={() => onVerifyGuests(reservation.id)}>
              {!canOperate ? "Esperando aprobación" : pendingActions[`verify_guests:${reservation.id}`] ? "Verificando…" : reservation.securityGuestsVerified ? "Invitados verificados" : "Verificar invitados"}
            </button>
            {canOperate ? <button className="living-button living-button-secondary" disabled={Boolean(pendingActions[`mark_no_show:${reservation.id}`])} onClick={() => window.confirm("¿Registrar que el residente no se presentó?") && onMarkNoShow(reservation.id)}>No se presentó</button> : null}
          </div>
        </div>
        <div className="living-card">
          <div className="living-card-label">Lista de invitados</div>
          <ol className="living-ordered-list">
            {reservation.guestList.slice(0, 10).map((guest) => <li key={guest}>{guest}</li>)}
          </ol>
          <div className="living-card-detail">{reservation.guestList.length} invitados registrados</div>
        </div>
      </div>
    </div>
  );
};

window.CleaningScreen = function CleaningScreen({ data, pendingActions, onCompleteTask }) {
  function canComplete(task) {
    const reservation = data.reservations.find((item) => item.id === task.reservationId);
    if (!reservation || !["approved", "confirmed", "completed"].includes(reservation.status)) return false;
    return task.type !== "Limpieza post evento" || (reservation.securityResidentArrived && reservation.securityGuestsVerified);
  }
  return (
    <div className="living-screen">
      <window.SectionTitle eyebrow="Limpieza" title="Tareas del equipo" iconName="cleaning" />
      <div className="living-grid living-card-grid">
        {data.tasks.map((task) => (
          <div className="living-card" key={task.id}>
            <div className="living-card-label">{task.type}</div>
            <h3>{task.areaName}</h3>
            <p>{window.livingFormatDateTime(task.dueTime)}</p>
            <window.Badge status={task.status} />
            <ul className="living-list compact">
              {task.checklist.map((item) => (
                <li key={item}>{task.completedItems.includes(item) ? "●" : "○"} {item}</li>
              ))}
            </ul>
            {task.status !== "completed" ? (
              <button className="living-button living-button-primary" disabled={!canComplete(task) || Boolean(pendingActions[`complete_task:${task.id}`])} onClick={() => onCompleteTask(task.id)}>
                {!canComplete(task) ? "Esperando operación" : pendingActions[`complete_task:${task.id}`] ? "Guardando…" : "Completar checklist"}
              </button>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
};

window.IncidentsScreen = function IncidentsScreen({ data, role, pendingActions, onCreate, onResolve }) {
  const [showCreate, setShowCreate] = React.useState(false);
  const [resolutionIncident, setResolutionIncident] = React.useState(null);
  const [resolution, setResolution] = React.useState("");
  const [values, setValues] = React.useState({ reservationId: "TRL-2026-0718-0024", incidentType: "", description: "", estimatedCost: "", evidenceName: "" });
  const [fileError, setFileError] = React.useState("");
  const collection = window.useLivingPagedRows(data.incidents, (item) => `${item.type} ${item.residentName} ${item.reservationCode} ${item.description}`, "", "status", 6);
  function chooseFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "application/pdf"].includes(file.type) || file.size > 5 * 1024 * 1024) { setFileError("Use JPG, PNG o PDF de hasta 5 MB."); return; }
    setFileError("");
    setValues((current) => ({ ...current, evidenceName: file.name }));
  }
  async function submitIncident(event) {
    event.preventDefault();
    const result = await onCreate(values);
    if (result) { setShowCreate(false); setValues({ reservationId: "TRL-2026-0718-0024", incidentType: "", description: "", estimatedCost: "", evidenceName: "" }); }
  }
  async function submitResolution(event) {
    event.preventDefault();
    const result = await onResolve(resolutionIncident.id, resolution);
    if (result) { setResolutionIncident(null); setResolution(""); }
  }
  return (
    <div className="living-screen">
      <window.SectionTitle eyebrow="Incidentes" title="Trazabilidad operativa" iconName="incidents" actions={role !== "junta" ? <button className="living-button living-button-primary" onClick={() => setShowCreate(true)}>Nuevo incidente</button> : null} />
      {showCreate ? <window.FormPanel title="Registrar incidente" description="La evidencia queda simulada localmente hasta conectar almacenamiento." onCancel={() => setShowCreate(false)}><form className="living-form" onSubmit={submitIncident}><label><span>Reserva</span><select value={values.reservationId} onChange={(event) => setValues((current) => ({ ...current, reservationId: event.target.value }))}>{data.reservations.slice(0, 20).map((item) => <option key={item.id} value={item.id}>{item.code} · {item.areaName}</option>)}</select></label><label><span>Tipo</span><input value={values.incidentType} onChange={(event) => setValues((current) => ({ ...current, incidentType: event.target.value }))} required /></label><label><span>Descripción</span><textarea value={values.description} onChange={(event) => setValues((current) => ({ ...current, description: event.target.value }))} minLength="10" required /></label><label><span>Costo estimado</span><input type="number" min="0" value={values.estimatedCost} onChange={(event) => setValues((current) => ({ ...current, estimatedCost: event.target.value }))} /></label><label><span>Evidencia</span><input type="file" accept="image/jpeg,image/png,application/pdf" onChange={chooseFile} /></label>{fileError ? <div className="living-form-error">{fileError}</div> : null}<button className="living-button living-button-primary" disabled={Boolean(pendingActions[`create_incident:${values.reservationId}`]) || Boolean(fileError)}>Registrar incidente</button></form></window.FormPanel> : null}
      {resolutionIncident ? <window.FormPanel title={`Resolver ${resolutionIncident.type}`} onCancel={() => setResolutionIncident(null)}><form className="living-form" onSubmit={submitResolution}><label><span>Resolución</span><textarea value={resolution} onChange={(event) => setResolution(event.target.value)} minLength="5" required /></label><button className="living-button living-button-primary" disabled={Boolean(pendingActions[`resolve_incident:${resolutionIncident.id}`])}>Cerrar incidente</button></form></window.FormPanel> : null}
      <div className="living-card"><window.CollectionToolbar query={collection.query} onQueryChange={collection.setQuery} placeholder="Tipo, reserva o residente" filter={collection.filter} onFilterChange={collection.setFilter} resultCount={collection.total} options={[{ value: "all", label: "Todos" }, { value: "open", label: "Abiertos" }, { value: "pending_resolution", label: "Pendientes" }, { value: "resolved", label: "Resueltos" }]} /></div>
      <div className="living-grid living-card-grid">
        {collection.rows.map((incident) => (
          <div className="living-card" key={incident.id}>
            <div className="living-card-label">{incident.reservationCode}</div>
            <h3>{incident.type}</h3>
            <p>{incident.areaName} · {incident.residentName} · Dpto. {incident.apartment}</p>
            <p>{incident.description}</p>
            <div className="living-tag-row">
              <window.Badge status={incident.status} />
              <window.Badge status={incident.estimatedCost > 0 ? "retained" : "open"} label={incident.depositImpact} />
            </div>
            {role === "building_admin" && incident.status !== "resolved" ? <button className="living-button living-button-secondary" onClick={() => setResolutionIncident(incident)}>Resolver</button> : null}
          </div>
        ))}
      </div>
      {!collection.rows.length ? <div className="living-empty-state">No hay incidentes con estos filtros.</div> : null}
      <window.Pagination page={collection.page} pageCount={collection.pageCount} onPageChange={collection.setPage} />
    </div>
  );
};

window.ReportsScreen = function ReportsScreen({ data }) {
  const report = window.livingSelectors.report(data);
  return (
    <div className="living-screen">
      <window.SectionTitle eyebrow="Reportes" title={`Resumen ${report.month}`} iconName="reports" />
      <div className="living-grid living-kpis">
        <window.MetricCard label="Reservas" value={report.totalReservations} detail="Totales del mes" />
        <window.MetricCard label="Ingresos" value={window.livingFormatCurrency(report.totalRevenue)} detail="Áreas cobradas" />
        <window.MetricCard label="Incidentes" value={report.totalIncidents} detail="Registrados en el sistema" />
        <window.MetricCard label="Satisfacción" value={`${report.satisfaction} / 5`} detail="Promedio de residentes" />
      </div>
      <div className="living-dashboard-columns">
        <div className="living-card">
          <div className="living-card-label">Reservas por área</div>
          <ul className="living-list">
            {report.reservationsByArea.map((item) => <li key={item.area}>{item.area}: <strong>{item.total}</strong></li>)}
          </ul>
        </div>
        <div className="living-card">
          <div className="living-card-label">Ingresos</div>
          <ul className="living-list">
            {report.revenueByArea.map((item) => <li key={item.area}>{item.area}: <strong>{window.livingFormatCurrency(item.total)}</strong></li>)}
          </ul>
        </div>
      </div>
    </div>
  );
};

window.AuditScreen = function AuditScreen({ data, role }) {
  const entries = window.livingSelectors.audit(data, role);
  const collection = window.useLivingPagedRows(entries, (item) => `${item.label} ${item.entityType} ${item.actorName || ""} ${item.detail || ""}`, "", "actorRole", 10);
  return (
    <div className="living-screen">
      <window.SectionTitle eyebrow="Auditoría" title="Historial de acciones" body={role === "junta" ? "Resumen de cambios operativos. Los datos personales del actor están ocultos." : "Registro inmutable de decisiones y cambios sensibles de la demo."} iconName="reports" />
      <div className="living-card">
        <window.CollectionToolbar query={collection.query} onQueryChange={collection.setQuery} placeholder="Acción, entidad o actor" filter={collection.filter} onFilterChange={collection.setFilter} resultCount={collection.total} options={role === "junta" ? [] : [{ value: "all", label: "Todos los roles" }, ...Object.entries(window.LIVING_ROLE_LABELS).map(([value, label]) => ({ value, label }))]} />
        <window.DataTable columns={[
          { key: "createdAt", label: "Fecha", render: (row) => window.livingFormatDateTime(row.createdAt) },
          { key: "label", label: "Acción" },
          { key: "entityType", label: "Entidad" },
          { key: "actorName", label: "Actor", render: (row) => row.actorName || "Oculto para Junta" },
          { key: "detail", label: "Detalle", render: (row) => row.detail || "Sin observación" },
        ]} rows={collection.rows} empty="Todavía no hay acciones auditadas." />
        <window.Pagination page={collection.page} pageCount={collection.pageCount} onPageChange={collection.setPage} />
      </div>
    </div>
  );
};

window.MessagesScreen = function MessagesScreen({ data }) {
  return (
    <div className="living-screen">
      <window.SectionTitle eyebrow="Mensajes" title="Actividad de WhatsApp" iconName="messages" />
      <div className="living-card">
        <window.DataTable
          columns={[
            { key: "residentName", label: "Origen" },
            { key: "relatedReservation", label: "Reserva" },
            { key: "type", label: "Tipo" },
            { key: "summary", label: "Resumen" },
            { key: "status", label: "Estado", render: (row) => <window.Badge status={row.status} /> },
          ]}
          rows={data.messages}
        />
      </div>
    </div>
  );
};

window.SettingsScreen = function SettingsScreen({ data }) {
  const building = data.building;
  return (
    <div className="living-screen">
      <window.SectionTitle eyebrow="Configuración" title="Perfil del edificio" iconName="settings" />
      <div className="living-grid living-card-grid">
        <div className="living-card">
          <div className="living-card-label">Perfil</div>
          <h3>{building.name}</h3>
          <p>{building.district}</p>
          <ul className="living-list compact">
            <li>{building.apartmentsCount} departamentos</li>
            <li>{building.floors} pisos y {building.basements} sótanos</li>
            <li>{building.language} · {building.currency}</li>
          </ul>
        </div>
        <div className="living-card">
          <div className="living-card-label">Instrucciones de pago</div>
          <ul className="living-list compact">
            <li>Yape: 987 654 321</li>
            <li>Plin: 934 111 222</li>
            <li>Cuenta BCP: 191-8844556-0-22</li>
          </ul>
        </div>
        <div className="living-card">
          <div className="living-card-label">Permisos</div>
          <ul className="living-list compact">
            <li>Seguridad puede marcar llegadas</li>
            <li>Limpieza puede reportar incidentes</li>
            <li>Junta tiene acceso de solo lectura</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

window.SuperAdminScreen = function SuperAdminScreen({ data, pendingActions, onUpdateTemplate, onAdvanceOnboarding, onUpdateSubscription, onResolveSupport }) {
  const [template, setTemplate] = React.useState(null);
  const [templateBody, setTemplateBody] = React.useState("");
  const [templateStatus, setTemplateStatus] = React.useState("Activa");
  const [subscription, setSubscription] = React.useState(null);
  const [plan, setPlan] = React.useState("");
  const [subscriptionStatus, setSubscriptionStatus] = React.useState("active");
  function editTemplate(item) { setTemplate(item); setTemplateBody(item.body); setTemplateStatus(item.status); }
  function editSubscription(item) { setSubscription(item); setPlan(item.plan); setSubscriptionStatus(item.status); }
  async function submitTemplate(event) { event.preventDefault(); const result = await onUpdateTemplate(template.id, { body: templateBody, status: templateStatus }); if (result) setTemplate(null); }
  async function submitSubscription(event) { event.preventDefault(); const result = await onUpdateSubscription(subscription.id, { plan, status: subscriptionStatus }); if (result) setSubscription(null); }
  return (
    <div className="living-screen">
      <window.SectionTitle eyebrow="Super Admin" title="Operación de la plataforma" body="Edificios, WhatsApp, onboarding, suscripciones y soporte en un mismo espacio." iconName="superadmin" />
      {template ? <window.FormPanel title={`Editar ${template.name}`} onCancel={() => setTemplate(null)}><form className="living-form" onSubmit={submitTemplate}><label><span>Contenido</span><textarea value={templateBody} onChange={(event) => setTemplateBody(event.target.value)} minLength="10" required /></label><label><span>Estado</span><select value={templateStatus} onChange={(event) => setTemplateStatus(event.target.value)}><option>Activa</option><option>Pausada</option></select></label><button className="living-button living-button-primary" disabled={Boolean(pendingActions[`update_template:${template.id}`])}>Guardar plantilla</button></form></window.FormPanel> : null}
      {subscription ? <window.FormPanel title={`Suscripción · ${subscription.building}`} onCancel={() => setSubscription(null)}><form className="living-form" onSubmit={submitSubscription}><label><span>Plan</span><select value={plan} onChange={(event) => setPlan(event.target.value)}><option>Piloto</option><option>Living Base</option><option>Living Pro</option></select></label><label><span>Estado</span><select value={subscriptionStatus} onChange={(event) => setSubscriptionStatus(event.target.value)}><option value="trial">Piloto</option><option value="active">Activa</option><option value="pending">Pendiente</option><option value="paused">Pausada</option></select></label><button className="living-button living-button-primary" disabled={Boolean(pendingActions[`update_subscription:${subscription.id}`])}>Actualizar suscripción</button></form></window.FormPanel> : null}
      <div className="living-dashboard-columns">
        <div className="living-card">
          <div className="living-card-label">Onboarding de edificios</div>
          <ul className="living-list">
            {data.superAdmin.buildings.map((building) => (
              <li key={building.id}><strong>{building.name}</strong> · {building.district} · Paso {building.onboardingStep}/5 · {building.status} {building.onboardingStep < 5 ? <button className="living-link-button" disabled={Boolean(pendingActions[`advance_onboarding:${building.id}`])} onClick={() => onAdvanceOnboarding(building.id)}>Avanzar</button> : null}</li>
            ))}
          </ul>
        </div>
        <div className="living-card">
          <div className="living-card-label">Plantillas de WhatsApp</div>
          <ul className="living-list">
            {data.superAdmin.templates.map((template) => (
              <li key={template.id}><strong>{template.name}</strong> · {template.language} · {template.status} <button className="living-link-button" onClick={() => editTemplate(template)}>Editar</button></li>
            ))}
          </ul>
        </div>
      </div>
      <div className="living-dashboard-columns">
        <div className="living-card"><div className="living-card-label">Suscripciones</div><ul className="living-list">{data.superAdmin.subscriptions.map((item) => <li key={item.id}><strong>{item.building}</strong> · {item.plan} · <window.Badge status={item.status} /> <button className="living-link-button" onClick={() => editSubscription(item)}>Gestionar</button></li>)}</ul></div>
        <div className="living-card"><div className="living-card-label">Soporte</div><ul className="living-list">{data.superAdmin.supportQueue.map((item) => <li key={item.id}><strong>{item.building}</strong> · {item.issue} · SLA {item.sla} · <window.Badge status={item.status} /> {item.status !== "resolved" ? <button className="living-link-button" disabled={Boolean(pendingActions[`resolve_support:${item.id}`])} onClick={() => window.confirm("¿Marcar este caso como resuelto?") && onResolveSupport(item.id)}>Resolver</button> : null}</li>)}</ul></div>
      </div>
    </div>
  );
};

window.ReservationDetailScreen = function ReservationDetailScreen(props) {
  const reservation = props.data.reservations.find((item) => item.id === props.reservationId);
  if (!reservation) {
    return <div className="living-screen"><window.SectionTitle eyebrow="Detalle de reserva" title="Reserva no encontrada" body="El código solicitado no existe o ya no está disponible." /><div className="living-card living-empty-state">Revise el enlace o vuelva al calendario.</div></div>;
  }
  return <window.ReservationDetailContent key={reservation.id} {...props} reservation={reservation} />;
};

window.ReservationDetailContent = function ReservationDetailContent({ data, role, reservation, pendingActions, onApprove, onRejectReservation, onReschedule, onCancelReservation, onRefund, onMarkNoShow, onMarkArrival, onVerifyGuests, onCompleteTask }) {
  const tasks = data.tasks.filter((task) => task.reservationId === reservation.id);
  const relatedIncident = data.incidents.find((item) => item.reservationId === reservation.id);
  const canOperateSecurity = ["approved", "confirmed"].includes(reservation.status);
  const [mode, setMode] = React.useState(null);
  const [reason, setReason] = React.useState("");
  const [refundReference, setRefundReference] = React.useState("");
  const [schedule, setSchedule] = React.useState({ date: reservation.date, start: reservation.start, end: reservation.end });
  const canChange = ["pending_approval", "approved", "confirmed"].includes(reservation.status);
  async function submitReason(event) {
    event.preventDefault();
    const result = mode === "reject" ? await onRejectReservation(reservation.id, reason) : await onCancelReservation(reservation.id, reason);
    if (result) { setMode(null); setReason(""); }
  }
  async function submitSchedule(event) {
    event.preventDefault();
    const result = await onReschedule(reservation.id, schedule);
    if (result) setMode(null);
  }
  async function submitRefund(event) {
    event.preventDefault();
    const result = await onRefund(reservation.id, refundReference);
    if (result) { setMode(null); setRefundReference(""); }
  }

  return (
    <div className="living-screen">
      <window.SectionTitle
        eyebrow="Detalle de reserva"
        title={reservation.code}
        body={`${reservation.residentName} · Dpto. ${reservation.apartment} · ${reservation.areaName} · ${window.livingFormatShortDate(reservation.date)} · ${reservation.start}–${reservation.end}`}
        actions={
          <>
            {reservation.status === "pending_approval" ? <button className="living-button living-button-primary" disabled={reservation.paymentStatus !== "verified" || Boolean(pendingActions[`approve_reservation:${reservation.id}`])} onClick={() => onApprove(reservation.id)}>{reservation.paymentStatus !== "verified" ? "Verifique el pago primero" : pendingActions[`approve_reservation:${reservation.id}`] ? "Aprobando…" : "Aprobar"}</button> : null}
            {reservation.status === "pending_approval" ? <button className="living-button living-button-secondary" onClick={() => setMode("reject")}>Rechazar</button> : null}
            {canChange ? <button className="living-button living-button-secondary" onClick={() => setMode("reschedule")}>Reprogramar</button> : null}
            {canChange ? <button className="living-button living-button-secondary" onClick={() => setMode("cancel")}>Cancelar</button> : null}
            {reservation.refundStatus === "pending" && role === "building_admin" ? <button className="living-button living-button-primary" onClick={() => setMode("refund")}>Procesar reembolso</button> : null}
            {canOperateSecurity ? <button className="living-button living-button-secondary" disabled={Boolean(pendingActions[`mark_no_show:${reservation.id}`])} onClick={() => window.confirm("¿Registrar que el residente no se presentó?") && onMarkNoShow(reservation.id)}>No se presentó</button> : null}
          </>
        }
      />
      {mode === "reschedule" ? <window.FormPanel title="Reprogramar reserva" onCancel={() => setMode(null)}><form className="living-form" onSubmit={submitSchedule}><label><span>Fecha</span><input type="date" value={schedule.date} onChange={(event) => setSchedule((current) => ({ ...current, date: event.target.value }))} required /></label><div className="living-form-columns"><label><span>Inicio</span><input type="time" value={schedule.start} onChange={(event) => setSchedule((current) => ({ ...current, start: event.target.value }))} required /></label><label><span>Fin</span><input type="time" value={schedule.end} onChange={(event) => setSchedule((current) => ({ ...current, end: event.target.value }))} required /></label></div><button className="living-button living-button-primary" disabled={Boolean(pendingActions[`reschedule_reservation:${reservation.id}`])}>Guardar horario</button></form></window.FormPanel> : null}
      {["cancel", "reject"].includes(mode) ? <window.FormPanel title={mode === "reject" ? "Rechazar reserva" : "Cancelar reserva"} description="Si existe un pago verificado, se abrirá un reembolso pendiente." onCancel={() => setMode(null)}><form className="living-form" onSubmit={submitReason}><label><span>Motivo</span><textarea value={reason} onChange={(event) => setReason(event.target.value)} minLength="5" required /></label><button className="living-button living-button-primary" disabled={Boolean(pendingActions[`${mode === "reject" ? "reject" : "cancel"}_reservation:${reservation.id}`])}>Confirmar</button></form></window.FormPanel> : null}
      {mode === "refund" ? <window.FormPanel title="Procesar reembolso" description={`Monto: ${window.livingFormatCurrency(reservation.amount)}`} onCancel={() => setMode(null)}><form className="living-form" onSubmit={submitRefund}><label><span>Referencia bancaria</span><input value={refundReference} onChange={(event) => setRefundReference(event.target.value)} minLength="5" required /></label><button className="living-button living-button-primary" disabled={Boolean(pendingActions[`refund_payment:${reservation.id}`])}>Completar reembolso</button></form></window.FormPanel> : null}
      <div className="living-dashboard-columns">
        <div className="living-card">
          <div className="living-card-label">Estado</div>
          <div className="living-tag-row">
            <window.Badge status={reservation.status} />
            <window.Badge status={reservation.paymentStatus} />
            <window.Badge status={reservation.depositStatus} />
          </div>
          <p>Motivo: {reservation.reason}</p>
          <p>Invitados: {reservation.guestCount}</p>
          <p>Monto total: {window.livingFormatCurrency(reservation.amount)}</p>
        </div>
        <div className="living-card"><div className="living-card-label">Historial de ciclo de vida</div><ol className="living-ordered-list">{reservation.lifecycle.map((entry, index) => <li key={`${entry.createdAt}-${index}`}><strong>{entry.label}</strong> · {window.livingFormatDateTime(entry.createdAt)} · {entry.actor}{entry.detail ? ` · ${entry.detail}` : ""}</li>)}</ol></div>
        <div className="living-card">
          <div className="living-card-label">Seguridad</div>
          <div className="living-checklist">
            <div className={`living-check-row ${reservation.securityResidentArrived ? "done" : ""}`}>● Residente llegó</div>
            <div className={`living-check-row ${reservation.securityGuestsVerified ? "done" : ""}`}>● Invitados verificados</div>
          </div>
          {["building_admin", "assistant_admin", "security"].includes(role) ? (
            <div className="living-inline-actions">
              <button className="living-button living-button-secondary" disabled={!canOperateSecurity || reservation.securityResidentArrived || Boolean(pendingActions[`mark_arrival:${reservation.id}`])} onClick={() => onMarkArrival(reservation.id)}>
                {pendingActions[`mark_arrival:${reservation.id}`] ? "Registrando…" : reservation.securityResidentArrived ? "Llegada registrada" : "Marcar llegada"}
              </button>
              <button className="living-button living-button-primary" disabled={!canOperateSecurity || reservation.securityGuestsVerified || Boolean(pendingActions[`verify_guests:${reservation.id}`])} onClick={() => onVerifyGuests(reservation.id)}>
                {pendingActions[`verify_guests:${reservation.id}`] ? "Verificando…" : reservation.securityGuestsVerified ? "Invitados verificados" : "Verificar invitados"}
              </button>
            </div>
          ) : null}
        </div>
      </div>
      <div className="living-grid living-card-grid">
        <div className="living-card">
          <div className="living-card-label">Lista de invitados</div>
          <ol className="living-ordered-list">
            {reservation.guestList.map((guest) => <li key={guest}>{guest}</li>)}
          </ol>
        </div>
        <div className="living-card">
          <div className="living-card-label">Tareas de limpieza</div>
          <ul className="living-list compact">
            {tasks.map((task) => (
              <li key={task.id}>
                {task.type} · <window.Badge status={task.status} />
                {task.status !== "completed" && ["building_admin", "assistant_admin", "cleaning"].includes(role) ? (
                  <button className="living-link-button" disabled={Boolean(pendingActions[`complete_task:${task.id}`])} onClick={() => onCompleteTask(task.id)}>
                    {pendingActions[`complete_task:${task.id}`] ? "Guardando…" : "Completar"}
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
        <div className="living-card">
          <div className="living-card-label">Incidentes</div>
          {relatedIncident ? (
            <div>
              <p>{relatedIncident.type}</p>
              <window.Badge status={relatedIncident.status} />
            </div>
          ) : (
            <p>Sin incidentes asociados.</p>
          )}
        </div>
      </div>
    </div>
  );
};
