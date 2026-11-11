import {useState} from 'react';
import {useWorkspaceFocus} from '../pages/dashboard/WorkspaceFocus';
import {accountPreferences,type AccountPreferences as Preferences} from '../pages/dashboard/workspaceFocusModel';
import {ButtonPrimary,ButtonSecondary} from '../components/ui/DesignSystem';
export default function AccountPreferences(){
 const {state,setPreferences,save}=useWorkspaceFocus();const [step,setStep]=useState<number|null>(null),[draft,setDraft]=useState<Preferences>(()=>accountPreferences(state.data));
 if(step===null)return <section className="magic-card"><h2>Para ti</h2><p>Tu nombre y cómo quieres que FOR U te acompañe pertenecen a tu cuenta, no al negocio.</p><ButtonSecondary disabled={!state.loaded||state.busy} onClick={()=>{setDraft(accountPreferences(state.data));setStep(0);}}>Personalizar mi experiencia</ButtonSecondary></section>;
 const title=['¿Cómo quieres que te llamemos?','¿Cómo prefieres que te hablemos?'][step];
 return <section className="magic-card" aria-label="Preferencias personales"><small>PARA TI · {step+1} DE 2</small><h2>{title}</h2>
 {step===0?<input aria-label={title} maxLength={120} value={draft.preferredName} onChange={e=>setDraft({...draft,preferredName:e.target.value})}/>:<div className="area-tools">{([['neutral','Lenguaje neutral'],['feminine','Femenino'],['masculine','Masculino'],['at','Con @']] as const).map(([addressing,label])=><ButtonSecondary key={addressing} aria-pressed={draft.addressing===addressing} onClick={()=>setDraft({...draft,addressing})}>{label}</ButtonSecondary>)}</div>}
 <div className="area-tools">{step>0&&<ButtonSecondary disabled={state.busy} onClick={()=>setStep(step-1)}>Atrás</ButtonSecondary>}{step<1?<><ButtonPrimary onClick={()=>setStep(step+1)}>Continuar</ButtonPrimary><ButtonSecondary onClick={()=>setStep(step+1)}>Omitir</ButtonSecondary></>:<ButtonPrimary disabled={state.busy||state.conflict} onClick={()=>{setPreferences(draft);void save();}}>Guardar mis preferencias</ButtonPrimary>}<ButtonSecondary disabled={state.busy} onClick={()=>setStep(null)}>Cerrar</ButtonSecondary></div>
 <p role={state.error?'alert':'status'}>{state.error||(state.busy?'Guardando…':state.dirty?'Cambios de tu cuenta pendientes':state.revision?'Preferencias guardadas en tu cuenta':'Puedes dejarlo para después.')}</p>
 </section>;
}
