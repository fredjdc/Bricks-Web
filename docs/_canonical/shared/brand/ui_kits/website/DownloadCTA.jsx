window.DownloadCTA = function DownloadCTA() {
  return (
    <section style={{ padding: '80px 48px 120px', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{
        background: '#0B0F14', borderRadius: 48, padding: '80px 64px',
        textAlign: 'center', position: 'relative', overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(11,15,20,0.2)',
      }}>
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(circle at 80% 20%, rgba(0,166,161,0.12) 0%, transparent 55%)',
        }} />
        <h2 style={{
          fontSize: 52, fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.1,
          margin: '0 0 20px', color: '#fff', position: 'relative',
        }}>
          Quiet software for<br/>a noisy job.
        </h2>
        <p style={{
          fontSize: 18, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6,
          margin: '0 auto 40px', maxWidth: 540, position: 'relative',
        }}>
          Bricks runs on iPhone, iPad, and Mac. Free to try. No account.
        </p>
        <div style={{ display: 'inline-flex', gap: 12, alignItems: 'center', position: 'relative' }}>
          <button style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            padding: '14px 24px', background: '#fff', color: '#0B0F14',
            border: 'none', borderRadius: 16, fontSize: 15, fontWeight: 600,
            fontFamily: 'inherit', cursor: 'pointer',
          }}>
            <img src="../../assets/apple-icon.svg" style={{ width: 18, height: 18 }} />
            Download on the App Store
          </button>
        </div>
      </div>
    </section>
  );
};
