import {sectionKind} from './sectionComposition';
import {nativeOffers,parseProposal,proposalOffers} from '../proposal/model';
import type {ModuleType} from '../modules/moduleProjects';
import type {LandingDraft} from './types';
/** A module-bound draft previews its confirmed catalog. Public snapshots are untouched. */
export function editorCatalog(draft:LandingDraft,type:ModuleType|undefined,payload:unknown,proposalPayload?:unknown):LandingDraft{
 if(draft.catalogSource==='proposal'&&proposalPayload!==undefined)return {...draft,offers:proposalOffers(parseProposal(proposalPayload),type,payload),menuItems:undefined};
 if(draft.catalogSource!=='module'||!type||payload===undefined)return draft;
 const offers=nativeOffers(type,payload);
 const settings=(payload as {settings?:Record<string,unknown>})?.settings||{};
 const text=(key:string)=>typeof settings[key]==='string'?settings[key] as string:'';
 const blocks=[3,4].includes(draft.presentationVersion||1)?draft.blocks.map(block=>{
  if(block.body.trim()||!block.useModuleDetails)return block;
  const kind=sectionKind(block);
  const body=kind==='story'?text('about'):kind==='location'?[text('address'),text('hours')].filter(Boolean).join('\n'):'';
  return body?{...block,body}:block;
 }):draft.blocks;
 return {...draft,blocks,offers,menuItems:undefined};
}
