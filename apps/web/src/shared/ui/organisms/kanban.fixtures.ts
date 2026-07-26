export const KANBAN_FIXTURES = {
  qualified: {
    header: { stage: 'Calificado', count: 6, totalCents: 6_210_000_000 },
    cards: [
      {
        title: 'Plataforma de facturación',
        company: 'Contabilidad Sierra',
        amountCents: 980_000_000,
        ownerInitials: 'CR',
      },
      {
        title: 'Licencias equipo comercial',
        company: 'Seguros Bolívar Norte',
        amountCents: 2_150_000_000,
        ownerInitials: 'JD',
      },
    ],
  },
  proposal: {
    header: { stage: 'Propuesta', count: 5, totalCents: 4_840_000_000 },
    riskCard: {
      title: 'Implementación POS multitienda',
      company: 'Distrialimentos Andina',
      amountCents: 3_890_000_000,
      ownerInitials: 'CR',
      badge: { tone: 'warning', label: 'En riesgo' },
    },
  },
  contractSent: {
    header: { stage: 'Contrato enviado', count: 3, totalCents: 3_210_000_000 },
    cards: [
      {
        title: 'Suite completa — 3 años',
        company: 'Textiles Medellín',
        amountCents: 2_450_000_000,
        ownerInitials: 'JD',
      },
      {
        title: 'Módulo de cobranza',
        company: 'Inversiones Caribe',
        amountCents: 760_000_000,
        ownerInitials: 'CR',
      },
    ],
  },
  worstCard: {
    title: 'Implementación integral multipaís para Barrancabermeja Distribuciones y Suministros',
    company: 'Barrancabermeja Distribuciones y Suministros S.A.S.',
    amountCents: 120_000_000_000,
    ownerInitials: 'BD',
  },
} as const
