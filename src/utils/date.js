const pad = (n) => String(n).padStart(2, '0');

/** Today as DD-MM-YYYY. */
export function today() {
  const d = new Date();
  return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()}`;
}

export function isValidDate(value) {
  const m = /^(\d{2})-(\d{2})-(\d{4})$/.exec(value.trim());
  if (!m) return false;
  const [, dd, mm, yyyy] = m.map(Number);
  const d = new Date(yyyy, mm - 1, dd);
  return d.getFullYear() === yyyy && d.getMonth() === mm - 1 && d.getDate() === dd;
}

/** DD-MM-YYYY -> YYYY-MM-DD (for <input type="date">), or '' if invalid. */
export function toIso(value) {
  if (!isValidDate(value)) return '';
  const [dd, mm, yyyy] = value.trim().split('-');
  return `${yyyy}-${mm}-${dd}`;
}

/** YYYY-MM-DD -> DD-MM-YYYY. */
export function fromIso(iso) {
  const [yyyy, mm, dd] = iso.split('-');
  return `${dd}-${mm}-${yyyy}`;
}
