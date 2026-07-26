import type { ScaleRow } from '../shared/config/tokens/design-scale'

export function ScaleTable({ rows }: Readonly<{ rows: ReadonlyArray<ScaleRow> }>) {
  return (
    <table
      style={{
        width: '100%',
        borderCollapse: 'collapse',
        font: "400 14px/1.6 'Satoshi', sans-serif",
      }}
    >
      <thead>
        <tr>
          {['Token', 'Value', 'Use'].map((h) => (
            <th
              key={h}
              style={{
                textAlign: 'left',
                padding: '8px 12px',
                borderBottom: '1px solid var(--border)',
                font: "900 11px 'Satoshi', sans-serif",
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--faint)',
              }}
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.token}>
            <td
              style={{
                padding: '10px 12px',
                borderBottom: '1px solid var(--row-divider)',
                fontWeight: 700,
              }}
            >
              {row.token}
            </td>
            <td
              style={{
                padding: '10px 12px',
                borderBottom: '1px solid var(--row-divider)',
                font: "400 12px 'Geist Mono', monospace",
                color: 'var(--muted-foreground)',
              }}
            >
              {row.value}
            </td>
            <td
              style={{
                padding: '10px 12px',
                borderBottom: '1px solid var(--row-divider)',
                color: 'var(--body)',
              }}
            >
              {row.use}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
