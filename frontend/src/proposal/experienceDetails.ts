export type ExperienceDetails = { version: 1; durationMinutes: number; meetingPoint: string; itinerary: Array<{ id: string; title: string; description: string }> };
/** Public presentation only: no guide, departure, customer or booking fields cross this boundary. */
export function experienceDetails(value: unknown): ExperienceDetails | undefined {
 if (value === undefined) return undefined;
 if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Revisa los detalles de la experiencia.');
 const data=value as Record<string,unknown>;
 if(data.version!==1 || !Number.isSafeInteger(data.durationMinutes) || (data.durationMinutes as number)<1 || (data.durationMinutes as number)>1000000 || typeof data.meetingPoint!=='string' || data.meetingPoint.length>2000 || !Array.isArray(data.itinerary) || data.itinerary.length>100) throw new Error('Revisa la duración, el encuentro y el itinerario de la experiencia.');
 const itinerary=data.itinerary.map(row=>{
  if(!row || typeof row!=='object' || typeof row.id!=='string' || !row.id || row.id.length>200 || typeof row.title!=='string' || row.title.length>500 || typeof row.description!=='string' || row.description.length>4000)throw new Error('Revisa cada parada del itinerario.');
  return {id:row.id,title:row.title,description:row.description};
 });
 if(new Set(itinerary.map(row=>row.id)).size!==itinerary.length)throw new Error('Cada parada debe tener una referencia diferente.');
 return {version:1,durationMinutes:data.durationMinutes as number,meetingPoint:data.meetingPoint,itinerary};
}
