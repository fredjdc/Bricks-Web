window.Footer = function Footer() {
  return (
    <footer style={{
      padding: '56px 48px 48px', borderTop: '1px solid #E7ECEF',
      background: '#F6F7F8',
    }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 32, flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <img src="../../assets/bricks-dark-logo.svg" style={{ height: 20, opacity: 0.85 }} />
          <span style={{ fontSize: 13, color: '#55626E' }}>© 2026 Bricks Apps. Made with care.</span>
        </div>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          {[
            { src: '../../assets/icon-x.svg', label: 'X' },
            { src: '../../assets/icon-instagram.svg', label: 'Instagram' },
            { src: '../../assets/icon-linkedin.svg', label: 'LinkedIn' },
          ].map(s => (
            <a key={s.label} href="#" style={{
              width: 40, height: 40, borderRadius: '50%', background: '#F6F7F8',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '4px 4px 8px #E7ECEF, -4px -4px 8px #fff',
              textDecoration: 'none',
            }}><img src={s.src} style={{ width: 16, height: 16, opacity: 0.7 }} /></a>
          ))}
        </div>
      </div>
    </footer>
  );
};
