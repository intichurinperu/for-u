import { Link } from 'react-router-dom';
import { Card as DSCard } from './ui/DesignSystem';
import { StepIndicator } from './ui/DesignSystem';
import { ButtonSecondary as DSButtonSecondary, Input as DSInput, Textarea as DSTextarea, ButtonPrimary as DSButtonPrimary } from './ui/DesignSystem';
import { useEffect, useRef, useState } from 'react';
import { LandingPreview } from '../toolkit/LandingPreview';
import type { LandingDraft } from '../toolkit/types';
import './landingWizard.css';
import { useUnsavedNavigation } from '../lib/useUnsavedNavigation';

type Props = {
  draft: LandingDraft;
  update: (patch: Partial<LandingDraft>) => void;
  busy: boolean;
  dirty: boolean;
  demo: boolean;
  notice: string;
  publishedUrl: string;
  onSave: () => Promise<void>;
  onPublish: () => Promise<void>;
  onUpload: (file: File, role?: string) => Promise<void>;
  onSuggest: () => Promise<void>;
};
const steps = ['Elige tu plantilla', 'Sube tu foto', 'Escribe tu historia', 'Configura tu menú', 'Publica y comparte'];
const templates = [
  { id: 'restaurant', name: 'Restaurante', icon: '🍽️', color: '#b45309' },
  { id: 'shop', name: 'Tienda', icon: '🛍️', color: '#be185d' },
  { id: 'services', name: 'Servicios', icon: '✨', color: '#6d28d9' },
  { id: 'event', name: 'Evento', icon: '🎉', color: '#0e7490' },
];
export default function LandingWizard(props: Props) {
  const { draft, update, busy, dirty, demo, notice, publishedUrl, onSave, onPublish, onUpload, onSuggest } = props;
  const [step, setStep] = useState(0);
  const [fileError, setFileError] = useState('');
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus(); }, [step]);
  useUnsavedNavigation(dirty || busy);
  const upload = (file?: File, role = "Portada") => {
    if (!file || busy || demo) return;
    setFileError('');
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) { setFileError('Elige una foto JPG, PNG o WebP.'); return; }
    if (file.size > 10 * 1024 * 1024) { setFileError('La foto debe pesar menos de 10 MB.'); return; }
    void onUpload(file, role);
  };
  return <section className="landing-wizard" aria-label="Crear landing paso a paso" aria-busy={busy}>
    <header className="lw-header">
      <StepIndicator currentStep={step + 1} totalSteps={5} labels={steps} />
      <div className="lw-progress" role="progressbar" aria-label="Pasos del wizard" aria-valuemin={0} aria-valuemax={5} aria-valuenow={step + 1}><div style={{ width: `${(step + 1) * 20}%` }} /></div>
    </header>
    <div className="lw-content">
      <small>PASO {step + 1} DE 5</small><h2 ref={heading} tabIndex={-1}>{steps[step]}</h2>
      <fieldset disabled={busy}>
      {step === 0 && <><p>Elige el estilo de tu página. Conservaremos tus textos y secciones existentes.</p><div className="lw-templates">{templates.map(template => <DSButtonSecondary key={template.id} className="lw-template" aria-pressed={draft.template === template.id} onClick={() => update({ template: template.id, color: template.color })}><span aria-hidden="true">{template.icon}</span><strong>{template.name}</strong><div className={`tk-landing-preview tk-template-${template.id} lw-mini`} style={{ '--site-color': template.color } as React.CSSProperties}><header>{draft.name}</header><section className="tk-site-hero"><strong>{draft.headline}</strong><p>{draft.description.slice(0, 100)}</p></section></div></DSButtonSecondary>)}</div></>}
      {step === 1 && <><p>Una portada es suficiente para empezar. Puedes continuar sin foto.</p><div className="lw-drop" onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); upload(event.dataTransfer.files[0]); }}><span aria-hidden="true">📸</span><label>Arrastra una foto o selecciona un archivo<DSInput type="file" accept="image/jpeg,image/png,image/webp" disabled={busy || demo} onChange={event => { upload(event.target.files?.[0]); event.target.value = ''; }} /></label><small>JPG, PNG o WebP · hasta 10 MB. La portada será pública.</small></div>{draft.heroImage && <><img className="lw-photo" src={draft.heroImage} alt={draft.heroImageAlt || 'Portada seleccionada'} /><label>Descripción de la foto<DSInput value={draft.heroImageAlt || ''} maxLength={160} onChange={event => update({ heroImageAlt: event.target.value })} /></label><DSButtonSecondary onClick={() => update({ heroImage: undefined, heroImageAlt: undefined })}>Quitar portada</DSButtonSecondary></>}<div className="lw-photos">{['Logo', 'Productos', 'Ambiente'].map(role => { const photo = draft.gallery?.find(item => item.role === role); return <DSCard as="div" className="lw-photo-card" key={role} onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); upload(event.dataTransfer.files[0], role); }}><label>{role}<DSInput type="file" accept="image/jpeg,image/png,image/webp" disabled={busy || demo} onChange={event => { upload(event.target.files?.[0], role); event.target.value = ''; }} /></label>{photo && <><img src={photo.url} alt={photo.alt} /><DSButtonSecondary onClick={() => update({ gallery: draft.gallery?.filter(item => item.role !== role) })}>Quitar {role.toLowerCase()}</DSButtonSecondary></>}</DSCard>; })}</div>{fileError && <p role="alert">{fileError}</p>}</>}
      {step === 2 && <><label>Nombre del negocio<DSInput value={draft.name} maxLength={100} onChange={event => update({ name: event.target.value })} /></label><label>Título principal<DSInput value={draft.headline} maxLength={180} onChange={event => update({ headline: event.target.value })} /></label><label>Tu historia<DSTextarea value={draft.description} maxLength={1000} rows={7} placeholder="Cuéntale al mundo qué hace especial a tu negocio…" onChange={event => update({ description: event.target.value })} /></label><DSButtonSecondary disabled={busy || demo} onClick={() => void onSuggest()}>✨ Sugerir con IA</DSButtonSecondary><small>Revisa la sugerencia: tú conoces mejor tu negocio.</small></>}
      {step === 3 && <><h2>Una sola lista de ofertas</h2><p>Define tus productos, servicios y paquetes en Mi propuesta. Sus precios vienen del catálogo guardado; no crearemos una segunda lista aquí.</p><Link to={'/dashboard/tools/proposal?project=' + new URLSearchParams(window.location.search).get('project')}>Abrir Mi propuesta →</Link><LandingPreview draft={draft} />{draft.menuItems?.length && !draft.catalogSource ? <p>Tu catálogo anterior se conserva. Puedes vincularlo explícitamente desde el editor; no se migrará automáticamente.</p> : null}</>}
      {step === 4 && <><ul className="lw-checklist"><li>{draft.name.trim() && draft.headline.trim() ? '✓' : '○'} Nombre y título</li><li>{draft.description.trim() ? '✓' : '○'} Historia</li><li>{draft.menuItems?.length ? '✓' : '○'} Productos: {draft.menuItems?.length || 0} (opcionales)</li><li>{draft.heroImage ? '✓' : '○'} Portada (opcional)</li></ul><p>Revisa tu página antes de compartirla. Publicar actualizará la landing de este proyecto.</p><label>Dirección pública<DSInput value={draft.slug} maxLength={60} onChange={event => update({ slug: event.target.value.toLowerCase() })} /></label><p className="lw-address">{window.location.origin}/s/{draft.slug}</p><label>WhatsApp con código de país (opcional)<DSInput value={draft.whatsapp} maxLength={15} inputMode="tel" placeholder="51999999999" onChange={event => update({ whatsapp: event.target.value })} /></label><label>Texto del botón de contacto<DSInput value={draft.cta} maxLength={50} onChange={event => update({ cta: event.target.value })} /></label><div className="lw-preview"><LandingPreview draft={draft} /></div></>}
      </fieldset>
      {notice && <p className="lw-notice" role="status">{notice}</p>}
      {publishedUrl && !dirty && <div className="lw-success" role="status"><span aria-hidden="true">✨ 🎉 ✨</span><strong>¡Tu página está publicada!</strong><a href={publishedUrl} target="_blank" rel="noreferrer">Abrir página publicada ↗</a></div>}
      {demo && <p>Modo de prueba: inicia sesión para subir fotos y publicar.</p>}
    </div>
    <footer className="lw-footer"><DSButtonSecondary disabled={busy || step === 0} onClick={() => setStep(value => value - 1)}>Anterior</DSButtonSecondary><DSButtonSecondary disabled={busy || !dirty} onClick={() => void onSave()}>Guardar borrador</DSButtonSecondary>{step < 4 ? <DSButtonPrimary className="lw-primary" disabled={busy} onClick={() => setStep(value => value + 1)}>Siguiente →</DSButtonPrimary> : <DSButtonPrimary className="lw-primary" disabled={busy || demo || !draft.headline.trim() || !draft.name.trim()} onClick={() => void onPublish()}>{busy ? 'Publicando…' : 'Publicar ahora'}</DSButtonPrimary>}</footer>
  </section>;
}
