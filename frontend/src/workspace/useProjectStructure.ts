import {usePrivateDocument} from '../experience/usePrivateDocument';
import {emptyJourney,parseJourney} from '../experience/journeyModel';
import {emptyProposal,parseProposal} from '../proposal/model';
import {emptySocial,parseSocial} from '../social/model';
import {emptyDiagnostic,parseDiagnostic,emptyProjectRoute,parseProjectRoute,emptyCampaigns,parseCampaigns,emptySpecificOffers,parseSpecificOffers,emptyMaterials,parseMaterials,validateStructureReferences,type BusinessRoute} from './contracts';
import {saveDocumentGroup} from '../services/privateDocumentController';
/** Shared documents are loaded without writes or eager format conversion.
 * Legacy answers remain separately readable until an explicit diagnostic edit. */
export function useProjectStructure(user:string,project:string,route:BusinessRoute){
 const diagnostic=usePrivateDocument(user,project,'project-diagnostic',()=>emptyDiagnostic(project,route),v=>parseDiagnostic(v,project));
 const legacyJourney=usePrivateDocument(user,project,'project-journey',emptyJourney,parseJourney);
 const projectRoute=usePrivateDocument(user,project,'project-route',()=>emptyProjectRoute(project),v=>parseProjectRoute(v,project));
 const campaigns=usePrivateDocument(user,project,'campaigns',()=>emptyCampaigns(project),v=>parseCampaigns(v,project));
 const offers=usePrivateDocument(user,project,'specific-offers',()=>emptySpecificOffers(project),v=>parseSpecificOffers(v,project));
 const materials=usePrivateDocument(user,project,'materials',()=>emptyMaterials(project),v=>parseMaterials(v,project,user));
 const proposal=usePrivateDocument(user,project,'proposal',emptyProposal,parseProposal);
 const profile=usePrivateDocument(user,project,'social-profile',()=>emptySocial(project),v=>parseSocial(v,project,user));
 const documents={diagnostic,route:projectRoute,campaigns,offers,materials,proposal,profile};
 async function save(taskIds:string[]){
  if(Object.values(documents).some(doc=>!doc.loaded||doc.conflict))throw new Error('Carga o recupera los documentos antes de guardar el conjunto. Tus cambios se conservan.');
  validateStructureReferences({diagnostic:diagnostic.data,route:projectRoute.data,campaigns:campaigns.data,offers:offers.data,materials:materials.data,proposal:proposal.data,profile:profile.data},taskIds);
  return saveDocumentGroup(Object.entries(documents).filter(([,doc])=>doc.dirty).map(([kind,doc])=>({kind,save:doc.save})));
 }
 return {...documents,legacyJourney,save};
}
