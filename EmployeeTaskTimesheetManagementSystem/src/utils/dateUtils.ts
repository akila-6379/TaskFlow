/**
 * Enforces a maximum 4-digit year on native <input type="date"> onChange events.
 * Browser date inputs return ISO "YYYY-MM-DD". When the user keeps typing in the
 * year segment extra digits accumulate; this trims the year back to 4 chars.
 *
 * Usage:
 *   onChange={(e) => setForm({ ...form, dueDate: capDateYear(e.target.value) })}
 */
export function capDateYear(value: string): string {
  if (!value) return value;
  const parts = value.split('-');
  if (parts.length >= 1 && parts[0].length > 4) {
    parts[0] = parts[0].slice(0, 4);
  }
  return parts.join('-');
}

export function formatDateToDMY(value: string | Date | null): string {
  if (!value) return '';
  const dateObj = new Date(value);
  if (Number.isNaN(dateObj.getTime())) return '';
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = dateObj.getFullYear();
  return `${day}-${month}-${year}`;
}
