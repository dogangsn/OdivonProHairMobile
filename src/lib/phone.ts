/** Turkish mobile numbers to E.164, mirroring MainApi's normalizePhone. Null when not a phone. */
export function normalizePhone(input: string): string | null {
  const trimmed = input.trim();
  const digits = trimmed.replace(/\D/g, '');
  let e164: string;
  if (trimmed.startsWith('+')) e164 = `+${digits}`;
  else if (trimmed.startsWith('00')) e164 = `+${digits.slice(2)}`;
  else if (digits.length === 11 && digits.startsWith('0')) e164 = `+90${digits.slice(1)}`;
  else if (digits.length === 10 && digits.startsWith('5')) e164 = `+90${digits}`;
  else if (digits.length === 12 && digits.startsWith('90')) e164 = `+${digits}`;
  else return null;
  return /^\+[1-9]\d{7,14}$/.test(e164) ? e164 : null;
}

/** `+905321234567` → `0532 123 45 67` for display. */
export function formatPhone(e164: string | null | undefined): string {
  if (!e164) return '';
  const m = /^\+90(\d{3})(\d{3})(\d{2})(\d{2})$/.exec(e164);
  return m ? `0${m[1]} ${m[2]} ${m[3]} ${m[4]}` : e164;
}
