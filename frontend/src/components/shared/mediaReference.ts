const prefix = 'foru-media:';
export function mediaReference(path: string) {
  if (!/^[\w-]+\/[\w-]+\/[\w.-]+$/.test(path) || path.split('/').some(part => part === '.' || part === '..')) throw new Error('La ruta de imagen no es válida.');
  return `${prefix}${path}`;
}
export function privateMediaPath(value: string, userId: string, projectId: string): string | null {
  if (!value.startsWith(prefix)) return null;
  const path = value.slice(prefix.length);
  try { mediaReference(path); } catch { return null; }
  return path.startsWith(`${userId}/${projectId}/`) ? path : null;
}
export function externalImageUrl(value: string): string | null {
  try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password ? url.href : null; } catch { return null; }
}
export function isPrivateMedia(value: string) { return value.startsWith(prefix); }
