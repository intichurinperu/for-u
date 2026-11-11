import type {LandingDraft} from '../toolkit/types';
import {blankContent,type ContentDraft} from '../components/shared/contentModel';
import {privateMediaPath,externalImageUrl} from '../components/shared/mediaReference';
export type PageSection={id:string;title:string;body:string;image:string};
export function pageSections(page:LandingDraft):PageSection[]{return [{id:'hero',title:page.headline,body:page.description,image:page.heroImage||''},...page.blocks.map(b=>({id:b.id,title:b.title,body:b.body,image:page.heroImage||''})),...(page.offers||[]).map(o=>({id:`offer:${o.id}`,title:o.name,body:[o.description,o.pricing==='quote'?'Solicitar cotización':o.pricing==='free'?'Gratis':o.price!==null?`S/ ${o.price.toFixed(2)}`:'',o.conditions].filter(Boolean).join('\n'),image:o.image||page.heroImage||''}))].filter(s=>s.title.trim()||s.body.trim());}
export function composePageSection(page:LandingDraft,section:PageSection,project:string,user:string,revision:string,format:ContentDraft['format']):ContentDraft{
 if(!revision||!pageSections(page).some(s=>s.id===section.id&&s.title===section.title&&s.body===section.body))throw new Error('La sección cambió. Vuelve a preparar la pieza.');
 const path=privateMediaPath(section.image,user,project);let publicImage='';
 if(!path&&section.image){const url=externalImageUrl(section.image);if(url&&!url.includes('/object/sign/')&&!/[?&](?:token|signature|x-amz-signature|x-amz-credential|expires)=/i.test(url))publicImage=url;}
 return {...blankContent(project),format,title:section.title,subtitle:section.body,caption:[section.title,section.body,page.cta].filter(Boolean).join('\n\n'),imagePath:path||'',sourceImageUrl:publicImage,brandName:page.name,cta:page.cta,background:'#F4F0EA',foreground:'#24232A',source:{kind:'landing',revision,sectionId:section.id}};
}
