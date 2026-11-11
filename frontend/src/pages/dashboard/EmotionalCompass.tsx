import { Textarea as DSTextarea, ButtonSecondary as DSButtonSecondary, ButtonPrimary as DSButtonPrimary } from '../../components/ui/DesignSystem';
import toast from 'react-hot-toast';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useDialogFocus } from '../../toolkit/useDialogFocus';
import { compassEmotions, loadProjectConfig, parseProjectCompass, saveProjectCompass } from '../../services/projectCompass';
export default function EmotionalCompass({ projectId, onDone, edit = false }: { edit?: boolean; projectId: string; onDone: () => void }) {
  const { user } = useAuth();
  const [config, setConfig] = useState<unknown>(undefined);
  const [goal, setGoal] = useState('');
  const [emotion, setEmotion] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const lock = useRef(false);
  const form = useRef<HTMLFormElement>(null);
  const done = useRef(onDone); done.current = onDone;
  useDialogFocus(form, true, () => { if (!lock.current) done.current(); });
  useEffect(() => {
    if (!user) return;
    let active = true;
    loadProjectConfig(user.id, projectId).then(value => {
      if (!active) return;
      const existing=parseProjectCompass(value);
      if (existing && attempt === 0 && !edit) { done.current(); return; }
      if(existing && attempt===0){setGoal(existing.goal);setEmotion(existing.emotion);}
      setConfig(value); setError('');
    }).catch(reason => { if (active) setError(reason.message); });
    return () => { active = false; };
  }, [user?.id, projectId, attempt, edit]);
  return <div className="project-modal-backdrop"><form ref={form} className="project-modal emotional-compass" role="dialog" aria-modal="true" aria-labelledby="compass-title" onSubmit={async event => {
    event.preventDefault(); if (!user || lock.current || config === undefined) return;
    lock.current = true; setBusy(true); setError('');
    try { await saveProjectCompass(user.id, projectId, config, goal, emotion); window.dispatchEvent(new Event("foru:compass-updated")); toast.success('Tu propósito está guardado'); done.current(); }
    catch (reason) { setError((reason as Error).message); }
    finally { lock.current = false; setBusy(false); }
  }}><span className="compass-symbol" aria-hidden="true">🧭</span><small>Tu negocio empieza contigo</small><h2 id="compass-title">¿Qué quieres lograr con este proyecto?</h2><p>Un propósito que te inspire. Puedes avanzar a tu ritmo.</p>
    <label htmlFor="compass-goal">Mi propósito<DSTextarea id="compass-goal" required maxLength={500} rows={3} value={goal} disabled={busy} onChange={e => setGoal(e.target.value)} placeholder="Ej: Lanzar mi taller de alfajores para Navidad" /></label>
    <fieldset disabled={busy}><legend>¿Qué te gustaría sentir al lograrlo?</legend><div className="compass-emotions">{compassEmotions.map(item => <DSButtonSecondary type="button" key={item.id} aria-pressed={emotion === item.id} onClick={() => setEmotion(item.id)}><span aria-hidden="true">{item.icon}</span> {item.label}</DSButtonSecondary>)}</div></fieldset>
    {error && <div role="alert"><p>{error}</p><DSButtonSecondary type="button" disabled={busy} onClick={() => { setConfig(undefined); setAttempt(value => value + 1); }}>Recargar perfil</DSButtonSecondary></div>}
    <DSButtonPrimary className="project-modal-submit" disabled={busy || config === undefined || !goal.trim() || !emotion}>{busy ? 'Guardando tu propósito…' : '¡Comenzar mi ruta!'}</DSButtonPrimary><DSButtonSecondary type="button" disabled={busy} onClick={onDone}>{edit ? "Cerrar sin guardar" : "Explorar primero"}</DSButtonSecondary>
  </form></div>;
}
export function CompassBadge({ projectId }: { projectId: string }) {
  const { user } = useAuth();
  const [emotion, setEmotion] = useState<string | null>(null);
  useEffect(() => {
    let active = true; setEmotion(null);
    const load=()=>{if (user) void loadProjectConfig(user.id, projectId).then(config => { if (active) setEmotion(parseProjectCompass(config)?.emotion ?? null); }).catch(() => {});};load();window.addEventListener('foru:compass-updated',load);window.addEventListener('focus',load);
    return () => { active = false; window.removeEventListener('foru:compass-updated',load);window.removeEventListener('focus',load); };
  }, [user?.id, projectId]);
  const item = compassEmotions.find(value => value.id === emotion);
  return item ? <span className="compass-badge">{item.icon} Mi brújula: {item.label}</span> : null;
}
