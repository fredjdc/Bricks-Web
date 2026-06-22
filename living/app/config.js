window.LIVING_ROLE_LABELS = {
  super_admin: "Super Admin",
  building_admin: "Admin edificio",
  assistant_admin: "Asistente",
  security: "Seguridad",
  cleaning: "Limpieza",
  junta: "Junta",
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
