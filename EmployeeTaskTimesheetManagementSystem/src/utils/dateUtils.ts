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
