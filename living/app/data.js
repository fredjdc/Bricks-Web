window.buildLivingDemoData = function buildLivingDemoData() {
  const areas = [
    {
      id: "terrace",
      name: "Terraza",
      icon: "Terrace",
      capacity: 40,
      reservationFee: 120,
      deposit: 300,
      requiresApproval: false,
      requiresGuestList: false,
      requiresCleaning: true,
      requiresInspection: true,
      rules: ["Máximo 6 horas", "Termina antes de las 11:00 PM", "Garantía obligatoria", "Cargo de limpieza obligatorio"],
      location: "Piso 22",
      status: "active",
    },
    {
      id: "bbq",
      name: "Zona BBQ",
      icon: "BBQ",
      capacity: 20,
      reservationFee: 60,
      deposit: 150,
      requiresApproval: false,
      requiresGuestList: false,
      requiresCleaning: true,
      requiresInspection: false,
      rules: ["Máximo 4 horas", "Sin música amplificada"],
      location: "Piso 22",
      status: "active",
    },
    {
      id: "event-room",
      name: "Salón de eventos",
      icon: "Events",
      capacity: 60,
      reservationFee: 200,
      deposit: 500,
      requiresApproval: true,
      requiresGuestList: true,
      requiresCleaning: true,
      requiresInspection: true,
      rules: ["Aprobación previa", "Lista de invitados obligatoria"],
      location: "Piso 1",
      status: "active",
    },
    {
      id: "coworking",
      name: "Coworking",
      icon: "Coworking",
      capacity: 12,
      reservationFee: 0,
      deposit: 0,
      requiresApproval: false,
      requiresGuestList: false,
      requiresCleaning: false,
      requiresInspection: false,
      rules: ["Solo residentes", "Sin garantía"],
      location: "Piso 2",
      status: "active",
    },
    {
      id: "gym",
      name: "Gimnasio",
      icon: "Gym",
      capacity: 30,
      reservationFee: 0,
      deposit: 0,
      requiresApproval: false,
      requiresGuestList: false,
      requiresCleaning: false,
      requiresInspection: false,
      rules: ["No requiere reserva"],
      location: "Piso 3",
      status: "active",
    },
  ];

  const coreResidents = [
    { apartment: "402", tower: "A", name: "Ana García", phone: "+51 987 654 321", email: "ana.garcia@example.com", status: "active", debt: 0, relationship: "Propietaria" },
    { apartment: "605", tower: "A", name: "José Torres", phone: "+51 934 111 222", email: "jose.torres@example.com", status: "active", debt: 0, relationship: "Propietario" },
    { apartment: "808", tower: "A", name: "Valeria Mendoza", phone: "+51 955 444 777", email: "valeria.mendoza@example.com", status: "active", debt: 0, relationship: "Propietaria" },
    { apartment: "1203", tower: "B", name: "Miguel Castro", phone: "+51 922 888 333", email: "miguel.castro@example.com", status: "active", debt: 0, relationship: "Propietario" },
    { apartment: "1507", tower: "B", name: "Lucía Fernández", phone: "+51 977 123 987", email: "lucia.fernandez@example.com", status: "active", debt: 0, relationship: "Propietaria" },
  ];

  const firstNames = ["Mariana", "Sebastián", "Camila", "Ignacio", "Daniela", "Fernando", "Gabriela", "Andrés", "Carolina", "Renato", "Paola", "Alonso", "Claudia", "Mateo", "Jimena", "Diego", "Sandra", "Rodrigo", "Elena", "Piero"];
  const lastNames = ["Paredes", "Salas", "Muñoz", "Torres", "Flores", "Ruiz", "León", "Díaz", "Gómez", "Sánchez", "Rivas", "Quispe", "Navarro", "Lozano", "Ramírez", "Luna", "Morales", "Acuña", "Vargas", "Delgado"];
  const fillerResidents = [];
  const occupied = new Set(coreResidents.map((resident) => resident.apartment));

  let floor = 2;
  let unit = 1;
  let residentIndex = 0;
  while (fillerResidents.length < 47) {
    const apartment = `${floor}${String(unit).padStart(2, "0")}`;
    unit += 1;
    if (unit > 8) {
      unit = 1;
      floor += 1;
    }
    if (occupied.has(apartment)) continue;
    const firstName = firstNames[residentIndex % firstNames.length];
    const lastName = lastNames[(residentIndex * 3) % lastNames.length];
    fillerResidents.push({
      apartment,
      tower: floor > 11 ? "B" : "A",
      name: `${firstName} ${lastName}`,
      phone: `+51 9${String(10000000 + residentIndex * 731).slice(0, 8)}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
      status: residentIndex % 13 === 0 ? "blocked" : "active",
      debt: residentIndex % 9 === 0 ? 180 : 0,
      relationship: residentIndex % 5 === 0 ? "Inquilino" : "Propietario",
    });
    residentIndex += 1;
  }

  const residents = [...coreResidents, ...fillerResidents].map((resident) => ({
    id: window.livingUid("resident", resident.apartment),
    ...resident,
  }));

  const apartments = Array.from({ length: 168 }, (_, index) => {
    const floorNumber = Math.floor(index / 8) + 1;
    const unitNumber = (index % 8) + 1;
    const apartment = `${floorNumber}${String(unitNumber).padStart(2, "0")}`;
    const resident = residents.find((item) => item.apartment === apartment);
    return {
      id: window.livingUid("apartment", apartment),
      tower: floorNumber > 11 ? "B" : "A",
      apartment,
      residentName: resident ? resident.name : "Sin asignar",
      whatsapp: resident ? resident.phone : "Sin registro",
      residentStatus: resident ? resident.status : "pending",
      debtStatus: resident && resident.debt > 0 ? "Deuda" : "Al día",
    };
  });

  const guestListAna = [
    "Andrea Paredes", "Luis Salas", "Diego Muñoz", "Carmen Torres", "Patricia Flores",
    "Jorge Ruiz", "Sofía León", "Ricardo Díaz", "Elena Gómez", "Pedro Sánchez",
    "Luciana Rivas", "Álvaro Navarro", "María Quispe", "Ricardo Lozano", "Nadia Vargas",
    "José Luna", "Silvia Morales", "Diana Acuña", "Tomás Delgado", "Camilo Ramírez",
    "Paula Torres", "Martín Flores", "Valentina Muñoz", "Renzo Salas", "Daniela Ruiz",
  ];

  const reservations = [
    {
      id: "TRL-2026-0718-0024",
      code: "TRL-2026-0718-0024",
      residentId: "resident-402",
      residentName: "Ana García",
      apartment: "402",
      areaId: "terrace",
      areaName: "Terraza",
      date: "2026-07-18",
      start: "17:00",
      end: "23:00",
      guestCount: 25,
      guestList: guestListAna,
      reason: "Celebración de cumpleaños",
      status: "pending_approval",
      paymentStatus: "verified",
      paymentMethod: "Yape",
      paymentProof: { name: "yape-ana-420.jpg", type: "image/jpeg", size: 184320 },
      depositStatus: "held",
      amount: 420,
      reservationFee: 120,
      depositAmount: 300,
      approvalRequired: true,
      createdAt: "2026-07-12T08:52:00-05:00",
      paymentSubmittedAt: "2026-07-12T09:10:00-05:00",
      approvedBy: null,
      approvedAt: null,
      securityResidentArrived: false,
      securityGuestsVerified: false,
      cleaningStatus: "pending",
      messages: ["Reglas aceptadas a las 08:55", "Comprobante Yape validado a las 09:12"],
    },
    {
      id: "EVR-2026-0712-0007",
      code: "EVR-2026-0712-0007",
      residentId: "resident-1203",
      residentName: "Miguel Castro",
      apartment: "1203",
      areaId: "event-room",
      areaName: "Salón de eventos",
      date: "2026-07-12",
      start: "18:00",
      end: "22:00",
      guestCount: 40,
      guestList: ["Lista registrada"],
      reason: "Reunión familiar",
      status: "completed",
      paymentStatus: "verified",
      paymentMethod: "Transferencia",
      paymentProof: { name: "transferencia-miguel.pdf", type: "application/pdf", size: 221184 },
      depositStatus: "retained",
      amount: 700,
      reservationFee: 200,
      depositAmount: 500,
      approvalRequired: true,
      createdAt: "2026-07-03T11:00:00-05:00",
      paymentSubmittedAt: "2026-07-03T13:00:00-05:00",
      approvedBy: "María Fernanda Rojas",
      approvedAt: "2026-07-03T16:20:00-05:00",
      securityResidentArrived: true,
      securityGuestsVerified: true,
      cleaningStatus: "completed",
      messages: ["Post evento con observación de silla dañada"],
    },
  ];

  const julyPlan = [
    { areaId: "terrace", count: 16, baseFee: 120, code: "TRL" },
    { areaId: "bbq", count: 22, baseFee: 60, code: "BBQ" },
    { areaId: "event-room", count: 7, baseFee: 200, code: "EVR" },
    { areaId: "coworking", count: 41, baseFee: 0, code: "COW" },
  ];

  let reservationCounter = 1;
  julyPlan.forEach((plan, areaIndex) => {
    for (let i = 0; i < plan.count; i += 1) {
      const code = `${plan.code}-2026-07-${String((i % 28) + 1).padStart(2, "0")}-${String(reservationCounter).padStart(4, "0")}`;
      if (code === "TRL-2026-07-18-0024") {
        reservationCounter += 1;
        continue;
      }
      const resident = residents[(areaIndex * 11 + i) % residents.length];
      const area = areas.find((item) => item.id === plan.areaId);
      const statuses = ["approved", "completed", "confirmed"];
      reservations.push({
        id: code,
        code,
        residentId: resident.id,
        residentName: resident.name,
        apartment: resident.apartment,
        areaId: area.id,
        areaName: area.name,
        date: `2026-07-${String((i % 28) + 1).padStart(2, "0")}`,
        start: area.id === "coworking" ? "09:00" : i % 2 === 0 ? "17:00" : "12:00",
        end: area.id === "coworking" ? "12:00" : i % 2 === 0 ? "21:00" : "16:00",
        guestCount: area.id === "coworking" ? 1 : Math.min(area.capacity - 2, 6 + (i % 14)),
        guestList: area.requiresGuestList ? ["Lista validada"] : [],
        reason: area.id === "coworking" ? "Bloque de trabajo" : "Reserva de uso común",
        status: statuses[i % statuses.length],
        paymentStatus: "verified",
        paymentMethod: i % 2 === 0 ? "Yape" : "Transferencia",
        paymentProof: null,
        depositStatus: area.deposit > 0 ? (i % 12 === 0 ? "retained" : i % 3 === 0 ? "released" : "held") : "released",
        amount: plan.baseFee + area.deposit,
        reservationFee: plan.baseFee,
        depositAmount: area.deposit,
        approvalRequired: area.requiresApproval,
        createdAt: `2026-07-${String((i % 28) + 1).padStart(2, "0")}T09:00:00-05:00`,
        paymentSubmittedAt: `2026-07-${String((i % 28) + 1).padStart(2, "0")}T10:00:00-05:00`,
        approvedBy: area.requiresApproval ? "María Fernanda Rojas" : null,
        approvedAt: area.requiresApproval ? `2026-07-${String((i % 28) + 1).padStart(2, "0")}T12:00:00-05:00` : null,
        securityResidentArrived: i % 5 !== 0,
        securityGuestsVerified: i % 6 !== 0,
        cleaningStatus: area.requiresCleaning ? (i % 4 === 0 ? "pending" : "completed") : "completed",
        messages: [],
      });
      reservationCounter += 1;
    }
  });

  reservations.push(
    {
      id: "TRL-2026-0716-0091",
      code: "TRL-2026-0716-0091",
      residentId: "resident-605",
      residentName: "José Torres",
      apartment: "605",
      areaId: "terrace",
      areaName: "Terraza",
      date: "2026-07-16",
      start: "18:00",
      end: "22:00",
      guestCount: 18,
      guestList: [],
      reason: "Cena de cumpleaños",
      status: "pending_approval",
      paymentStatus: "verified",
      paymentMethod: "Plin",
      paymentProof: null,
      depositStatus: "held",
      amount: 420,
      reservationFee: 120,
      depositAmount: 300,
      approvalRequired: true,
      createdAt: "2026-07-13T08:14:00-05:00",
      paymentSubmittedAt: "2026-07-13T08:40:00-05:00",
      approvedBy: null,
      approvedAt: null,
      securityResidentArrived: false,
      securityGuestsVerified: false,
      cleaningStatus: "pending",
      messages: ["Solicita equipo de sonido apagado a las 10:00 PM"],
    },
    {
      id: "EVR-2026-0719-0094",
      code: "EVR-2026-0719-0094",
      residentId: "resident-808",
      residentName: "Valeria Mendoza",
      apartment: "808",
      areaId: "event-room",
      areaName: "Salón de eventos",
      date: "2026-07-19",
      start: "16:00",
      end: "21:00",
      guestCount: 32,
      guestList: ["Pendiente de carga"],
      reason: "Baby shower",
      status: "pending_approval",
      paymentStatus: "submitted",
      paymentMethod: "Yape",
      paymentProof: { name: "yape-valeria-700.jpg", type: "image/jpeg", size: 196608 },
      depositStatus: "held",
      amount: 700,
      reservationFee: 200,
      depositAmount: 500,
      approvalRequired: true,
      createdAt: "2026-07-14T14:20:00-05:00",
      paymentSubmittedAt: "2026-07-14T16:00:00-05:00",
      approvedBy: null,
      approvedAt: null,
      securityResidentArrived: false,
      securityGuestsVerified: false,
      cleaningStatus: "pending",
      messages: ["Lista de invitados incompleta"],
    }
  );

  const tasks = [
    {
      id: "task-prep-ana",
      type: "Preparación",
      reservationId: "TRL-2026-0718-0024",
      reservationCode: "TRL-2026-0718-0024",
      areaName: "Terraza",
      dueTime: "2026-07-18T15:00:00-05:00",
      assignedUser: "Equipo interno",
      status: "pending",
      notes: "Checklist previo antes de la reserva.",
      checklist: ["Mesas instaladas", "Sillas instaladas", "Contenedores listos", "Baño inspeccionado"],
      completedItems: [],
    },
    {
      id: "task-clean-ana",
      type: "Limpieza post evento",
      reservationId: "TRL-2026-0718-0024",
      reservationCode: "TRL-2026-0718-0024",
      areaName: "Terraza",
      dueTime: "2026-07-18T23:15:00-05:00",
      assignedUser: "Equipo interno",
      status: "pending",
      notes: "Cierre y limpieza posterior.",
      checklist: ["Basura retirada", "Mesas limpias", "Piso limpio", "Luces revisadas", "Área cerrada"],
      completedItems: [],
    },
    {
      id: "task-event-room-issue",
      type: "Inspección",
      reservationId: "EVR-2026-0712-0007",
      reservationCode: "EVR-2026-0712-0007",
      areaName: "Salón de eventos",
      dueTime: "2026-07-12T22:30:00-05:00",
      assignedUser: "Equipo interno",
      status: "completed",
      notes: "Se detectó silla rota.",
      checklist: ["Mobiliario revisado", "Fotos cargadas", "Incidente escalado"],
      completedItems: ["Mobiliario revisado", "Fotos cargadas", "Incidente escalado"],
    },
  ];

  const incidents = [
    {
      id: "incident-chair",
      type: "Silla dañada",
      reservationId: "EVR-2026-0712-0007",
      reservationCode: "EVR-2026-0712-0007",
      areaName: "Salón de eventos",
      apartment: "1203",
      residentName: "Miguel Castro",
      description: "Silla rota detectada durante la inspección posterior al evento.",
      evidence: ["Foto 1", "Foto 2"],
      createdBy: "Equipo interno",
      status: "pending_resolution",
      estimatedCost: 80,
      depositImpact: "Retener S/ 80",
      notes: ["Escalado a administración", "Pendiente validación de reposición"],
      createdAt: "2026-07-12T22:42:00-05:00",
    },
    {
      id: "incident-noise",
      type: "Ruido",
      reservationId: "TRL-2026-0716-0091",
      reservationCode: "TRL-2026-0716-0091",
      areaName: "Terraza",
      apartment: "605",
      residentName: "José Torres",
      description: "Queja por música alta después de la hora permitida.",
      evidence: ["Registro de seguridad"],
      createdBy: "Puerta principal",
      status: "open",
      estimatedCost: 0,
      depositImpact: "Sin impacto",
      notes: ["Advertencia enviada al residente"],
      createdAt: "2026-07-09T22:18:00-05:00",
    },
  ];

  const messages = [
    {
      id: "msg-ana",
      residentName: "Ana García",
      apartment: "402",
      relatedReservation: "TRL-2026-0718-0024",
      type: "Comprobante de pago",
      status: "verified",
      summary: "Yape recibido por S/ 420 y validado por administración.",
      time: "2026-07-12T09:12:00-05:00",
    },
    {
      id: "msg-valeria",
      residentName: "Valeria Mendoza",
      apartment: "808",
      relatedReservation: "EVR-2026-0719-0094",
      type: "Lista de invitados",
      status: "pending",
      summary: "Faltan nombres para completar el aforo declarado.",
      time: "2026-07-14T16:24:00-05:00",
    },
    {
      id: "msg-failed",
      residentName: "Sistema",
      apartment: "N/A",
      relatedReservation: "TRL-2026-0716-0091",
      type: "Plantilla fallida",
      status: "failed",
      summary: "Falló el envío de la plantilla de aprobación pendiente.",
      time: "2026-07-14T18:04:00-05:00",
    },
  ];

  const report = {
    month: "Julio 2026",
    reservationsByArea: [
      { area: "Terraza", total: 18 },
      { area: "Zona BBQ", total: 22 },
      { area: "Salón de eventos", total: 9 },
      { area: "Coworking", total: 41 },
    ],
    revenueByArea: [
      { area: "Terraza", total: 2160 },
      { area: "Zona BBQ", total: 1320 },
      { area: "Salón de eventos", total: 1800 },
    ],
    incidents: [
      { name: "Silla dañada", total: 1 },
      { name: "Queja por ruido", total: 2 },
      { name: "Limpieza tardía", total: 1 },
    ],
    topAreas: ["Coworking", "Zona BBQ", "Terraza"],
    satisfaction: 4.7,
  };

  const superAdmin = {
    buildings: [
      { id: "building-torres", name: "Edificio Torres del Parque", district: "Miraflores", plan: "Pilot 60 días", templates: "9/9 activas", status: "Activo", onboardingStep: 5, subscriptionStatus: "trial" },
      { id: "building-alameda", name: "Residencial Alameda 54", district: "San Borja", plan: "Onboarding", templates: "6/9 activas", status: "Configurando", onboardingStep: 3, subscriptionStatus: "pending" },
      { id: "building-central", name: "Condominio Central Park", district: "Surco", plan: "Prospecto", templates: "0/9 activas", status: "Pendiente", onboardingStep: 1, subscriptionStatus: "lead" },
    ],
    templates: [
      { id: "template-welcome", name: "Entrada principal", language: "es-PE", status: "Activa", body: "Hola {{nombre}}, bienvenida a Bricks Living." },
      { id: "template-approved", name: "Reserva aprobada", language: "es-PE", status: "Activa", body: "Tu reserva {{codigo}} fue aprobada." },
      { id: "template-payment", name: "Pago recibido", language: "es-PE", status: "Activa", body: "Recibimos el pago de {{monto}}." },
      { id: "template-rejected", name: "Comprobante rechazado", language: "es-PE", status: "Activa", body: "No pudimos validar el comprobante de {{codigo}}." },
    ],
    supportQueue: [
      { id: "support-template", building: "Torres del Parque", issue: "Revisar plantilla fallida", owner: "Operations", sla: "Hoy", status: "open" },
      { id: "support-import", building: "Residencial Alameda 54", issue: "Importación de residentes", owner: "Onboarding", sla: "24h", status: "in_progress" },
    ],
    subscriptions: [
      { id: "subscription-torres", buildingId: "building-torres", building: "Edificio Torres del Parque", plan: "Piloto", amount: 0, status: "trial", renewalDate: "2026-09-01" },
      { id: "subscription-alameda", buildingId: "building-alameda", building: "Residencial Alameda 54", plan: "Living Pro", amount: 690, status: "pending", renewalDate: "2026-08-01" },
    ],
  };

  return {
    building: {
      name: "Edificio Torres del Parque",
      district: "Miraflores, Lima",
      floors: 22,
      apartmentsCount: 168,
      basements: 3,
      administrator: "María Fernanda Rojas",
      assistant: "Carlos Vega",
      security: ["Puerta principal", "Puerta secundaria"],
      cleaning: "Equipo interno",
      language: "Español LATAM",
      currency: "PEN",
    },
    areas,
    residents,
    apartments,
    reservations,
    tasks,
    incidents,
    messages,
    report,
    superAdmin,
    auditLog: [],
  };
};
