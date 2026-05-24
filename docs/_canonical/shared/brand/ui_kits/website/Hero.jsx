// Umbrella hero — full-bleed dark photo + short-stack copy
window.Hero = function Hero() {
  return (
    <section style={{
      position: 'relative', minHeight: '92vh', overflow: 'hidden',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#0B0F14',
    }}>
      {/* photographic layer — using gradient as stand-in for desaturated editorial photo */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 75% 25%, rgba(0,166,161,0.14) 0%, transparent 55%), ' +
                    'linear-gradient(135deg, #1a2028 0%, #0B0F14 40%, #161c24 100%)',
        filter: 'saturate(0.72) brightness(0.62)',
        animation: 'breathe 18s ease-in-out infinite',
      }} />
      {/* film grain */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.05, mixBlendMode: 'overlay',
        backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence baseFrequency='0.9'/></filter><rect width='200' height='200' filter='url(%23n)'/></svg>\")",
      }} />
      {/* dark protection */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(11,15,20,0.35) 0%, rgba(11,15,20,0.15) 50%, rgba(11,15,20,0.7) 100%)',
      }} />

      <div style={{
        position: 'relative', zIndex: 2, maxWidth: 960, padding: '0 48px',
        color: '#fff', textAlign: 'left', width: '100%',
      }}>
        <div style={{
          display: 'inline-block', padding: '6px 14px', borderRadius: 100,
          background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)',
          fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.75)', marginBottom: 32,
        }}>A suite for real estate</div>
        <h1 style={{
          fontSize: 72, fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.05,
          margin: 0, color: '#fff', maxWidth: 820,
        }}>
          Three focused tools.<br/>One quiet suite.
        </h1>
        <p style={{
          fontSize: 20, lineHeight: 1.55, color: 'rgba(255,255,255,0.72)',
          margin: '28px 0 40px', maxWidth: 520, fontWeight: 400,
        }}>
          Scan, calculate, and follow up — without bloat, accounts, or distractions. Built for iPhone, iPad, and Mac.
        </p>
        <div style={{ display: 'flex', gap: 14 }}>
          <button style={{
            padding: '18px 32px', borderRadius: 24, background: '#fff', color: '#0B0F14',
            border: 'none', fontSize: 16, fontWeight: 600, cursor: 'pointer',
            fontFamily: 'inherit', boxShadow: '0 12px 32px rgba(0,0,0,0.3)',
          }}>Explore the suite ↓</button>
          <button style={{
            padding: '18px 32px', borderRadius: 24,
            background: 'rgba(255,255,255,0.08)', color: '#fff',
            border: '1px solid rgba(255,255,255,0.18)', fontSize: 16, fontWeight: 500,
            cursor: 'pointer', fontFamily: 'inherit', backdropFilter: 'blur(20px)',
          }}>What's new</button>
        </div>
      </div>

      <style>{`
        @keyframes breathe { 0%,100% { transform: scale(1); } 50% { transform: scale(1.04); } }
      `}</style>
    </section>
  );
};
