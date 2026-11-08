export type LandingOrigin={kind:'landing';projectId:string;sectionId:string;offerId?:string;pageRevision?:string;viewport?:'desktop'|'mobile'};
export function validLandingOrigin(value:unknown,project:string):value is LandingOrigin {
 if(!value||typeof value!=='object')return false;
 const o=value as LandingOrigin;
 return o.kind==='landing'&&o.projectId===project&&typeof o.sectionId==='string'&&o.sectionId.length>0&&o.sectionId.length<=200&&(o.viewport===undefined||o.viewport==='desktop'||o.viewport==='mobile')&&!/[\x00-\x1f]/.test(o.sectionId)&&(o.offerId===undefined||typeof o.offerId==='string'&&o.offerId.length>0&&o.offerId.length<=200&&!/[\x00-\x1f]/.test(o.offerId))&&(o.pageRevision===undefined||typeof o.pageRevision==='string'&&o.pageRevision.length>0&&o.pageRevision.length<=100&&!/[\x00-\x1f]/.test(o.pageRevision));
}
export function landingOrigin(params:URLSearchParams,project:string,revision?:string|null):LandingOrigin|undefined {
 const o={kind:'landing',projectId:project,sectionId:params.get('section')||'hero',...(params.get('offer')?{offerId:params.get('offer')!}:{}),...(revision||params.get('pageRevision')?{pageRevision:revision||params.get('pageRevision')!}:{}),...(params.get('viewport')==='mobile'||params.get('viewport')==='desktop'?{viewport:params.get('viewport') as 'mobile'|'desktop'}:{})};
 return params.get('from')==='landing'&&validLandingOrigin(o,project)?o:undefined;
}
export function landingReturn(origin:unknown,project:string):string|undefined {
 return validLandingOrigin(origin,project)?`/dashboard/tools/landing?project=${encodeURIComponent(project)}&section=${encodeURIComponent(origin.sectionId)}&resume=1${origin.viewport?'&viewport='+origin.viewport:''}${origin.offerId?'&offer='+encodeURIComponent(origin.offerId):''}`:undefined;
}
export function firstContentReturn(params:URLSearchParams,project:string):string|undefined {
 if(params.get('return')!=='first-content')return undefined;
 const query=new URLSearchParams({project,tab:'create',start:'first-content'});
 const task=params.get('task');if(task&&task.length<=200&&!/[\x00-\x1f]/.test(task))query.set('task',task);
 return '/creator-studio?'+query.toString();
}

const profileViews=['profile','grid','list','calendar'] as const;
const returnLabels:Record<string,string>={profile:'← Mi perfil',grid:'← Mi cuadrícula',list:'← Mi contenido',calendar:'← Mi calendario',library:'← Mi biblioteca'};
export const designContextKeys=['start','task','topic','pillar','campaign','pin','offers'];
export function copyDesignContext(from:URLSearchParams,to:URLSearchParams){
 for(const key of designContextKeys){
  const value=from.get(key);
  if(value&&value.length<=500&&!/[\x00-\x1f]/.test(value))to.set(key,value);
 }
}
export function studioDesignPath(params:URLSearchParams,project:string,design:string|null):string {
 const query=new URLSearchParams({project,tab:'create',compose:'idea',creation:'design'});
 copyDesignContext(params,query);
 if(design&&/^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/i.test(design))query.set('design',design);
 return '/creator-studio?'+query;
}
export function studioDesignReturn(params:URLSearchParams,project:string):string|undefined {
 if(params.get('return')==='studio-design')return studioDesignPath(params,project,params.get('piece'));
}
/** Current entry context takes precedence over historical content lineage. */
export function studioReturn(params:URLSearchParams,origin:unknown,project:string,fallback:'profile'|'library'='library'):{path:string;label:string}{
 const design=studioDesignReturn(params,project);if(design)return {path:design,label:'Volver a mi diseño'};
 const value=params.get('return');
 if(value&&[...profileViews,'library'].includes(value as typeof profileViews[number])){
  const query=new URLSearchParams({project,tab:value==='library'?'library':'profile'});
  if(value!=='library')query.set('view',value);else if(['designs','files','materials'].includes(params.get('library')||''))query.set('library',params.get('library')!);
  const campaign=params.get('campaign');if(value==='library'&&campaign&&/^[0-9a-f-]{36}$/i.test(campaign))query.set('campaign',campaign);
  const offers=params.get('offers');if(offers&&offers.length<=500&&!/[\x00-\x1f]/.test(offers))query.set('offers',offers);
  return {path:'/creator-studio?'+query,label:returnLabels[value]};
 }
 const page=landingReturn(origin,project);if(page)return {path:page,label:'← Volver a mi página'};
 const first=firstContentReturn(params,project);if(first)return {path:first,label:'← Elegir contenido'};
 const fallbackQuery=new URLSearchParams({project,tab:fallback});
 const offers=params.get('offers');if(offers&&offers.length<=500&&!/[\x00-\x1f]/.test(offers))fallbackQuery.set('offers',offers);
 return {path:'/creator-studio?'+fallbackQuery,label:returnLabels[fallback]};
}
/** Forward only a known internal return context, never an arbitrary URL or project. */
export function linkedPieceQuery(project:string,piece:string,params:URLSearchParams):string{
 const query=new URLSearchParams({project,piece}),value=params.get('return');
 const offers=params.get('offers');if(offers&&offers.length<=500&&!/[\x00-\x1f]/.test(offers))query.set('offers',offers);
 if(value==='studio-design'){query.set('return',value);copyDesignContext(params,query);return '?'+query;}
 if(value&&Object.prototype.hasOwnProperty.call(returnLabels,value))query.set('return',value);
 if(value==='library'&&['designs','files','materials'].includes(params.get('library')||''))query.set('library',params.get('library')!);
 const campaign=params.get('campaign');if(campaign&&/^[0-9a-f-]{36}$/i.test(campaign))query.set('campaign',campaign);
 return '?'+query;
}
