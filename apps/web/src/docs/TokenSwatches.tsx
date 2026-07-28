import { TOKEN_GROUPS, WHITE_LABEL_CONTRACT } from '../shared/config/tokens/theme-contract'

export function TokenSwatches() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {TOKEN_GROUPS.map((group) => (
        <section key={group.title}>
          <h3 style={{ font: "900 15px 'Satoshi', sans-serif", margin: '0 0 12px' }}>
            {group.title}
          </h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
              gap: 12,
            }}
          >
            {group.tokens.map((token) => (
              <div
                key={token.name}
                style={{
                  borderRadius: 16,
                  overflow: 'hidden',
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                }}
              >
                <div style={{ height: 48, background: `var(${token.variable})` }} />
                <div style={{ padding: '10px 12px' }}>
                  <div
                    style={{ font: "700 12px 'Satoshi', sans-serif", color: 'var(--foreground)' }}
                  >
                    {token.name}
                  </div>
                  <div
                    style={{
                      font: "400 11px 'Geist Mono', monospace",
                      color: 'var(--muted-foreground)',
                      marginTop: 2,
                    }}
                  >
                    var({token.variable})
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
      <section>
        <h3 style={{ font: "900 15px 'Satoshi', sans-serif", margin: '0 0 12px' }}>
          White-label contract
        </h3>
        <ul style={{ font: "400 14px/1.7 'Satoshi', sans-serif", color: 'var(--body)' }}>
          {WHITE_LABEL_CONTRACT.map((variable) => (
            <li key={variable}>
              <code>{variable}</code>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
