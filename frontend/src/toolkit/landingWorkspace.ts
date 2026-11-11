import type {LandingBlock} from './types';
export type LandingWorkspace={sectionId:string;viewport:'desktop'|'mobile'};
export const workspaceKey=(user:string,project:string)=>`foru:landing-workspace:${user}:${project}`;
export function parseLandingWorkspace(raw:string|null,blocks:LandingBlock[]):LandingWorkspace{
 try{const value=JSON.parse(raw||'{}');return {sectionId:value.sectionId==='hero'||blocks.some(b=>b.id===value.sectionId)?value.sectionId:'hero',viewport:value.viewport==='mobile'?'mobile':'desktop'};}catch{return {sectionId:'hero',viewport:'desktop'};}
}
