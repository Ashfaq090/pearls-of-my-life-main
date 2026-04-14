export function normalizeMonthlyPrice(plan: any): number {
  const raw = plan?.price ?? plan?.monthlyPrice ?? plan?.amount ?? 0;
  const num = typeof raw === 'string' ? Number(raw.replace(/[^0-9.]/g, '')) : Number(raw);
  return Number.isFinite(num) ? num : 0;
}

export function getYearlyPrice(plan: any): number {
  const monthly = normalizeMonthlyPrice(plan);
  return monthly * 12;
}

export function getPeriodLabel(): string {
  return '/year';
}

export function getDurationLabel(): string {
  return '1 year';
}
