window.LIVING_ROLE_LABELS = {
  super_admin: "Super Admin",
  building_admin: "Admin edificio",
  assistant_admin: "Asistente",
  security: "Seguridad",
  cleaning: "Limpieza",
  junta: "Junta",
};

window.LIVING_LOCATION_PATHNAME = window.location?.pathname || "";
window.LIVING_LOCATION_HOSTNAME = window.location?.hostname || "";
window.LIVING_IN_LIVING_FOLDER = /\/living\/[^/]+$/.test(window.LIVING_LOCATION_PATHNAME);
window.LIVING_MARKETING_URL = window.LIVING_IN_LIVING_FOLDER ? "../living.html" : "./living.html";
window.LIVING_LOCAL_PORTAL_URL = window.LIVING_IN_LIVING_FOLDER ? "./portal.html#login" : "./living/portal.html#login";
window.LIVING_PORTAL_URL = ["", "localhost", "127.0.0.1"].includes(window.LIVING_LOCATION_HOSTNAME)
  ? window.LIVING_LOCAL_PORTAL_URL
  : "https://living.bricks.pe/portal/dashboard";
window.LIVING_ASSET_PREFIX = window.LIVING_IN_LIVING_FOLDER ? "" : "living/";
window.LIVING_SITE_PREFIX = window.LIVING_IN_LIVING_FOLDER ? "../" : "./";
window.livingAsset = function livingAsset(path) {
  return `${window.LIVING_ASSET_PREFIX}${path}`;
};

window.LIVING_STATUS_LABELS = {
  pending_approval: "Pendiente de aprobación",
  pending_payment: "Pendiente de pago",
  approved: "Aprobada",
  confirmed: "Confirmada",
  completed: "Completada",
  cancelled: "Cancelada",
  rejected: "Rechazada",
  held: "En garantía",
  released: "Liberada",
  retained: "Retenida",
  pending_resolution: "Pendiente de resolución",
  open: "Abierto",
  resolved: "Resuelto",
  failed: "Fallido",
  submitted: "Recibido",
  verified: "Verificado",
  in_progress: "En curso",
  pending: "Pendiente",
  blocked: "Bloqueado",
  active: "Activo",
  trial: "Piloto",
  lead: "Prospecto",
  paused: "Pausada",
  no_show: "No se presentó",
  refunded: "Reembolsado",
  not_applicable: "No aplica",
};

window.LIVING_DEMO_TODAY = "2026-07-18";

// Shared table columns lead every table in the same order. Screen-specific
// columns retain their declared order after this common group.
window.LIVING_TABLE_COLUMN_ORDER = [
  "Reserva",
  "Residente",
  "Dpto.",
  "Área",
  "Fecha",
  "Estado",
  "Monto",
  "Pago",
  "Movimiento",
  "Invitados",
  "Horario",
  "Motivo",
  "Detalle",
  "Actor",
];

window.livingOrderTableColumns = function livingOrderTableColumns(columns) {
  const priorities = new Map(window.LIVING_TABLE_COLUMN_ORDER.map((label, index) => [label, index]));
  const actionsPriority = window.LIVING_TABLE_COLUMN_ORDER.length + 2;
  const uniquePriority = window.LIVING_TABLE_COLUMN_ORDER.length + 1;

  return columns
    .map((column, index) => ({ column, index }))
    .sort((left, right) => {
      const leftPriority = left.column.key === "actions" ? actionsPriority : (priorities.get(left.column.label) ?? uniquePriority);
      const rightPriority = right.column.key === "actions" ? actionsPriority : (priorities.get(right.column.label) ?? uniquePriority);
      return leftPriority - rightPriority || left.index - right.index;
    })
    .map(({ column }) => column);
};

window.livingTableColumnKind = function livingTableColumnKind(column) {
  if (["code", "reservationCode", "relatedReservation"].includes(column.key)) return "reservation";
  if (["residentName", "name"].includes(column.key)) return "resident";
  if (["createdAt", "date", "paymentSubmittedAt"].includes(column.key)) return "date";
  if (["status", "paymentStatus", "depositStatus"].includes(column.key)) return "status";
  if (column.key === "amount") return "amount";
  if (column.key === "actions") return "actions";
  return "default";
};

