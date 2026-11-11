import type {ContentDraft} from '../components/shared/contentModel';
import InlineText from '../components/shared/InlineText';
import {artworkLayout,type TextBox} from './artworkLayout';
import './artwork.css';
export default function DesignArtwork({draft,imageUrl,logoUrl,onChange,onImage}:{draft:ContentDraft;imageUrl:string;logoUrl?:string;onChange?:(patch:Partial<ContentDraft>)=>void;onImage?:()=>void}){
 const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');
 const geometry=artworkLayout(draft,Boolean(imageUrl),(text,size,weight)=>{if(!ctx)return text.length*size*.55;ctx.font=`${weight} ${size}px Inter, sans-serif`;return ctx.measureText(text).width;});
 function text(box:TextBox,key:'title'|'subtitle'|'brandName'|'cta',label:string){const style={left:`${box.x/geometry.width*100}%`,top:`${box.y/geometry.height*100}%`,width:`${box.w/geometry.width*100}%`,minHeight:`${box.h/geometry.height*100}%`,fontSize:`${box.size/geometry.width*100}cqw`,fontWeight:box.weight};return <div className={`studio-art-text studio-art-${key}`} style={style}>{onChange?<InlineText value={box.text} label={label} onChange={value=>onChange({[key]:value})}/>:box.lines.join('\n')}</div>;}
 return <div className={`studio-artwork studio-artwork-${draft.layout}`} style={{aspectRatio:`${geometry.width}/${geometry.height}`,background:draft.background,color:draft.foreground}}>
 <svg className="studio-art-decoration" viewBox={`0 0 ${geometry.width} ${geometry.height}`} aria-hidden="true">{geometry.decorations.map((shape,index)=>shape.shape==='circle'?<ellipse key={index} cx={shape.x+shape.w/2} cy={shape.y+shape.h/2} rx={shape.w/2} ry={shape.h/2} fill={shape.tone==='ink'?draft.foreground:'#fff'} opacity={shape.opacity}/>:<rect key={index} x={shape.x} y={shape.y} width={shape.w} height={shape.h} rx={shape.radius||0} fill={shape.tone==='ink'?draft.foreground:'#fff'} opacity={shape.opacity}/>)}</svg>
 {geometry.image&&<div className="studio-art-photo" style={{left:`${geometry.image.x/geometry.width*100}%`,top:`${geometry.image.y/geometry.height*100}%`,width:`${geometry.image.w/geometry.width*100}%`,height:`${geometry.image.h/geometry.height*100}%`}}>{onImage?<button aria-label="Reemplazar foto del diseño" onClick={onImage}><img src={imageUrl} alt="Foto de tu diseño"/></button>:<img src={imageUrl} alt=""/>}</div>}
 {text(geometry.brand,'brandName','Editar nombre de marca')}{text(geometry.title,'title','Editar título del diseño')}{text(geometry.body,'subtitle','Editar texto del diseño')}{text(geometry.cta,'cta','Editar llamada a la acción')}
 {logoUrl&&<img className="studio-art-logo" src={logoUrl} alt="Logo"/>}
 </div>;
}
