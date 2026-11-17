const pad = (n: number) => String(n).padStart(2, '0');

/** Local calendar date as `yyyy-MM-dd` (MainApi's appointment date format). */
export function isoDate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

const DAY_NAMES = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
const MONTHS = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];

export function dayLabel(date: Date): string {
  return DAY_NAMES[date.getDay()];
}

/** `2026-11-18` → `18 Kas Çar`. */
export function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return `${d} ${MONTHS[m - 1]} ${DAY_NAMES[date.getDay()]}`;
}

export function formatMoney(amount: number): string {
  return `${amount.toLocaleString('tr-TR', { maximumFractionDigits: 2 })} ₺`;
}

/** Extracts the salon slug from a booking link, a `/r/{slug}` path or a bare slug. */
export function slugFromLink(input: string): string | null {
  const text = input.trim();
  const match = /\/(?:r|booking)\/([a-z0-9-]+)/i.exec(text);
  const slug = match ? match[1] : text;
  return /^[a-z0-9-]{2,80}$/i.test(slug) ? slug.toLowerCase() : null;
}
