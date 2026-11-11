import {emptySocial,newPiece,parseSocial,type SocialDocument} from '../social/model';
import type {ContentDraft} from '../components/shared/contentModel';
/** Same UUID links design and script. Existing editorial work is never replaced. */
export function connectDesignPiece(payload:unknown,projectId:string,userId:string,draft:ContentDraft):SocialDocument {
 if(draft.projectId!==projectId)throw new Error('El diseño no pertenece a este proyecto.');
 const document=payload==null?emptySocial(projectId):parseSocial(payload,projectId,userId);
 if(document.pieces.some(piece=>piece.id===draft.id))return document;
 return parseSocial({...document,pieces:[...document.pieces,{...newPiece(),id:draft.id,title:draft.title,text:draft.caption||draft.subtitle,objective:draft.creative?.intent||'',...(draft.creative?.campaignId?{campaignId:draft.creative.campaignId}:{}),...(draft.creative?.reference?{source:draft.creative.reference}:{}),status:'draft',files:draft.imagePath?[{path:draft.imagePath,name:'Imagen del diseño'}]:[]}]},projectId,userId);
}
