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
  submitted: "Enviado",
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

window.LIVING_NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: "dashboard", roles: ["building_admin", "assistant_admin"] },
  { id: "calendar", label: "Calendario", icon: "calendar", roles: ["building_admin", "assistant_admin"] },
  { id: "approvals", label: "Aprobaciones", icon: "approvals", roles: ["building_admin", "assistant_admin"] },
  { id: "payments", label: "Pagos", icon: "payments", roles: ["building_admin", "assistant_admin"] },
  { id: "deposits", label: "Garantías", icon: "deposits", roles: ["building_admin", "assistant_admin", "junta"] },
  { id: "areas", label: "Áreas comunes", icon: "areas", roles: ["building_admin", "assistant_admin"] },
  { id: "residents", label: "Residentes", icon: "residents", roles: ["building_admin", "assistant_admin"] },
  { id: "security", label: "Seguridad", icon: "security", roles: ["security", "building_admin", "assistant_admin"] },
  { id: "cleaning", label: "Limpieza", icon: "cleaning", roles: ["cleaning", "building_admin", "assistant_admin"] },
  { id: "incidents", label: "Incidentes", icon: "incidents", roles: ["building_admin", "assistant_admin", "security", "cleaning", "junta"] },
  { id: "reports", label: "Reportes", icon: "reports", roles: ["building_admin", "assistant_admin", "junta"] },
  { id: "audit", label: "Auditoría", icon: "reports", roles: ["super_admin", "building_admin", "assistant_admin", "junta"] },
  { id: "messages", label: "Mensajes", icon: "messages", roles: ["building_admin", "assistant_admin"] },
  { id: "settings", label: "Configuración", icon: "settings", roles: ["building_admin", "assistant_admin"] },
  { id: "superadmin", label: "Super Admin", icon: "superadmin", roles: ["super_admin"] },
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
