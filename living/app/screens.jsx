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

  return (
    <div className="living-screen">
      <window.SectionTitle eyebrow="Vista general" title="Operación de hoy" body="Colas pendientes, demo principal y estado del edificio en una sola vista." />
      <div className="living-grid living-kpis">
        <window.MetricCard label="Pendientes de aprobación" value={kpis.pendingApprovals} detail="Reservas que requieren decisión" />
        <window.MetricCard label="Pagos pendientes" value={kpis.pendingPayments} detail="Comprobantes por revisar" />
        <window.MetricCard label="Reservas de hoy" value={kpis.todayReservations} detail="Incluye aprobadas y activas" />
        <window.MetricCard label="Ingresos del mes" value={window.livingFormatCurrency(kpis.revenueThisMonth)} detail="Cobrado y verificado" />
        <window.MetricCard label="Garantías retenidas" value={window.livingFormatCurrency(kpis.depositsHeld)} detail="Pendientes de liberación o cierre" />
        <window.MetricCard label="Incidentes abiertos" value={kpis.incidents} detail="Requieren seguimiento" />
      </div>
      <div className="living-dashboard-columns">
        <div className="living-card">
          <div className="living-card-label">Historia demo</div>
          <div className="living-story-header">
            <h3>{storyReservation.code}</h3>
            <button className="living-link-button" onClick={() => onOpenReservation(storyReservation.id)}>Abrir detalle</button>
          </div>
          <p>Ana García · Terraza · 18 Jul · 17:00–23:00 · 25 invitados</p>
          <div className="living-checklist">
            {storyline.map((item) => (
              <div className={`living-check-row ${item.done ? "done" : ""}`} key={item.label}>
                <span>{item.done ? "●" : "○"}</span>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="living-card">
          <div className="living-card-label">Cola operativa</div>
          <ul className="living-list">
            <li>3 aprobaciones por resolver</li>
            <li>1 plantilla fallida de WhatsApp</li>
            <li>2 garantías con liberación pendiente</li>
            <li>{activeTasks.length} tareas de limpieza activas</li>
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
      <window.SectionTitle eyebrow="Calendario" title="Semana operativa" body="Las reservas confirmadas, pendientes y retenidas se muestran sobre la misma agenda." />
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
      <window.SectionTitle eyebrow="Aprobaciones" title="Cola de revisión" body="Reservas que requieren validación administrativa antes de confirmarse." />
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
      <window.SectionTitle eyebrow="Pagos" title="Comprobantes y validación" body="Reserva, monto esperado, monto enviado y estado del comprobante." />
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
      <window.SectionTitle eyebrow="Garantías" title="Retenciones y liberaciones" body="Seguimiento de depósitos, observaciones e impacto de incidentes." />
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
      <window.SectionTitle eyebrow="Áreas comunes" title="Configuración del edificio" body="Capacidad, reglas, costos y condiciones operativas por área." />
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
      <window.SectionTitle eyebrow="Residentes y departamentos" title="Base del edificio" body="Importación y estado operativo por apartamento." />
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
      <window.SectionTitle eyebrow="Seguridad" title="Vista diaria" body="Reservas activas, lista de invitados y acciones de acceso." />
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
      <window.SectionTitle eyebrow="Limpieza" title="Tareas del equipo interno" body="Preparación, cierre e inspección vinculados a cada reserva." />
      <div className="living-grid living-card-grid">
        {data.tasks.map((task) => (
          <div className="living-card" key={task.id}>
            <div className="living-card-label">{task.type}</div>
            <h3>{task.areaName}</h3>
            <p>{task.reservationCode} · {window.livingFormatDateTime(task.dueTime)}</p>
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
      <window.SectionTitle eyebrow="Incidentes" title="Trazabilidad operativa" body="Incidentes abiertos, evidencia asociada y efecto sobre la garantía." />
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
      <window.SectionTitle eyebrow="Reportes" title={`Resumen ${report.month}`} body="Visión lista para junta: uso, ingresos, incidentes y cumplimiento." />
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
      <window.SectionTitle eyebrow="Mensajes" title="Actividad de WhatsApp" body="Comprobantes, validaciones, plantillas fallidas y seguimiento." />
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
      <window.SectionTitle eyebrow="Configuración" title="Perfil del edificio" body="Idioma, pagos, número de WhatsApp, permisos y reglas base." />
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
      <window.SectionTitle eyebrow="Super Admin" title="Edificios, plantillas y soporte" body="Vista central para onboarding, plantillas de WhatsApp y estado de cuenta." />
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
