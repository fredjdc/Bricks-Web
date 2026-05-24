// Product grid — 3 cards for Scan, Calc, Leads
const PRODUCTS = [
  { id: 'scan', name: 'Bricks Scan', tagline: 'Scan and organize documents, automatically.',
    accent: '#00A6A1', icon: '../../assets/feature-icon-03.svg',
    bullets: ['On-device AI', 'Instant search', 'Auto-Sort'] },
  { id: 'calc', name: 'Bricks Calc', tagline: 'A mortgage calculator for real work.',
    accent: '#007AFF', icon: '../../assets/feature-icon-02.svg',
    bullets: ['Scenarios', 'PMI & taxes', 'Share as PDF'] },
  { id: 'leads', name: 'Bricks Leads', tagline: 'A calm CRM for agents.',
    accent: '#FF9500', icon: '../../assets/feature-icon-06.svg',
    bullets: ['Follow-ups', 'Properties', 'Schedule'] },
];

window.ProductGrid = function ProductGrid() {
  return (
    <section id="products" style={{ padding: '120px 48px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 80 }}>
        <div style={ebrowStyle}>The suite</div>
        <h2 style={h2Style}>Three tools. One suite.</h2>
        <p style={leadStyle}>
          Each app is small, focused, and useful on its own. Together they cover the unglamorous work that fills an agent's day.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
        {PRODUCTS.map(p => <ProductCard key={p.id} {...p} />)}
      </div>
    </section>
  );
};

function ProductCard({ id, name, tagline, accent, icon, bullets }) {
  const [hover, setHover] = React.useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: '#F6F7F8', borderRadius: 48, padding: 32,
        border: '1px solid rgba(255,255,255,0.4)',
        boxShadow: hover
          ? '16px 16px 32px #E7ECEF, -16px -16px 32px #ffffff'
          : '12px 12px 24px #E7ECEF, -12px -12px 24px #ffffff',
        transform: hover ? 'translateY(-6px)' : 'translateY(0)',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        cursor: 'pointer',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22 }}>
        <div style={{
          width: 56, height: 56, borderRadius: 16, background: '#fff',
          boxShadow: '4px 6px 16px #E7ECEF, -2px -2px 6px #fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <img src={icon} style={{ width: 32, height: 32 }} />
        </div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 600, color: '#0B0F14' }}>{name}</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: accent, letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 2 }}>
            <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: 3, background: accent, marginRight: 6, verticalAlign: 'middle' }} />
            Available now
          </div>
        </div>
      </div>
      <p style={{ fontSize: 20, fontWeight: 600, color: '#0B0F14', margin: '0 0 20px', letterSpacing: '-0.01em', lineHeight: 1.25 }}>
        {tagline}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
        {bullets.map(b => (
          <div key={b} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#55626E' }}>
            <span style={{ width: 5, height: 5, borderRadius: 3, background: accent, flexShrink: 0 }} />
            {b}
          </div>
        ))}
      </div>
      <button style={{
        width: '100%', padding: '14px 20px', borderRadius: 16, background: '#0B0F14',
        color: '#F6F7F8', border: 'none', fontSize: 14, fontWeight: 600, fontFamily: 'inherit',
        cursor: 'pointer', boxShadow: '0 8px 20px rgba(11,15,20,0.18)',
      }}>Learn about {name.split(' ')[1]} →</button>
    </div>
  );
}

const ebrowStyle = {
  fontSize: 12, fontWeight: 700, color: 'rgba(11,15,20,0.5)',
  letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16,
};
const h2Style = {
  fontSize: 56, fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.1,
  margin: '0 0 20px', color: '#0B0F14',
};
const leadStyle = {
  fontSize: 18, lineHeight: 1.6, color: '#55626E', margin: 0,
  maxWidth: 620, marginLeft: 'auto', marginRight: 'auto',
};
