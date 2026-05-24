// Feature row — trio of callouts for a single product
window.FeatureRow = function FeatureRow() {
  return (
    <section style={{
      padding: '120px 48px', maxWidth: 1200, margin: '0 auto',
    }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 96, alignItems: 'center' }}>
        <div>
          <div style={{
            fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
            color: '#00A6A1', marginBottom: 16,
          }}>Bricks Scan</div>
          <h2 style={{
            fontSize: 48, fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.08,
            margin: '0 0 24px', color: '#0B0F14',
          }}>
            Your scans<br/>organize themselves.
          </h2>
          <p style={{ fontSize: 18, lineHeight: 1.6, color: '#55626E', margin: '0 0 40px', maxWidth: 480 }}>
            Scan receipts, contracts, and listings. Bricks reads each one, gives it a clear name, and files it in the right folder. No accounts. No uploads.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <Callout title="Auto-Sort" body="Every file gets a clear name. You don't decide." />
            <Callout title="Search inside scans" body="Find any word, address, or clause — instantly." />
            <Callout title="On device, private" body="Processed on your iPhone. Nothing leaves it." />
          </div>
        </div>

        {/* Right — recessed well showing a sample file */}
        <div style={{
          background: '#F6F7F8', borderRadius: 48, padding: 40,
          boxShadow: 'inset 6px 6px 12px #E7ECEF, inset -6px -6px 12px #fff',
          minHeight: 460, display: 'flex', flexDirection: 'column', gap: 14, justifyContent: 'center',
        }}>
          {['2026 Purchase Agreement — 412 Oak St.pdf', '1127 Ashford — Inspection Report.pdf', 'Closing Docs — Morales.pdf', 'Comps — Riverside Q1 2026.pdf'].map((name, i) => (
            <div key={name} style={{
              background: '#fff', borderRadius: 16, padding: '16px 18px',
              boxShadow: '4px 6px 16px #E7ECEF, -2px -2px 6px #fff',
              display: 'flex', alignItems: 'center', gap: 14,
              opacity: 1 - i * 0.08,
            }}>
              <div style={{
                width: 40, height: 48, borderRadius: 8, background: '#F6F7F8',
                boxShadow: 'inset 2px 2px 4px #E7ECEF, inset -2px -2px 4px #fff',
                display: 'flex', alignItems: 'flex-end', padding: 4, justifyContent: 'center',
              }}>
                <div style={{
                  width: '100%', height: 3, background: '#00A6A1',
                  borderRadius: 2,
                }}/>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#0B0F14', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {name}
                </div>
                <div style={{ fontSize: 12, color: '#55626E', marginTop: 2 }}>
                  Contracts · {Math.floor(Math.random()*20)+1} pages
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

function Callout({ title, body }) {
  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
      <div style={{
        width: 8, height: 8, borderRadius: 4, background: '#00A6A1',
        marginTop: 8, flexShrink: 0,
      }} />
      <div>
        <div style={{ fontSize: 18, fontWeight: 600, color: '#0B0F14', marginBottom: 4 }}>{title}</div>
        <div style={{ fontSize: 15, color: '#55626E', lineHeight: 1.55 }}>{body}</div>
      </div>
    </div>
  );
}
