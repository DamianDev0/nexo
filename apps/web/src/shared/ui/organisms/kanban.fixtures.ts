export const KANBAN_FIXTURES = {
  qualified: {
    header: { stage: 'Qualified', count: 6, totalCents: 6_210_000_000 },
    cards: [
      {
        title: 'Invoicing platform',
        company: 'Contabilidad Sierra',
        valueCents: 980_000_000,
        ownerInitials: 'CR',
      },
      {
        title: 'Sales team licenses',
        company: 'Seguros Bolívar Norte',
        valueCents: 2_150_000_000,
        ownerInitials: 'JD',
      },
    ],
  },
  proposal: {
    header: { stage: 'Proposal', count: 5, totalCents: 4_840_000_000 },
    riskCard: {
      title: 'Multi-store POS rollout',
      company: 'Distrialimentos Andina',
      valueCents: 3_890_000_000,
      ownerInitials: 'CR',
      badge: { tone: 'warning', label: 'At risk' },
    },
  },
  contractSent: {
    header: { stage: 'Contract sent', count: 3, totalCents: 3_210_000_000 },
    cards: [
      {
        title: 'Full suite — 3 years',
        company: 'Textiles Medellín',
        valueCents: 2_450_000_000,
        ownerInitials: 'JD',
      },
      {
        title: 'Collections module',
        company: 'Inversiones Caribe',
        valueCents: 760_000_000,
        ownerInitials: 'CR',
      },
    ],
  },
  worstCard: {
    title: 'Multi-country end-to-end rollout for Barrancabermeja Distribuciones y Suministros',
    company: 'Barrancabermeja Distribuciones y Suministros S.A.S.',
    valueCents: 120_000_000_000,
    ownerInitials: 'BD',
  },
} as const
