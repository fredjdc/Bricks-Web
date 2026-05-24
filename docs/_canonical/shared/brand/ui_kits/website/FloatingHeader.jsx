// Floating glass pill header
window.FloatingHeader = function FloatingHeader({ accent = "umbrella" }) {
  const logo = accent === "leads" ? "../../assets/leads-full-logo.svg" : "../../assets/bricks-dark-logo.svg";
  return (
    <header style={{
      position: 'fixed', top: 24, left: 48, right: 48, zIndex: 100,
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '14px 28px',
      background: 'rgba(255,255,255,0.65)',
      backdropFilter: 'blur(20px) saturate(180%)',
      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      borderRadius: 100,
      border: '1px solid rgba(255,255,255,0.4)',
      boxShadow: '0 8px 32px rgba(11,15,20,0.06), inset 0 0 0 1px rgba(255,255,255,0.3)',
    }}>
      <img src={logo} style={{ height: 22 }} alt="Bricks" />
      <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
        <a href="#products" style={navLinkStyle}>Products</a>
        <a href="#about" style={navLinkStyle}>About</a>
        <a href="#contact" style={navLinkStyle}>Contact</a>
        <div style={{
          width: 38, height: 38, borderRadius: '50%', background: '#F6F7F8',
          boxShadow: '6px 6px 12px #E7ECEF, -6px -6px 12px #ffffff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '1px solid rgba(255,255,255,0.4)', cursor: 'pointer',
        }}>
          <img src="../../assets/globe-icon.svg" style={{ width: 18, height: 18, opacity: 0.8 }} />
        </div>
      </div>
    </header>
  );
};

const navLinkStyle = {
  fontSize: 14, fontWeight: 500, color: '#0B0F14',
  textDecoration: 'none', opacity: 0.85, letterSpacing: '-0.01em',
};
