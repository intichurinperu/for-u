import type { ExperienceDetails } from '../proposal/experienceDetails';
export default function ExperienceDetail({value}:{value:ExperienceDetails}){
 const stops=value.itinerary.filter(stop=>stop.title.trim()||stop.description.trim());
 return <div className="page-experience"><p className="page-experience-duration"><span aria-hidden="true">◷</span> {value.durationMinutes} minutos</p>{(stops.length>0||value.meetingPoint.trim())&&<details className="page-experience-details"><summary>Descubre el recorrido</summary>{stops.length>0&&<ol>{stops.map((stop,index)=><li key={stop.id}><span className="page-experience-step" aria-hidden="true">{String(index+1).padStart(2,'0')}</span><div>{stop.title&&<h4>{stop.title}</h4>}{stop.description&&<p>{stop.description}</p>}</div></li>)}</ol>}{value.meetingPoint.trim()&&<div className="page-experience-meeting"><span aria-hidden="true">⌖</span><div><h4>Punto de encuentro</h4><p>{value.meetingPoint}</p></div></div>}</details>}</div>;
}
