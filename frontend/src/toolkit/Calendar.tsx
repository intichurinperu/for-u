import './calendarGuided.css';
import EditorSheet from './EditorSheet';
import type {Piece} from '../social/model';
import type {AreaTask} from '../pages/dashboard/areaModel';
import TaskSuggestion from '../ai/TaskSuggestion';
import { Card as DSCard } from '../components/ui/DesignSystem';
import { ButtonSecondary as DSButtonSecondary, Input as DSInput, ButtonPrimary as DSButtonPrimary } from '../components/ui/DesignSystem';
import toast from 'react-hot-toast';
import { useEffect, useRef, useState } from "react";
import { useToolkit } from "./ToolkitContext";
import { localDate } from "./engine";
import { downloadBlob } from "./api";
import type { CalendarEntry } from "./types";
import { useUnsavedNavigation } from '../lib/useUnsavedNavigation';
import { calendarDateTime, calendarICS, readCalendar, upsertCalendarActivity,calendarWindow,type CalendarView } from './calendarModel';
export default function Calendar({linkedTasks=[],onOpenTask,linkedPieces=[],onOpenPiece}:{linkedTasks?:AreaTask[];onOpenTask?:(task:AreaTask)=>void;linkedPieces?:Piece[];onOpenPiece?:(id:string)=>void}={}) {
  const { docs, save, track, reload, projectId } = useToolkit();
  let initial: CalendarEntry[] = [], formatError = '';
  try { initial = readCalendar(docs.calendar); } catch(e) { formatError = (e as Error).message; }
  const [entries, setEntries] = useState<CalendarEntry[]>(
    initial,
  );
  const [anchor, setAnchor] = useState(new Date());
  const [view, setView] = useState<CalendarView>("agenda");
  const [title, setTitle] = useState("");
  const [formOpen,setFormOpen]=useState(false),[formStep,setFormStep]=useState(0);
  const [date, setDate] = useState(localDate(new Date()));
  const [time, setTime] = useState("10:00");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [pending, setPending] = useState<CalendarEntry[] | null>(null);
  const [saveError, setSaveError] = useState('');
  const [recovery, setRecovery] = useState(false);
  const conflict = saveError.includes('otra pestaña');
  const blocked = busy || conflict || Boolean(formatError);
  const savingRef = useRef(false);
  const formDraftId=useRef<string|null>(null);
  const formRef=useRef<HTMLFormElement>(null);
  useEffect(()=>{if(formOpen)formRef.current?.querySelector<HTMLInputElement>('input')?.focus();},[formOpen,formStep]);
  const [notifications, setNotifications] = useState(false);
  const reminded = useRef(new Set<string>());
  const original = entries.find(entry => entry.id === editing);
  useUnsavedNavigation(pending !== null || (editing ? Boolean(original && (original.title !== title || original.date !== date || original.time !== time)) : Boolean(title.trim())));
  const days=calendarWindow(anchor,view);
  const occupied=new Set([...entries.map(entry=>entry.date),...linkedTasks.map(task=>task.date),...linkedPieces.map(piece=>piece.date)]);
  const visibleDays=view==='agenda'?days.filter(day=>occupied.has(localDate(day))):days;
  useEffect(() => {
    const timer = window.setInterval(() => {
      for (const entry of entries) {
        const due = new Date(`${entry.date}T${entry.time}`).getTime();
        if (
          !entry.done &&
          Date.now() >= due &&
          Date.now() - due < 15 * 60_000 &&
          !reminded.current.has(entry.id)
        ) {
          reminded.current.add(entry.id);
          setNotice(`Es momento de: ${entry.title}`);
          if (
            notifications &&
            "Notification" in window &&
            Notification.permission === "granted"
          )
            new Notification("FOR U · Tu próximo paso", {
              body: entry.title,
              tag: entry.id,
            });
        }
      }
    }, 15_000);
    return () => clearInterval(timer);
  }, [entries, notifications]);
  async function update(next: CalendarEntry[]) {
    if (savingRef.current || formatError || conflict) return false;
    readCalendar(next);
    setEntries(next);
    setPending(next);
    setSaveError('');
    setNotice('');
    savingRef.current = true;
    setBusy(true);
    try {
      await save("calendar", next);
      setPending(null);
      setNotice('Agenda guardada en tu cuenta.');
      toast.success('Agenda guardada', { id: `calendar-saved` });
      return true;
    } catch (e) {
      setSaveError((e as Error).message);
      setNotice('Cambios pendientes de guardar.');
      return false;
    } finally {
      setBusy(false);
      savingRef.current = false;
    }
  }
  function shift(direction: number) {
    const next = new Date(anchor);
    if (view === "month") {
      next.setDate(1);
      next.setMonth(next.getMonth() + direction);
    } else next.setDate(next.getDate() + 7 * direction);
    setAnchor(next);
  }
  function moveEntry(entry: CalendarEntry, value: string) {
    if(blocked || !value) return;
    try { calendarDateTime(value,entry.time); } catch { setNotice('Revisa la fecha.'); return; }
    void update(entries.map(item=>item.id===entry.id?{...item,date:value}:item));
  }
  function exportCalendar() {
    downloadBlob(
      new Blob([calendarICS(entries,new Date(),linkedTasks.flatMap(t=>t.date?[{id:t.id,title:t.title,date:t.date,done:t.done}]:[]),linkedPieces.filter(p=>p.date).map(p=>({id:p.id,title:p.title||'Mi pieza',date:p.date})))], { type: "text/calendar;charset=utf-8" }),
      "agenda-for-u.ics",
    );
  }
  return (
    <div className="tk-stack tk-calendar-workspace">
      {formatError && <p role="alert">{formatError}</p>}
      {pending !== null && <div><p role="status">{busy ? 'Guardando agenda…' : 'Cambios pendientes de guardar en tu cuenta.'}</p><DSButtonPrimary disabled={blocked} onClick={()=>void update(pending)}>Guardar cambios de agenda</DSButtonPrimary></div>}
      {saveError && <div role="alert"><p>{saveError}</p>{!conflict && <DSButtonSecondary disabled={busy} onClick={() => pending && void update(pending)}>Reintentar guardado</DSButtonSecondary>}<DSButtonSecondary disabled={busy} onClick={() => setRecovery(true)}>Recuperar agenda guardada</DSButtonSecondary><DSButtonSecondary onClick={() => downloadBlob(new Blob([JSON.stringify({projectId,entries},null,2)],{type:'application/json'}),'agenda-pendiente.json')}>Descargar mis cambios pendientes</DSButtonSecondary></div>}
      {recovery && <section aria-label="Recuperar agenda"><p>Recuperar descartará los cambios pendientes de esta pantalla. Puedes descargarlos primero.</p><DSButtonSecondary onClick={() => setRecovery(false)}>Conservar mis cambios</DSButtonSecondary><DSButtonSecondary onClick={() => { setPending(null); setSaveError(''); void reload(); }}>Descartar pendientes y recuperar</DSButtonSecondary></section>}
      <style>{`
        .tk-stack.magic-card {
           border: 1px solid rgba(212, 212, 212, 0.76);
           border-radius: var(--border-radius-grande);
           background: var(--color-superficie);
           box-shadow: var(--sombra-magica);
           padding: 1rem;
        }
        .tk-calendar .tk-day, .tk-calendar .tk-event {
           background: rgba(250, 250, 250, 0.86);
           border-radius: 12px;
           box-shadow: var(--sombra-suave);
        }
        .tk-calendar .tk-day.is-today {
           background: var(--gradient-iridiscente);
           font-weight: 900;
        }
        .tk-calendar .tk-event {
           animation: fadeIn 0.4s ease-out forwards;
        }
        .tk-stack .magic-button-soft {
           background: rgba(212, 212, 212, 0.16); color: var(--color-texto); border-radius: 999px; padding: 0.5rem 1rem; font-weight: 600; border: none;
        }
      `}</style>
      <DSCard as="section" className="tk-card tk-stack">
        <div className="tk-toolbar">
          <div>

            <h2>Tu calendario</h2>
          </div>
          <DSButtonSecondary onClick={() => setView(view === "month" ? "agenda" : "month")}>
            {view === "month" ? "Ver agenda" : "Ver mes"}
          </DSButtonSecondary>
          <details className="calendar-extra-options"><summary>Opciones del calendario</summary><DSButtonSecondary onClick={()=>setView('week')}>Ver semana completa</DSButtonSecondary><DSButtonSecondary onClick={exportCalendar} disabled={!entries.length&&!linkedTasks.some(task=>task.date)&&!linkedPieces.some(piece=>piece.date)}>
            Exportar agenda
          </DSButtonSecondary>
          <DSButtonSecondary
            onClick={async () => {
              if (!("Notification" in window)) {
                setNotice("Este navegador no admite notificaciones.");
                return;
              }
              const permission = await Notification.requestPermission();
              setNotifications(permission === "granted");
              setNotice(
                permission === "granted"
                  ? "Recordatorios activos mientras FOR U esté abierto."
                  : "Puedes importar la agenda para recibir recordatorios.",
              );
            }}
          >
            Activar recordatorios
          </DSButtonSecondary>
        <small>
          Los avisos de FOR U funcionan con la app abierta. Importa la agenda en
          tu calendario para recibirlos cuando la cierres. La exportación es una
          copia de tu agenda; no sincroniza cambios posteriores.
        </small></details></div>
        <DSButtonPrimary disabled={blocked} onClick={()=>{setFormOpen(true);setFormStep(0);}}>＋ Añadir una actividad</DSButtonPrimary>
        <EditorSheet open={formOpen} title={editing?'Editar actividad':'Un espacio para tu próximo paso'} onClose={()=>setFormOpen(false)}>
        <form ref={formRef} className="calendar-guided-entry"
          onSubmit={async (e) => {
            e.preventDefault();
            if(formStep<2){setFormStep(formStep+1);return;}
            const nextTitle=title.trim(),nextDate=date,nextTime=time;
            if (blocked || !nextTitle) return;
            try { calendarDateTime(nextDate,nextTime); } catch { setNotice('Revisa el título, la fecha y la hora.'); return; }
            const id=editing||formDraftId.current||crypto.randomUUID();
            formDraftId.current=id;
            const success=await update(upsertCalendarActivity(entries,id,{title:nextTitle,date:nextDate,time:nextTime}));
              if(success){formDraftId.current=null;setTitle("");setEditing(null);setFormOpen(false);setFormStep(0);track("calendar",true);}
          }}
        >
          <small>Paso {formStep+1} de 3</small>
          {formStep===0&&<DSInput label="¿Qué quieres hacer?" required name="title" value={title} maxLength={200} onChange={e=>setTitle(e.target.value)} placeholder="Escribe una actividad" disabled={blocked}/>}
          {formStep===1&&<DSInput label="¿Qué día le hacemos espacio?" required type="date" name="date" value={date} onInput={e=>setDate(e.currentTarget.value)} onChange={e=>setDate(e.target.value)} disabled={blocked}/>}
          {formStep===2&&<DSInput label="¿A qué hora quieres empezar?" required type="time" name="time" value={time} onInput={e=>setTime(e.currentTarget.value)} onChange={e=>setTime(e.target.value)} disabled={blocked}/>}
          <div className="calendar-guided-actions">{formStep>0&&<DSButtonSecondary type="button" disabled={blocked} onClick={()=>setFormStep(formStep-1)}>← Atrás</DSButtonSecondary>}<DSButtonPrimary type="submit" disabled={blocked||!title.trim()}>{busy?'Guardando…':formStep<2?'Continuar →':'Guardar actividad'}</DSButtonPrimary></div>
          {saveError&&<p role="alert">{saveError} Tu actividad sigue aquí.</p>}
        </form></EditorSheet>
      </DSCard>
      <DSCard as="section" className="tk-card tk-stack">
        <div className="tk-toolbar">
          <DSButtonSecondary className="magic-button magic-button-soft" aria-label="Periodo anterior" onClick={() => shift(-1)}>
            ←
          </DSButtonSecondary>
          <h3>
            {view==='month'?anchor.toLocaleDateString('es-PE',{month:'long',year:'numeric'}):days[0].toLocaleDateString('es-PE',{day:'numeric',month:'short'})+' — '+days[days.length-1].toLocaleDateString('es-PE',{day:'numeric',month:'short'})}
          </h3>
          <DSButtonSecondary className="magic-button magic-button-soft" aria-label="Periodo siguiente" onClick={() => shift(1)}>
            →
          </DSButtonSecondary>
          <DSButtonSecondary className="magic-button magic-button-soft" onClick={() => setAnchor(new Date())}>Hoy</DSButtonSecondary>
        </div>
        {original&&<TaskSuggestion key={original.id} projectId={projectId} sourceId={original.id} title={original.title} kind="calendar" disabled={blocked||Boolean(pending)} onApply={(nextTitle,guidance)=>{const next=entries.map(item=>item.id===original.id?{...item,title:nextTitle,guidance}:item);setEntries(next);setPending(next);setTitle(nextTitle);}}/>}
        {view==='agenda'&&visibleDays.length===0&&<div className="calendar-agenda-empty"><span aria-hidden="true">◷</span><strong>Estos días tienen espacio para ti.</strong><p>Tus actividades, tareas y contenidos aparecerán aquí cuando les pongas fecha.</p></div>}
        <div className={`tk-calendar${view==='agenda'?' calendar-agenda':''}`}>
          {visibleDays.map((day) => {
            const key = localDate(day);
            return (
              <div
                key={key}
                className={`tk-day ${key === localDate(new Date()) ? "is-today" : ""}`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const id = e.dataTransfer.getData("text/foru-event");
                  if (!blocked && entries.some((item) => item.id === id))
                    void update(
                      entries.map((item) =>
                        item.id === id ? { ...item, date: key } : item,
                      ),
                    );
                }}
              >
                <time dateTime={key}>
                  {day.toLocaleDateString("es-PE", {
                    weekday: "short",
                    day: "numeric",
                  })}
                </time>
                {linkedPieces.filter(piece=>piece.date===key).map(piece=><DSButtonSecondary key={`piece:${piece.id}`} className="calendar-linked-task" onClick={()=>onOpenPiece?.(piece.id)}>{piece.title||'Pieza sin título'}<small>Contenido</small></DSButtonSecondary>)}
                {linkedTasks.filter(task=>task.date===key).map(task=><DSButtonSecondary key={`task:${task.id}`} className="calendar-linked-task" onClick={()=>onOpenTask?.(task)}>{task.done?'✓':'○'} {task.title}<small>Tarea</small></DSButtonSecondary>)}
                {entries
                  .filter((item) => item.date === key)
                  .sort((a, b) => a.time.localeCompare(b.time))
                  .map((entry) => (
                    <div
                      className={`tk-event animate-fade-in ${entry.done ? "is-done" : ""}`}
                      key={entry.id}
                      draggable={!blocked}
                      onDragStart={(e) =>
                        e.dataTransfer.setData("text/foru-event", entry.id)
                      }
                    >
                      <span>{entry.time}</span>
                      <strong>{entry.title}</strong>
                      <DSButtonSecondary disabled={blocked} onClick={() => { setEditing(entry.id); setTitle(entry.title); setDate(entry.date); setTime(entry.time); formDraftId.current=null; setFormStep(0); setFormOpen(true); }}>Editar actividad</DSButtonSecondary>
                      <details className="calendar-activity-options"><summary>Opciones</summary><label className="tk-check">
                        <DSInput
                          type="checkbox"
                          checked={entry.done}
                          disabled={blocked}
                          onChange={() => {
                            void update(
                              entries.map((item) =>
                                item.id === entry.id
                                  ? { ...item, done: !item.done }
                                  : item,
                              ),
                            );
                          }}
                        />{" "}
                        Hecho
                      </label>
                      <label>
                        Mover a
                        <DSInput
                          type="date"
                          value={entry.date}
                          disabled={blocked}
                          onInput={e=>moveEntry(entry,e.currentTarget.value)}
                          onChange={e=>moveEntry(entry,e.target.value)}
                        />
                      </label>
                      <a
                        target="_blank"
                        rel="noreferrer"
                        href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(entry.title)}&dates=${new Date(
                          `${entry.date}T${entry.time}`,
                        )
                          .toISOString()
                          .replace(/[-:]/g, "")
                          .replace(/\.\d{3}/, "")}/${new Date(
                          new Date(`${entry.date}T${entry.time}`).getTime() +
                            30 * 60_000,
                        )
                          .toISOString()
                          .replace(/[-:]/g, "")
                          .replace(/\.\d{3}/, "")}`}
                      >
                        Agregar a Google Calendar ↗
                      </a>
                      <DSButtonSecondary
                        disabled={blocked}
                        onClick={() =>
                          update(entries.filter((item) => item.id !== entry.id))
                        }
                      >
                        Eliminar
                      </DSButtonSecondary></details>
                    </div>
                  ))}
              </div>
            );
          })}
        </div>
      </DSCard>
      {notice && (
        <p role="status" className="tk-notice">
          {notice}
        </p>
      )}
    </div>
  );
}
