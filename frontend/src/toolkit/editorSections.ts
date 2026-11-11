import {sectionKind,routeSectionKind,type SectionKind} from './sectionComposition';
import type { LandingBlock,LandingDraft } from './types';
export type SectionPreset = { key: string; title: string; description: string; body: string; kind?: SectionKind };
const common: SectionPreset[] = [
 { key: 'story', title: 'Nuestra historia', description: 'Presenta a las personas detrás del negocio.', body: 'Cuenta cómo empezó tu negocio y qué te inspira.' },
 { key: 'faq', title: 'Preguntas frecuentes', description: 'Aclara las dudas antes de recibir una solicitud.', body: 'Escribe una pregunta frecuente y su respuesta.' },
 { key: 'location', title: 'Ubicación y contacto', description: 'Reúne dirección, horarios y cómo encontrarte.', body: '' },
 { key: 'testimonials', title: 'Testimonios', description: 'Comparte palabras reales de tus clientes.', body: '' },
];
const byIndustry: Record<string, { name: string; sections: SectionPreset[] }> = {
 restaurant: { name: 'Restaurante', sections: [{ key: 'menu', title: 'Nuestro menú', description: 'Destaca platos, ingredientes y opciones.', body: 'Presenta tus especialidades e indica los ingredientes que tus clientes deben conocer.' }, { key: 'delivery', title: 'Pedidos y entregas', description: 'Explica cómo pedir y dónde entregas.', body: 'Indica horarios, zonas de entrega y opciones de recojo.' }] },
 ecommerce: { name: 'Tienda', sections: [{ key: 'catalog', title: 'Nuestros productos', description: 'Presenta tu catálogo y sus beneficios.', body: 'Describe tus productos, variantes y qué incluye cada compra.' }, { key: 'purchase', title: 'Cómo comprar', description: 'Muestra el camino desde elegir hasta recibir.', body: '', kind: 'details' }, { key: 'shipping', title: 'Envíos y cambios', description: 'Aclara los plazos y condiciones de compra.', body: 'Indica costos y tiempos de envío y cómo solicitar un cambio.' }] },
 hospitality: { name: 'Hospedaje', sections: [{ key: 'rooms', title: 'Habitaciones y servicios', description: 'Explica capacidad, comodidades y opciones.', body: 'Describe las habitaciones, su capacidad y los servicios incluidos.' }, { key: 'amenities', title: 'Servicios y comodidades', description: 'Presenta lo que incluye la estadía, sin duplicar habitaciones.', body: '', kind: 'details' }, { key: 'stay', title: 'Condiciones de estadía', description: 'Aclara entrada, salida y condiciones confirmadas.', body: '', kind: 'details' }, { key: 'arrival', kind: 'location', title: 'Tu llegada', description: 'Ayuda a preparar la estadía.', body: 'Indica ubicación, horarios de entrada y salida y cómo consultar disponibilidad.' }] },
 tourism: { name: 'Turismo', sections: [{ key: 'experiences', title: 'Nuestras experiencias', description: 'Reúne tus experiencias con duración, precio y condiciones.', body: '', kind: 'catalog' }, { key: 'reservations', title: 'Condiciones y reservas', description: 'Explica cómo solicitar y confirmar una experiencia.', body: '', kind: 'details' }, { key: 'itinerary', title: 'Tu experiencia paso a paso', description: 'Presenta el recorrido y su duración.', body: 'Describe las paradas, duración y punto de encuentro de la experiencia.' }, { key: 'included', title: 'Qué incluye y qué llevar', description: 'Prepara a tus visitantes.', body: 'Detalla lo incluido, recomendaciones y requisitos para participar.' }] },
 courses: { name: 'Cursos', sections: [{ key: 'courses', title: 'Nuestros cursos', description: 'Reúne los cursos y talleres de tu catálogo.', body: '', kind: 'catalog' }, { key: 'teacher', title: 'Quién enseña', description: 'Presenta la experiencia de quien acompaña el aprendizaje.', body: '', kind: 'story' }, { key: 'materials', title: 'Materiales del curso', description: 'Cuenta qué recursos recibirán y cómo accederán.', body: '', kind: 'details' }, { key: 'syllabus', title: 'Lo que vas a aprender', description: 'Organiza los temas y resultados esperados.', body: 'Presenta el temario, duración y conocimientos que practicarán tus estudiantes.' }, { key: 'enrollment', title: 'Inscripciones y modalidad', description: 'Explica cómo participar.', body: 'Indica fechas, modalidad, requisitos y cómo consultar por una vacante.' }] },
};
export function editorIndustry(industry: string) {
 const key = industry === 'gastronomy' ? 'restaurant' : industry === 'shop' ? 'ecommerce' : industry === 'education' ? 'courses' : industry;
 return byIndustry[key] ?? { name: 'Servicios', sections: [{ key: 'offer', title: 'Nuestros servicios', description: 'Explica qué ofreces y cómo solicitarlo.', body: 'Describe tus servicios y el siguiente paso para conocer más.' }, { key: 'process', title: 'Cómo trabajamos', description: 'Explica el proceso de tu servicio, paso a paso.', body: '', kind: 'details' }] };
}
export function sectionPresets(industry: string): SectionPreset[] { return [...editorIndustry(industry).sections, ...common]; }
export function createEditorSection(industry: string, key: string): LandingBlock | null {
 const preset = sectionPresets(industry).find(item => item.key === key);
 return preset ? { id: crypto.randomUUID(), title: preset.title, body: '',kind:preset.kind||routeSectionKind({id:'',title:preset.title,body:''},industry)||'details' } : null;
}
export function reorderEditorSections(blocks: LandingBlock[], fromId: string, toId: string): LandingBlock[] {
 const from = blocks.findIndex(block => block.id === fromId), to = blocks.findIndex(block => block.id === toId);
 if (from < 0 || to < 0 || from === to) return blocks;
 const next = [...blocks]; const [item] = next.splice(from, 1); next.splice(to, 0, item); return next;
}
/** beforeId is an existing destination, never a browser-supplied object path. */
export function insertEditorSection(blocks: LandingBlock[], block: LandingBlock, beforeId: string | null): LandingBlock[] {
 if (blocks.length >= 8 || blocks.some(item=>item.id===block.id)) return blocks;
 const index=beforeId===null?blocks.length:blocks.findIndex(item=>item.id===beforeId);
 if(index<0)return blocks;
 const next=[...blocks];next.splice(index,0,block);return next;
}

/** Adding a designed section is an explicit draft edit, recoverable with Undo.
 * The public snapshot keeps its own presentation until the owner publishes. */
export function addDesignedSection(draft:LandingDraft,block:LandingBlock,beforeId:string|null,route=draft.template):LandingDraft{
 const blocks=insertEditorSection(draft.blocks,block,beforeId);
 if(blocks===draft.blocks)return draft;
 const catalogSource:LandingDraft['catalogSource']=draft.catalogSource||(sectionKind(block)==='catalog'&&!draft.offers?.length&&!draft.menuItems?.length?(route==='services'?'proposal':'module'):undefined);
 return {...draft,blocks,presentationVersion:4,...(catalogSource?{catalogSource}:{})};
}