window.livingTableColumnWidth = function livingTableColumnWidth(column) {
  return {
    reservation: 148,
    resident: 168,
    date: 128,
    status: 144,
    amount: 104,
    actions: 176,
    default: 136,
  }[window.livingTableColumnKind(column)];
};

window.LIVING_CURRENT_DATE = (() => {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/Lima", year: "numeric", month: "2-digit", day: "2-digit" })
    .formatToParts(new Date())
    .reduce((result, part) => ({ ...result, [part.type]: part.value }), {});
  return `${parts.year}-${parts.month}-${parts.day}`;
})();

window.LIVING_NAV_ITEMS = [
  { id: "dashboard", label: "Inicio", group: "Inicio", icon: "dashboard", roles: ["building_admin", "assistant_admin"] },
  { id: "calendar", label: "Calendario", group: "Reservas", icon: "calendar", roles: ["building_admin", "assistant_admin"] },
  { id: "approvals", label: "Por revisar", group: "Reservas", icon: "approvals", roles: ["building_admin", "assistant_admin"] },
  { id: "payments", label: "Comprobantes", group: "Reservas", icon: "payments", roles: ["building_admin", "assistant_admin"] },
  { id: "deposits", label: "Garantías", group: "Reservas", icon: "deposits", roles: ["building_admin", "assistant_admin", "junta"] },
  { id: "security", label: "Accesos", group: "Operación", icon: "security", roles: ["security", "building_admin", "assistant_admin"] },
  { id: "cleaning", label: "Limpieza", group: "Operación", icon: "cleaning", roles: ["cleaning", "building_admin", "assistant_admin"] },
  { id: "incidents", label: "Incidentes", group: "Operación", icon: "incidents", roles: ["building_admin", "assistant_admin", "security", "cleaning", "junta"] },
  { id: "messages", label: "Mensajes", group: "Operación", icon: "messages", roles: ["building_admin", "assistant_admin"] },
  { id: "residents", label: "Residentes", group: "Personas", icon: "residents", roles: ["building_admin", "assistant_admin"] },
  { id: "reports", label: "Reportes", group: "Gestión", icon: "reports", roles: ["building_admin", "assistant_admin", "junta"] },
  { id: "audit", label: "Auditoría", group: "Gestión", icon: "reports", roles: ["super_admin", "building_admin", "assistant_admin", "junta"] },
  { id: "areas", label: "Áreas comunes", group: "Ajustes", icon: "areas", roles: ["building_admin", "assistant_admin"] },
  { id: "settings", label: "Edificio", group: "Ajustes", icon: "settings", roles: ["building_admin", "assistant_admin"] },
  { id: "superadmin", label: "Plataforma", group: "Gestión", icon: "superadmin", roles: ["super_admin"] },
];

window.LIVING_DEMO_ACCOUNTS = [
  { email: "maria@torresdelparque.pe", password: "demo123", role: "building_admin", name: "María Fernanda Rojas" },
  { email: "carlos@torresdelparque.pe", password: "demo123", role: "assistant_admin", name: "Carlos Vega" },
  { email: "puerta@torresdelparque.pe", password: "demo123", role: "security", name: "Seguridad principal" },
  { email: "limpieza@torresdelparque.pe", password: "demo123", role: "cleaning", name: "Equipo interno" },
  { email: "junta@torresdelparque.pe", password: "demo123", role: "junta", name: "Junta directiva" },
  { email: "ops@bricksliving.pe", password: "demo123", role: "super_admin", name: "Freddy Ops" },
];

window.livingUid = function livingUid(prefix, value) {
  return `${prefix}-${value}`;
};

window.livingFormatCurrency = function livingFormatCurrency(amount) {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    maximumFractionDigits: 0,
  }).format(amount);
};

window.livingFormatShortDate = function livingFormatShortDate(date) {
  const value = /^\d{4}-\d{2}-\d{2}$/.test(date) ? new Date(`${date}T12:00:00-05:00`) : new Date(date);
  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "short",
    timeZone: "America/Lima",
  }).format(value);
};

window.livingFormatDateTime = function livingFormatDateTime(date) {
  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Lima",
  }).format(new Date(date));
};
