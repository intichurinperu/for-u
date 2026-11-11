import {publicationRevision} from './publicationRevision';
import {useEffect,useState} from 'react';
import {Link} from 'react-router-dom';
import {supabase} from '../lib/supabaseClient';
import {ButtonSecondary} from '../components/ui/DesignSystem';
export default function DesignSource({user,project,revision,section,offer,quiet=false,mode='draft'}:{user:string;project:string;revision:string;section:string;offer?:string;quiet?:boolean;mode?:'draft'|'published'}){
 const [state,setState]=useState<'checking'|'same'|'changed'|'error'>('checking'),[attempt,setAttempt]=useState(0);
 useEffect(()=>{let active=true;setState('checking');if(!supabase){setState('error');return;}if(mode==='published'){void supabase.from('toolkit_sites').select('content,published').eq('user_id',user).eq('project_id',project).maybeSingle().then(async({data,error})=>{const same=!error&&data?.published&&(await publicationRevision(data.content))===revision;if(active)setState(error?'error':same?'same':'changed');});return()=>{active=false;};}void supabase.from('toolkit_documents').select('updated_at').eq('user_id',user).eq('project_id',project).eq('kind','landing').maybeSingle().then(({data,error})=>{if(active)setState(error?'error':data?.updated_at===revision?'same':'changed');});return()=>{active=false;};},[user,project,revision,attempt,mode]);
 if(quiet&&(state==='same'||state==='checking'))return null;
 return <aside className="design-source" role={state==='error'?'alert':'status'}>{state==='checking'?'Comprobando página de origen…':state==='same'?mode==='published'?'Pieza preparada desde tu publicación.':'Pieza preparada desde tu borrador guardado.':state==='changed'?'Tu página cambió. Revisa esta pieza; tu diseño se conserva.':'No pudimos comprobar la página de origen. El diseño se conserva.'}{state==='error'&&<ButtonSecondary onClick={()=>setAttempt(a=>a+1)}>Reintentar</ButtonSecondary>}{state==='changed'&&<Link to={`/creator-studio?project=${encodeURIComponent(project)}&start=first-content&from=landing&section=${encodeURIComponent(section)}${offer?'&offer='+encodeURIComponent(offer):''}`} >Preparar otra variante →</Link>}</aside>;
}
