const DAY = 86_400_000;
export function dayNumber(value: string): number {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error('Selecciona una fecha válida.');
  const timestamp = Date.parse(`${value}T00:00:00Z`);
  if (!Number.isFinite(timestamp) || new Date(timestamp).toISOString().slice(0, 10) !== value) throw new Error('Selecciona una fecha válida.');
  return timestamp / DAY;
}
export function nightsBetween(start: string, end: string) {
  const nights = dayNumber(end) - dayNumber(start);
  if (nights <= 0) throw new Error('La salida debe ser posterior a la entrada.');
  return nights;
}
export function addDays(date: string, days: number) {
  return new Date((dayNumber(date) + days) * DAY).toISOString().slice(0, 10);
}
export function localDate(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
