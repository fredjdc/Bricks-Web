window.PortalShell = function PortalShell({
  account,
  role,
  data,
  actions,
  currentPage,
  selectedReservationId,
  onNavigate,
  onGoLanding,
  onLogout,
  onRoleChange,
}) {
  let screen = null;

  switch (currentPage) {
    case "dashboard":
      screen = <window.DashboardScreen data={data} onOpenReservation={(id) => onNavigate("reservation", id)} />;
      break;
    case "calendar":
      screen = <window.CalendarScreen data={data} onOpenReservation={(id) => onNavigate("reservation", id)} />;
      break;
    case "approvals":
      screen = <window.ApprovalsScreen data={data} onApprove={actions.approveReservation} onOpenReservation={(id) => onNavigate("reservation", id)} />;
      break;
    case "payments":
      screen = <window.PaymentsScreen data={data} />;
      break;
    case "deposits":
      screen = <window.DepositsScreen data={data} />;
      break;
    case "areas":
      screen = <window.AreasScreen data={data} />;
      break;
    case "residents":
      screen = <window.ResidentsScreen data={data} />;
      break;
    case "security":
      screen = <window.SecurityScreen data={data} onMarkArrival={actions.markArrival} onVerifyGuests={actions.verifyGuests} />;
      break;
    case "cleaning":
      screen = <window.CleaningScreen data={data} onCompleteTask={actions.completeTask} />;
      break;
    case "incidents":
      screen = <window.IncidentsScreen data={data} />;
      break;
    case "reports":
      screen = <window.ReportsScreen data={data} />;
      break;
    case "messages":
      screen = <window.MessagesScreen data={data} />;
      break;
    case "settings":
      screen = <window.SettingsScreen data={data} />;
      break;
    case "superadmin":
      screen = <window.SuperAdminScreen data={data} />;
      break;
    case "reservation":
      screen = (
        <window.ReservationDetailScreen
          data={data}
          reservationId={selectedReservationId}
          onApprove={actions.approveReservation}
          onMarkArrival={actions.markArrival}
          onVerifyGuests={actions.verifyGuests}
          onCompleteTask={actions.completeTask}
        />
      );
      break;
    default:
      screen = <window.DashboardScreen data={data} onOpenReservation={(id) => onNavigate("reservation", id)} />;
  }

  return (
    <div className="living-portal">
      <window.Sidebar role={role} currentPage={currentPage} onNavigate={(page) => onNavigate(page)} />
      <div className="living-main">
        <window.TopBar
          account={account}
          role={role}
          onRoleChange={onRoleChange}
          onLogout={onLogout}
        />
        {screen}
      </div>
    </div>
  );
};

window.LivingApp = function LivingApp() {
  const [route, setRoute] = React.useState(window.livingParseHash());
  const [data, setData] = React.useState(() => window.buildLivingDemoData());
  const [account, setAccount] = React.useState(window.LIVING_DEMO_ACCOUNTS[0]);
  const [role, setRole] = React.useState("building_admin");
  const actions = React.useMemo(() => window.createLivingActions(setData), [setData]);

  React.useEffect(() => {
    const handler = () => setRoute(window.livingParseHash());
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);

  React.useEffect(() => {
    if (!window.location.hash) window.livingSetHash("landing");
  }, []);

  React.useEffect(() => {
    const match = window.LIVING_DEMO_ACCOUNTS.find((item) => item.role === role);
    if (match) setAccount(match);
  }, [role]);

  function goToPortal(page = "dashboard", id) {
    window.livingSetHash(id ? `portal/${page}/${id}` : `portal/${page}`);
  }

  React.useEffect(() => {
    if (route.area !== "portal") return;
    const currentPage = route.page || window.defaultLivingPageForRole(role);
    if (!window.pageAllowedForLivingRole(role, currentPage)) {
      goToPortal(window.defaultLivingPageForRole(role));
    }
  }, [route.area, route.page, role]);

  function handleLogin(nextAccount) {
    setAccount(nextAccount);
    setRole(nextAccount.role);
    goToPortal(window.defaultLivingPageForRole(nextAccount.role));
  }

  function handleRoleChange(nextRole) {
    setRole(nextRole);
    goToPortal(window.defaultLivingPageForRole(nextRole));
  }

  if (route.area === "login") {
    return <window.LoginScreen onLogin={handleLogin} />;
  }

  if (route.area !== "portal") {
    return <window.PublicLanding onEnterPortal={() => window.livingSetHash("login")} />;
  }

  return (
    <window.PortalShell
      account={account}
      role={role}
      data={data}
      actions={actions}
      currentPage={route.page || "dashboard"}
      selectedReservationId={route.id}
      onNavigate={(page, id) => goToPortal(page, id)}
      onGoLanding={() => window.livingSetHash("landing")}
      onLogout={() => window.livingSetHash("login")}
      onRoleChange={handleRoleChange}
    />
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(<window.LivingApp />);
