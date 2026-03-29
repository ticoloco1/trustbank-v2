export function normalizeSlug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 32);
}

export function slugPrice(slug: string): number {
  const len = slug.length;
  if (len === 1) return 5000;
  if (len === 2) return 3500;
  if (len === 3) return 3000;
  if (len === 4) return 1500;
  if (len === 5) return 500;
  if (len === 6) return 150;
  return 12;
}

export function slugTier(slug: string): string {
  const len = slug.length;
  if (len <= 2) return 'Ultra Rare';
  if (len === 3) return 'Legendary';
  if (len <= 5) return 'Premium';
  if (len === 6) return 'Standard';
  return 'Free';
}
