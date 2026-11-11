import {getPiece,changePiece,parseSocial,type SocialDocument} from './model';
import {saveContentDraft,validateCreativeContext,type ContentDocument,type ContentDraft} from '../components/shared/contentModel';
/** Develop an existing idea. Never manufacture a second piece or replace an existing design. */
export function prepareGridDesign(profile:SocialDocument,designs:ContentDocument,pieceId:string,draft:ContentDraft,project:string,user:string){
 const {piece}=getPiece(profile,project,pieceId,user);validateCreativeContext(draft,project);
 if(draft.projectId!==project||designs.drafts.some(row=>row.projectId!==project))throw new Error('El diseño pertenece a otro proyecto.');
 if(designs.drafts.some(row=>row.id===pieceId))throw new Error('Esta idea ya tiene un diseño. Abre su versión guardada antes de continuar.');
 if(piece.campaignId!==draft.creative?.campaignId)throw new Error('Conserva la campaña de esta pieza antes de darle forma.');
 if(piece.source&&(['projectId','id','kind','revision'] as const).some(key=>piece.source![key]!==draft.creative?.reference?.[key]))throw new Error('Conserva la fuente original de esta pieza.');
 const design={...draft,id:pieceId,projectId:project};
 const nextDesigns=saveContentDraft(designs,design,project);
 const nextProfile=parseSocial(changePiece(profile,pieceId,{status:piece.status==='idea'?'draft':piece.status,objective:draft.creative?.intent||piece.objective}),project,user);
 return {design,designs:nextDesigns,profile:nextProfile};
}
