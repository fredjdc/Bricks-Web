window.DashboardScreen = function DashboardScreen({ data, onOpenReservation }) {
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
        <window.MetricCard label="Pendientes" value={kpis.pendingApprovals} detail="Aprobaciones" icon={dashboardIcons.pending} />
        <window.MetricCard label="Pagos por revisar" value={kpis.pendingPayments} detail="Comprobantes" icon={dashboardIcons.payments} />
        <window.MetricCard label="Reservas hoy" value={kpis.todayReservations} detail="Aprobadas y activas" icon={dashboardIcons.reservations} />
        <window.MetricCard label="Ingresos del mes" value={window.livingFormatCurrency(kpis.revenueThisMonth)} detail="Verificado" icon={dashboardIcons.revenue} />
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
            <li>
              <span className="living-queue-icon">{dashboardIcons.pending}</span>
              <span>3 aprobaciones por resolver</span>
            </li>
            <li>
              <span className="living-queue-icon">{dashboardIcons.task}</span>
              <span>{activeTasks.length} tareas de limpieza activas</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

window.CalendarScreen = function CalendarScreen({ data, onOpenReservation }) {
  const visible = data.reservations
    .filter((item) => ["2026-07-16", "2026-07-17", "2026-07-18", "2026-07-19", "2026-07-20"].includes(item.date))
    .sort((a, b) => `${a.date}${a.start}`.localeCompare(`${b.date}${b.start}`))
    .slice(0, 16);

  return (
    <div className="living-screen">
      <window.SectionTitle eyebrow="Calendario" title="Semana operativa" iconName="calendar" />
      <div className="living-card">
        <window.DataTable
          columns={[
            { key: "date", label: "Fecha", render: (row) => window.livingFormatShortDate(row.date) },
            { key: "time", label: "Horario", render: (row) => `${row.start}–${row.end}` },
            { key: "areaName", label: "Área" },
            { key: "residentName", label: "Residente" },
            { key: "status", label: "Estado", render: (row) => <window.Badge status={row.status} /> },
            { key: "action", label: "Detalle", render: (row) => <button className="living-link-button" onClick={() => onOpenReservation(row.id)}>Abrir</button> },
          ]}
          rows={visible}
        />
      </div>
    </div>
  );
};

window.ApprovalsScreen = function ApprovalsScreen({ data, onApprove, onOpenReservation }) {
  const rows = data.reservations.filter((item) => item.status === "pending_approval");
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
                  <button className="living-link-button" onClick={() => onApprove(row.id)}>Aprobar</button>
                  <button className="living-link-button" onClick={() => onOpenReservation(row.id)}>Detalle</button>
                </div>
              ),
            },
          ]}
          rows={rows}
        />
      </div>
    </div>
  );
};

window.PaymentsScreen = function PaymentsScreen({ data }) {
  const rows = data.reservations.filter((item) => ["submitted", "verified"].includes(item.paymentStatus)).slice(0, 12);
  return (
    <div className="living-screen">
      <window.SectionTitle eyebrow="Pagos" title="Comprobantes" iconName="payments" />
      <div className="living-card">
        <window.DataTable
          columns={[
            { key: "code", label: "Reserva" },
            { key: "residentName", label: "Residente" },
            { key: "amount", label: "Monto", render: (row) => window.livingFormatCurrency(row.amount) },
            { key: "paymentSubmittedAt", label: "Enviado", render: (row) => window.livingFormatDateTime(row.paymentSubmittedAt) },
            { key: "paymentStatus", label: "Estado", render: (row) => <window.Badge status={row.paymentStatus} /> },
            { key: "summary", label: "Detalle", render: (row) => row.code === "TRL-2026-0718-0024" ? "Yape · imagen adjunta" : "Transferencia validada" },
          ]}
          rows={rows}
        />
      </div>
    </div>
  );
};

window.DepositsScreen = function DepositsScreen({ data }) {
  const rows = data.reservations.filter((item) => item.amount > 0 && item.depositStatus !== "released").slice(0, 12);
  return (
    <div className="living-screen">
      <window.SectionTitle eyebrow="Garantías" title="Retenciones y liberaciones" iconName="deposits" />
      <div className="living-card">
        <window.DataTable
          columns={[
            { key: "code", label: "Reserva" },
            { key: "residentName", label: "Residente" },
            { key: "areaName", label: "Área" },
            { key: "depositStatus", label: "Estado", render: (row) => <window.Badge status={row.depositStatus} /> },
            { key: "status", label: "Reserva", render: (row) => <window.Badge status={row.status} /> },
            { key: "impact", label: "Observación", render: (row) => row.code === "EVR-2026-0712-0007" ? "Retener S/ 80 por silla dañada" : "Pendiente cierre operativo" },
          ]}
          rows={rows}
        />
      </div>
    </div>
  );
};

