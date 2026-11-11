type DraftStorage=Pick<Storage,'getItem'|'setItem'>;
export function ideaDraftKey(user:string,project:string,pillar:string){
 return `foru:studio-idea:v2:${encodeURIComponent(user)}:${encodeURIComponent(project)}:${encodeURIComponent(pillar||'')}`;
}
export function readIdeaDraft(storage:DraftStorage,user:string,project:string,pillar:string,notes=''){
 try{
  const saved=storage.getItem(ideaDraftKey(user,project,pillar));
  if(saved!==null)return saved;
  // Older drafts had no theme. Keep them available only in the free-idea space.
  if(!pillar)return storage.getItem(`foru:studio-idea:${user}:${project}`)||notes;
 }catch{}
 return notes;
}
export function writeIdeaDraft(storage:DraftStorage,user:string,project:string,pillar:string,text:string){
 // An intentionally empty draft must not resurrect the saved theme notes.
 try{storage.setItem(ideaDraftKey(user,project,pillar),text);}catch{}
}
