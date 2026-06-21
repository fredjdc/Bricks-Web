window.PortalShell = function PortalShell({
  account,
  role,
  data,
  actions,
  pendingActions,
  feedback,
  currentPage,
  selectedReservationId,
  onNavigate,
  onGoLanding,
  onLogout,
  onRoleChange,
  onResetDemo,
  onDismissFeedback,
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
      screen = <window.ApprovalsScreen data={data} pendingActions={pendingActions} onApprove={actions.approveReservation} onOpenReservation={(id) => onNavigate("reservation", id)} />;
      break;
    case "payments":
      screen = <window.PaymentsScreen data={data} pendingActions={pendingActions} onVerify={actions.verifyPayment} onReject={actions.rejectPayment} />;
      break;
    case "deposits":
      screen = <window.DepositsScreen data={data} role={role} pendingActions={pendingActions} onRelease={actions.releaseDeposit} onRetain={actions.retainDeposit} />;
      break;
    case "areas":
      screen = <window.AreasScreen data={data} pendingActions={pendingActions} onUpdate={actions.updateArea} />;
      break;
    case "residents":
      screen = <window.ResidentsScreen data={data} pendingActions={pendingActions} onUpdate={actions.updateResident} />;
      break;
    case "security":
      screen = <window.SecurityScreen data={data} pendingActions={pendingActions} onMarkArrival={actions.markArrival} onVerifyGuests={actions.verifyGuests} />;
      break;
    case "cleaning":
      screen = <window.CleaningScreen data={data} pendingActions={pendingActions} onCompleteTask={actions.completeTask} />;
      break;
    case "incidents":
      screen = <window.IncidentsScreen data={data} role={role} pendingActions={pendingActions} onCreate={actions.createIncident} onResolve={actions.resolveIncident} />;
      break;
    case "reports":
      screen = <window.ReportsScreen data={data} />;
      break;
    case "audit":
      screen = <window.AuditScreen data={data} role={role} />;
      break;
    case "messages":
      screen = <window.MessagesScreen data={data} />;
      break;
    case "settings":
      screen = <window.SettingsScreen data={data} />;
      break;
    case "superadmin":
      screen = <window.SuperAdminScreen data={data} pendingActions={pendingActions} onUpdateTemplate={actions.updateTemplate} onAdvanceOnboarding={actions.advanceOnboarding} onUpdateSubscription={actions.updateSubscription} onResolveSupport={actions.resolveSupport} />;
      break;
    case "reservation":
      screen = (
        <window.ReservationDetailScreen
          data={data}
          role={role}
          reservationId={selectedReservationId}
          onApprove={actions.approveReservation}
          onMarkArrival={actions.markArrival}
          onVerifyGuests={actions.verifyGuests}
          onCompleteTask={actions.completeTask}
          pendingActions={pendingActions}
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
          onResetDemo={onResetDemo}
        />
        <window.ActionFeedback feedback={feedback} onDismiss={onDismissFeedback} />
        {screen}
      </div>
    </div>
  );
};

window.LivingApp = function LivingApp() {
  const [route, setRoute] = React.useState(window.livingParseHash());
  const [data, setData] = React.useState(() => window.loadLivingDemoState() || window.buildLivingDemoData());
  const [role, setRole] = React.useState(() => window.loadLivingSessionRole());
  const [account, setAccount] = React.useState(() => window.LIVING_DEMO_ACCOUNTS.find((item) => item.role === window.loadLivingSessionRole()) || window.LIVING_DEMO_ACCOUNTS[0]);
  const [isAuthenticated, setIsAuthenticated] = React.useState(() => window.sessionStorage.getItem("bricks-living-authenticated") === "true");
  const [pendingActions, setPendingActions] = React.useState({});
  const [feedback, setFeedback] = React.useState(null);
  const dataRef = React.useRef(data);
  const roleRef = React.useRef(role);
  const accountRef = React.useRef(account);
  const commandGenerationRef = React.useRef(0);
  dataRef.current = data;
  roleRef.current = role;
  accountRef.current = account;
  const [service] = React.useState(() => window.createLivingMockService());
  const [repository] = React.useState(() => window.createLivingRepository({
    getData: () => dataRef.current,
    getContext: (command) => ({
      role: roleRef.current,
      account: accountRef.current,
      now: window.livingDemoActionTime(command, dataRef.current),
    }),
    service,
  }));
  const [actions] = React.useState(() => window.createLivingActions({
    repository,
    getCommandGeneration: () => commandGenerationRef.current,
    setData,
    setPending: setPendingActions,
    setFeedback,
  }));

  React.useEffect(() => {
    window.saveLivingDemoState(data);
  }, [data]);

  React.useEffect(() => {
    if (!feedback) return undefined;
    const timeout = window.setTimeout(() => setFeedback(null), 5000);
    return () => window.clearTimeout(timeout);
  }, [feedback]);

  React.useEffect(() => {
    const handler = () => setRoute(window.livingParseHash());
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);

  React.useEffect(() => {
    if (!window.location.hash) window.livingSetHash("landing");
  }, []);

  React.useEffect(() => {
    if (route.area === "portal" && !isAuthenticated) window.livingSetHash("login");
  }, [route.area, isAuthenticated]);

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
    commandGenerationRef.current += 1;
    repository.invalidate();
    setAccount(nextAccount);
    setRole(nextAccount.role);
    setIsAuthenticated(true);
    window.saveLivingSession(nextAccount.role);
    goToPortal(window.defaultLivingPageForRole(nextAccount.role));
  }

  function handleRoleChange(nextRole) {
    commandGenerationRef.current += 1;
    repository.invalidate();
    setPendingActions({});
    const nextAccount = window.LIVING_DEMO_ACCOUNTS.find((item) => item.role === nextRole);
    if (nextAccount) setAccount(nextAccount);
    setRole(nextRole);
    window.saveLivingSession(nextRole);
    goToPortal(window.defaultLivingPageForRole(nextRole));
  }

  function handleResetDemo() {
    if (!window.confirm("¿Restablecer todos los datos y avances de la demo?")) return;
    commandGenerationRef.current += 1;
    repository.invalidate();
    window.resetLivingDemoState();
    setData(window.buildLivingDemoData());
    setPendingActions({});
    setFeedback({ tone: "success", message: "La demo volvió a su estado inicial." });
  }

  function handleLogout() {
    commandGenerationRef.current += 1;
    repository.invalidate();
    setPendingActions({});
    setIsAuthenticated(false);
    window.clearLivingSession();
    window.livingSetHash("login");
  }

  if (route.area === "login") {
    return <window.LoginScreen onLogin={handleLogin} />;
  }

  if (route.area === "portal" && !isAuthenticated) {
    return <window.LoginScreen onLogin={handleLogin} />;
  }

  if (route.area !== "portal") {
    return <window.PublicLanding data={data} onEnterPortal={() => window.livingSetHash("login")} />;
  }

  return (
    <window.PortalShell
      account={account}
      role={role}
      data={data}
      actions={actions}
      pendingActions={pendingActions}
      feedback={feedback}
      currentPage={route.page || "dashboard"}
      selectedReservationId={route.id}
      onNavigate={(page, id) => goToPortal(page, id)}
      onGoLanding={() => window.livingSetHash("landing")}
      onLogout={handleLogout}
      onRoleChange={handleRoleChange}
      onResetDemo={handleResetDemo}
      onDismissFeedback={() => setFeedback(null)}
    />
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(<window.LivingApp />);
    commandGenerationRef.current += 1;