window.AreasScreen = function AreasScreen({ data }) {
  return (
    <div className="living-screen">
      <window.SectionTitle eyebrow="Áreas comunes" title="Configuración del edificio" iconName="areas" />
      <div className="living-grid living-card-grid">
        {data.areas.map((area) => (
          <div className="living-card" key={area.id}>
            <div className="living-card-label">{area.location}</div>
            <h3>{area.name}</h3>
            <p>Capacidad {area.capacity} · Tarifa {window.livingFormatCurrency(area.reservationFee)} · Garantía {window.livingFormatCurrency(area.deposit)}</p>
            <div className="living-tag-row">
              {area.requiresApproval ? <window.Badge status="pending_approval" label="Requiere aprobación" /> : <window.Badge status="active" label="Aprobación automática" />}
              {area.requiresGuestList ? <window.Badge status="active" label="Lista obligatoria" /> : null}
            </div>
            <ul className="living-list compact">
              {area.rules.map((rule) => <li key={rule}>{rule}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

window.ResidentsScreen = function ResidentsScreen({ data }) {
  const rows = data.apartments.slice(0, 18);
  return (
    <div className="living-screen">
      <window.SectionTitle eyebrow="Residentes" title="Base del edificio" iconName="residents" />
      <div className="living-card">
        <window.DataTable
          columns={[
            { key: "apartment", label: "Dpto." },
            { key: "tower", label: "Torre" },
            { key: "residentName", label: "Residente" },
            { key: "whatsapp", label: "WhatsApp" },
            { key: "residentStatus", label: "Estado", render: (row) => <window.Badge status={row.residentStatus} /> },
            { key: "debtStatus", label: "Deuda" },
          ]}
          rows={rows}
        />
      </div>
    </div>
  );
};

window.SecurityScreen = function SecurityScreen({ data, onMarkArrival, onVerifyGuests }) {
  const reservation = data.reservations.find((item) => item.id === "TRL-2026-0718-0024");
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
            <button className="living-button living-button-secondary" onClick={() => onMarkArrival(reservation.id)}>Marcar llegada</button>
            <button className="living-button living-button-primary" onClick={() => onVerifyGuests(reservation.id)}>Verificar invitados</button>
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

window.CleaningScreen = function CleaningScreen({ data, onCompleteTask }) {
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
              <button className="living-button living-button-primary" onClick={() => onCompleteTask(task.id)}>Completar checklist</button>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
};

window.IncidentsScreen = function IncidentsScreen({ data }) {
  return (
    <div className="living-screen">
      <window.SectionTitle eyebrow="Incidentes" title="Trazabilidad operativa" iconName="incidents" />
      <div className="living-grid living-card-grid">
        {data.incidents.map((incident) => (
          <div className="living-card" key={incident.id}>
            <div className="living-card-label">{incident.reservationCode}</div>
            <h3>{incident.type}</h3>
            <p>{incident.areaName} · {incident.residentName} · Dpto. {incident.apartment}</p>
            <p>{incident.description}</p>
            <div className="living-tag-row">
              <window.Badge status={incident.status} />
              <window.Badge status={incident.estimatedCost > 0 ? "retained" : "open"} label={incident.depositImpact} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

window.ReportsScreen = function ReportsScreen({ data }) {
  const report = data.report;
  return (
    <div className="living-screen">
      <window.SectionTitle eyebrow="Reportes" title={`Resumen ${report.month}`} iconName="reports" />
      <div className="living-grid living-kpis">
        <window.MetricCard label="Reservas" value="90" detail="Totales del mes" />
        <window.MetricCard label="Ingresos" value={window.livingFormatCurrency(5280)} detail="Áreas cobradas" />
        <window.MetricCard label="Incidentes" value="4" detail="Incluye ruido y daño" />
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

window.SuperAdminScreen = function SuperAdminScreen({ data }) {
  return (
    <div className="living-screen">
      <window.SectionTitle eyebrow="Super Admin" title="Edificios y plantillas" iconName="superadmin" />
      <div className="living-dashboard-columns">
        <div className="living-card">
          <div className="living-card-label">Portafolio de edificios</div>
          <ul className="living-list">
            {data.superAdmin.buildings.map((building) => (
              <li key={building.name}>{building.name} · {building.district} · {building.plan} · {building.status}</li>
            ))}
          </ul>
        </div>
        <div className="living-card">
          <div className="living-card-label">Plantillas activas</div>
          <ul className="living-list">
            {data.superAdmin.templates.map((template) => (
              <li key={template.name}>{template.name} · {template.language} · {template.status}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className="living-card">
        <div className="living-card-label">Soporte y onboarding</div>
        <ul className="living-list">
          {data.superAdmin.supportQueue.map((item) => (
            <li key={item.issue}>{item.building} · {item.issue} · Responsable: {item.owner} · SLA: {item.sla}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

window.ReservationDetailScreen = function ReservationDetailScreen({ data, reservationId, onApprove, onMarkArrival, onVerifyGuests, onCompleteTask }) {
  const reservation = data.reservations.find((item) => item.id === reservationId) || data.reservations.find((item) => item.id === "TRL-2026-0718-0024");
  const tasks = data.tasks.filter((task) => task.reservationId === reservation.id);
  const relatedIncident = data.incidents.find((item) => item.reservationId === reservation.id);

  return (
    <div className="living-screen">
      <window.SectionTitle
        eyebrow="Detalle de reserva"
        title={reservation.code}
        body={`${reservation.residentName} · Dpto. ${reservation.apartment} · ${reservation.areaName} · ${window.livingFormatShortDate(reservation.date)} · ${reservation.start}–${reservation.end}`}
        actions={
          reservation.status === "pending_approval" ? <button className="living-button living-button-primary" onClick={() => onApprove(reservation.id)}>Aprobar</button> : null
        }
      />
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
        <div className="living-card">
          <div className="living-card-label">Seguridad</div>
          <div className="living-checklist">
            <div className={`living-check-row ${reservation.securityResidentArrived ? "done" : ""}`}>● Residente llegó</div>
            <div className={`living-check-row ${reservation.securityGuestsVerified ? "done" : ""}`}>● Invitados verificados</div>
          </div>
          <div className="living-inline-actions">
            <button className="living-button living-button-secondary" onClick={() => onMarkArrival(reservation.id)}>Marcar llegada</button>
            <button className="living-button living-button-primary" onClick={() => onVerifyGuests(reservation.id)}>Verificar invitados</button>
          </div>
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
                {task.status !== "completed" ? (
                  <button className="living-link-button" onClick={() => onCompleteTask(task.id)}>Completar</button>
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
