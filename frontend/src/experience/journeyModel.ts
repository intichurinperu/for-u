export const journeyQuestions=[
 ['offer','¿Qué quieres ofrecer primero?','Café, alfajores, asesorías…'],
 ['audience','¿Para quién lo estás creando?','Personas a las que quieres atender'],
 ['need','¿Qué necesidad quieres resolver?','Algo que tu oferta hace más fácil'],
 ['team','¿Cómo trabajas?','Sola, solo o con un equipo'],
 ['goal','¿Qué quieres lograr primero?','Tu siguiente pequeño logro'],
 ['story','¿Cuál es tu historia?','Qué te inspira a crear este proyecto'],
 ['relationship','¿Cómo quieres atender a tus clientes?','Qué experiencia quieres que vivan'],
 ['conditions','¿Qué condiciones necesitan conocer?','Horarios, entregas o coordinación'],
 ['contact','¿Cómo pueden contactarte?','El contacto que tú elijas'],
] as const;
export type Material={path:string;name:string;question?:string;offerOption?:string};
export type Journey={transcript?:string;route?:'brief';files?:Material[];version:1;answers:Record<string,string>;step:number};
export const emptyJourney=():Journey=>({version:1,route:'brief',answers:{},step:0});
export function parseJourney(v:unknown):Journey{const d=v as Journey;if(!d||d.version!==1||(d.transcript!==undefined&&(typeof d.transcript!=='string'||d.transcript.length>6000))||(d.route!==undefined&&d.route!=='brief')||!validMaterials(d.files)||!d.answers||typeof d.answers!=='object'||Array.isArray(d.answers)||!Number.isInteger(d.step)||d.step<0||d.step>journeyQuestions.length||!Object.entries(d.answers).every(([k,s])=>journeyQuestions.some(q=>q[0]===k)&&typeof s==='string'&&s.length<=3000))throw new Error('Formato de respuestas desconocido. No se sustituyó tu información.');return d;}
export type Idea={files?:{path:string;name:string}[];id:string;text:string;category:'marketing'|'finance'|'logistics'|'operations'|'unclear';createdAt:string;taskId?:string};
export type Inbox={version:1;ideas:Idea[]};
export const emptyInbox=():Inbox=>({version:1,ideas:[]});
export function parseInbox(v:unknown):Inbox{const d=v as Inbox;if(!d||d.version!==1||!Array.isArray(d.ideas)||new Set(d.ideas.map(i=>i.id)).size!==d.ideas.length||!d.ideas.every(i=>i&&validMaterials(i.files)&&typeof i.id==='string'&&typeof i.text==='string'&&i.text.trim()&&i.text.length<=3000&&['marketing','finance','logistics','operations','unclear'].includes(i.category)&&typeof i.createdAt==='string'))throw new Error('No se pudo leer la bandeja. Tus ideas se conservan.');return d;}

export function validMaterials(files:unknown):boolean{return files===undefined||Array.isArray(files)&&files.length<=20&&files.every(f=>f&&typeof f.path==='string'&&/^[\w-]+\/[\w-]+\/[\w.-]+$/.test(f.path)&&f.path.split('/').every((p:string)=>p!=='.'&&p!=='..')&&typeof f.name==='string'&&f.name.length<=200&&(f.question===undefined||(typeof f.question==='string'&&/^[a-z][a-z0-9]{0,59}$/i.test(f.question)))&&(f.offerOption===undefined||(f.question===undefined&&typeof f.offerOption==='string'&&f.offerOption.length>0&&f.offerOption.length<=120)));}
