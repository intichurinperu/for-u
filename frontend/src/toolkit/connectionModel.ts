export type Connection = {
  provider: string; connected: boolean; checked_at: string | null;
  account_label?: string; verification_state?: 'verified' | 'expired' | 'error'; last_error?: string;
};
export function connectionState(row: Connection | undefined, now: number, loading = false, queryError = false, actionError = false) {
  if (loading) return 'loading';
  if (queryError || actionError) return 'unavailable';
  if (!row) return 'disconnected';
  if (row.verification_state === 'expired') return 'expired';
  if (row.verification_state === 'error') return 'error';
  if (!row.connected) return 'disconnected';
  if (row.verification_state !== 'verified') return 'stale';
  const checked = row.checked_at ? Date.parse(row.checked_at) : NaN;
  return Number.isFinite(checked) && checked <= now && now - checked < 900_000 ? 'verified' : 'stale';
}
export const connectionLabels = {
  loading:'Consultando conexión…', unavailable:'Estado no disponible · reintenta', disconnected:'Sin conectar',
  expired:'Autorización no válida, vencida o revocada', error:'Error al comprobar el servicio', verified:'Conectada y verificada', stale:'Verificación pendiente o vencida · vuelve a verificar',
};
