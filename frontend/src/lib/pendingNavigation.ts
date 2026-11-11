type NavigationLocation={pathname:string;search:string};
const profileViews=new Set(['profile','grid','list','calendar']);
const entries=(params:URLSearchParams)=>JSON.stringify([...params.entries()].sort(([ak,av],[bk,bv])=>ak.localeCompare(bk)||av.localeCompare(bv)));
function keepsStudioDesign(current:NavigationLocation,next:NavigationLocation){
 if(current.pathname!=='/creator-studio'||next.pathname!==current.pathname)return false;
 const before=new URLSearchParams(current.search),after=new URLSearchParams(next.search);
 if(!before.get('project'))return false;
 const stages=[before.get('creation'),after.get('creation')];
 const modes=[before.get('compose'),after.get('compose')];
 if(modes.every(mode=>mode==='idea')&&stages.includes('design')&&stages.includes(null)){
  const editor=before.get('creation')==='design'?before:after;
  const idea=editor===before?after:before;
  if(idea.has('design'))return false;
  editor.delete('design');
  before.delete('creation');after.delete('creation');
 }else if(modes.includes('idea')&&modes.includes(null)&&stages.every(stage=>stage===null)){
  const topics=before.has('compose')?after:before;
  if(topics.has('topic')||topics.has('pillar')||topics.has('from'))return false;
  for(const key of ['compose','topic','pillar']){before.delete(key);after.delete(key);}
 }else return false;
 return entries(before)===entries(after);
}
/** These views keep the same profile session mounted; no pending work is discarded. */
export function keepsProfileSession(current:NavigationLocation,next:NavigationLocation){
 if(current.pathname!=='/creator-studio'||next.pathname!==current.pathname)return false;
 const before=new URLSearchParams(current.search),after=new URLSearchParams(next.search);
 if(before.get('tab')!=='profile'||after.get('tab')!=='profile'||!before.get('project')||before.get('project')!==after.get('project'))return false;
 if(before.has('piece')||after.has('piece'))return false;
 if(before.getAll('view').length>1||after.getAll('view').length!==1)return false;
 if(before.has('view')&&!profileViews.has(before.get('view')!))return false;
 if(!profileViews.has(after.get('view')!))return false;
 before.delete('view');after.delete('view');
 return entries(before)===entries(after);
}
/** One shared registry: a design and its script may both have pending work. */
export function pendingNavigation(){
 const owners=new Set<symbol>();let permitted=false;
 return {
  register(owner:symbol){owners.add(owner);return ()=>{owners.delete(owner);};},
  pending(){return owners.size>0;},
  confirm(ask:()=>boolean,defer:(clear:()=>void)=>void){
   if(!owners.size)return true;
   if(!ask())return false;
   permitted=true;defer(()=>{permitted=false;});return true;
  },
  blocks(current:NavigationLocation,next:NavigationLocation){
   if(current.pathname===next.pathname&&current.search===next.search)return false;
   if(!owners.size)return false;
   if(permitted){permitted=false;return false;}
   if(keepsProfileSession(current,next)||keepsStudioDesign(current,next))return false;
   return true;
  },
 };
}
export const navigationState=pendingNavigation();
