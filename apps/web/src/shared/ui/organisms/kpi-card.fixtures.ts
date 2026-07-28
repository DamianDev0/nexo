export const KPI_FIXTURES = {
  pipeline: {
    label: 'Open pipeline',
    cents: 18_450_000_000,
    delta: { tone: 'positive', label: '↑ 12%' },
  },
  closing: {
    label: 'Closing this month',
    cents: 5_230_000_000,
    note: '9 deals · 68% of goal',
  },
  won: {
    label: 'Won in July',
    cents: 4_180_000_000,
    delta: { tone: 'positive', label: '6 closed' },
  },
  stalled: {
    label: 'Stalled +10 days',
    figure: '7',
    delta: { tone: 'warning', label: 'Needs follow-up' },
  },
  worst: {
    label: 'Consolidated multi-country weighted forecast for the next fiscal year',
    cents: 120_000_000_000,
    delta: { tone: 'negative', label: '↓ 48% vs. an unusually strong previous quarter' },
  },
} as const
