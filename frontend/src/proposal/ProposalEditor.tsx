import EditorSheet from '../toolkit/EditorSheet';
import OfferComposer from './OfferComposer';
import PearlButton from '../components/ui/PearlButton';
import '../toolkit/professionalEditor.css';
import JourneyImport from '../experience/JourneyImport';
import { useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useToolkit } from '../toolkit/ToolkitContext';
import { defaultLanding, type LandingDraft } from '../toolkit/types';
import { ButtonPrimary, ButtonSecondary, Input, Textarea } from '../components/ui/DesignSystem';
import ProjectImage from '../components/shared/ProjectImage';
import type { ModuleType } from '../modules/moduleProjects';
import { useUnsavedNavigation } from '../lib/useUnsavedNavigation';
import { useWorkspaceFocus } from '../pages/dashboard/WorkspaceFocus';
import { blankOffer, changedPreparationFields, emptyProposal, parseProposal, nativeOffers, proposalOffers, offerPrice, prepareLanding, preparationFields, validateOffer, type Offer, type PreparationField, type Proposal } from './model';
import { updateNativePrice, createNativeProduct } from './catalogEditing';
import { readableStudioDraft } from '../pages/dashboard/studioJourney';
import './proposal.css';
import './proposalOffersVisual.css';

export default function ProposalEditor() {
  const toolkit = useToolkit();
  try {
    if (toolkit.docs.landing !== undefined && !readableStudioDraft(toolkit.docs.landing)) throw new Error('El borrador anterior necesita recuperación. No se reemplazó por una plantilla.');
    const proposal = toolkit.docs['module-proposal'] === undefined ? emptyProposal() : parseProposal(toolkit.docs['module-proposal']);
    nativeOffers(toolkit.business.moduleType as ModuleType, toolkit.docs['module-' + toolkit.business.moduleType]);
    return <ProposalSession initial={proposal} />;
  } catch (error) { return <section role="alert"><h1>No pudimos abrir tu propuesta</h1><p>{(error as Error).message}</p><ButtonSecondary onClick={() => void toolkit.reload()}>Reintentar</ButtonSecondary></section>; }
}
function ProposalSession({ initial }: { initial: Proposal }) {
  const { docs, save, business, projectId, demo, documentRevision, reload } = useToolkit();
  const type = business.moduleType as ModuleType;
  const catalogKey = 'module-' + type;
  const query = '?project=' + encodeURIComponent(projectId);
  const navigate = useNavigate();
  const [routeParams]=useSearchParams();
  const { remember } = useWorkspaceFocus();
  const [proposal, setProposal] = useState(initial);
  const [field, setField] = useState<'offering'|'audience'|'need'|'value'|'message'|'conditions'|'cta'|'whatsapp'|null>(null);
  const cardLabels={offering:'¿Qué ofreces?',audience:'¿Para quién?',need:'¿Qué le facilitas?',value:'¿Qué hace especial tu oferta?',message:'Tu mensaje principal',conditions:'Condiciones',cta:'Tu invitación a actuar',whatsapp:'Contacto de WhatsApp'};
  const cardTitles={offering:'Tu oferta',audience:'Tus personas',need:'La necesidad',value:'Tu diferencia',message:'Mensaje principal',conditions:'Condiciones',cta:'Tu invitación',whatsapp:'Contacto'};
  const proposalRef=useRef(proposal);proposalRef.current=proposal;
  const compactOffers = routeParams.get('section') === 'offers';
  const [step, setStep] = useState(routeParams.has('offer') || compactOffers ? 1 : 0);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const saveLock = useRef(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [offer, setOffer] = useState<Offer | null>(()=>initial.offers.find(o=>o.id===routeParams.get('offer'))??null);
  const [offerPanel,setOfferPanel]=useState(true);
  const [nativePriceId, setNativePriceId] = useState<string | null>(null);
  const editOffer = (item: Offer, fromCatalog = false) => {
    setNativePriceId(fromCatalog ? item.id : null);
    setError('');
    setOffer(item);
    setOfferPanel(true);
  };
  const [prices, setPrices] = useState<Record<string, string>>({});
  const [free, setFree] = useState<Record<string, boolean>>({});
  const [preparing, setPreparing] = useState(false);
  const [confirmRecovery, setConfirmRecovery] = useState(false);
  const [chosen, setChosen] = useState<PreparationField[]>([]);
  const native = nativeOffers(type, docs[catalogKey]);
  const editingNativeOffer = offer?.id === nativePriceId;
  const restaurantInventory = type === 'restaurant' && business.route !== 'services'
    ? '/modules/restaurant' + query + (routeParams.get('return') === 'island' ? '&return=island&area=finance' : '')
    : null;
  const uncommitted = Object.keys(prices).length > 0 || offer !== null;
  useUnsavedNavigation(dirty || uncommitted || busy);
  const patch = (value: Partial<Proposal>) => { setProposal(current => ({ ...current, ...value })); setDirty(true); setError(''); setNotice(''); };
  async function run(action: () => Promise<void>) {
    if (saveLock.current) return;
    saveLock.current = true;
    setBusy(true); setError(''); setNotice('');
    try { await action(); } catch (e) { setError((e as Error).message); } finally { saveLock.current = false; setBusy(false); }
  }
  async function storeProposal() {
    await run(async () => { const snapshot=proposal;await save('module-proposal', parseProposal(snapshot));if(proposalRef.current===snapshot){setDirty(false);setField(null);} setNotice('Propuesta guardada en tu cuenta. Tu página pública no cambió.'); });
  }
  async function storePrice(item: Offer) {
    await run(async () => {
      const raw = prices[item.id];
      if (raw === undefined || !raw.trim()) throw new Error('Escribe un precio; un campo vacío no es gratis.');
      const price = Number(raw);
      if (price === 0 && !free[item.id]) throw new Error('Confirma Gratis para usar un precio de cero.');
      await save(catalogKey, updateNativePrice(type, docs[catalogKey], item.id, price));
      setPrices(current => { const next = { ...current }; delete next[item.id]; return next; });
      setNotice('Precio guardado en el catálogo original. La publicación anterior no cambió.');
    });
  }
  async function applyOffer() {
    if (!offer) return;
    await run(async () => {
      validateOffer(offer, true);
      if (editingNativeOffer) {
        if (offer.price === null) throw new Error('Escribe un precio para esta oferta del catálogo.');
        await save(catalogKey, updateNativePrice(type, docs[catalogKey], offer.id, offer.price));
        setNotice('Precio actualizado en el catálogo.');
        setOffer(null);
        return;
      }
      const exists = proposal.offers.some(item => item.id === offer.id);
      if (!exists && proposal.nativeIds.length + proposal.offers.length >= 30) {
        throw new Error('Puedes guardar hasta 30 ofertas en tu propuesta.');
      }
      const nativeData = exists ? null : createNativeProduct(type, docs[catalogKey], offer, business.name);
      const next = parseProposal(nativeData !== null
        ? { ...proposal, nativeIds: [...new Set([...proposal.nativeIds, type + ':' + offer.id])] }
        : { ...proposal, offers: exists ? proposal.offers.map(item => item.id === offer.id ? offer : item) : [...proposal.offers, offer] });
      if (nativeData !== null) await save(catalogKey, nativeData);
      if (compactOffers) {
        await save('module-proposal', next);
        setProposal(next);
        setDirty(false);
        setNotice('Oferta guardada.');
      } else {
        patch(next);
        if (nativeData !== null) setNotice('Producto guardado en tu catálogo. Guarda la propuesta para conservar su selección.');
      }
      setOffer(null);
    });
  }
  const canPrepare = !dirty && !busy && !uncommitted && !!documentRevision('module-proposal') && !demo;
  function openPreparation() {
    try {
      if (!canPrepare) throw new Error('Guarda la propuesta y aplica los cambios de ofertas antes de preparar la página.');
      if (!proposal.offering.trim() || !proposal.message.trim() || !proposal.cta.trim()) throw new Error('Completa qué ofreces, tu mensaje y la llamada a la acción.');
      proposalOffers(proposal, type, docs[catalogKey]);
      setChosen(docs.landing ? [] : [...preparationFields]); setPreparing(true); setError('');
    } catch (e) { setError((e as Error).message); }
  }
  const base = (docs.landing as LandingDraft | undefined) ?? { ...defaultLanding(business), headline: '', description: '', cta: '', blocks: [], fields: [], bookingEnabled: false };
  const labels: Record<PreparationField,string> = { headline:'Título principal', description:'Descripción', cta:'Botón de contacto', whatsapp:'WhatsApp', conditions:'Condiciones', offers:'Ofertas y sus precios guardados' };
  function previewValue(field: PreparationField, updated: boolean) {
    if (field === 'offers') return updated ? (proposal.nativeIds.length + proposal.offers.length) + ' ofertas vinculadas' : (base.offers?.length ?? base.menuItems?.length ?? 0) + ' ofertas';
    if (field === 'conditions') return updated ? proposal.conditions : base.blocks.find(b => b.id === 'proposal-conditions')?.body ?? '';
    const values = { headline:proposal.message, description:[proposal.offering,proposal.value].filter(Boolean).join('\n'), cta:proposal.cta, whatsapp:proposal.whatsapp };
    return updated ? values[field] : base[field];
  }
  const allOffers = [...native, ...proposal.offers];

  if (compactOffers) {
    return (
      <section className="proposal-offers-container">
        <header className="proposal-offers-top">
          <span className="proposal-kicker">MI PROPUESTA · {business.name}</span>
          <h1>Define tu oferta y tus precios</h1>
          <p>Reúne aquí las ofertas que quieres vender.</p>
        </header>

        <div className="proposal-offers-card">
          <div className="proposal-offers-card-header">
            <h2>Mis ofertas</h2>
            <PearlButton compact onClick={() => editOffer(blankOffer())}>＋ Añadir oferta</PearlButton>
          </div>
          <p className="proposal-offers-hint">Empieza con una oferta. Puedes añadir más cuando quieras.</p>

          {allOffers.length === 0 ? (
            <div className="proposal-offers-empty">
              <p>Aún no hay ofertas guardadas.</p>
            </div>
          ) : (
            <div className="proposal-offers-list">
              {allOffers.map(item => (
                <div className="proposal-offer-row-card" key={item.id}>
                  <div className="proposal-offer-thumb-container">
                    {item.image ? <ProjectImage value={item.image} alt="" /> : <span>🏷️</span>}
                  </div>
                  <div className="proposal-offer-info">
                    <span className="proposal-offer-name-title">{item.name}</span>
                    <span className="proposal-offer-price-tag">{offerPrice(item)}</span>
                  </div>
                  <div className="proposal-offer-row-actions">
                    <button type="button" className="proposal-action-pill-btn" onClick={() => editOffer(item, native.includes(item))}>
                      {native.includes(item) ? 'Editar precio' : 'Ajustar oferta'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="proposal-offers-footer-actions">
            {restaurantInventory && (
              <PearlButton
                compact
                tone="neutral"
                to={restaurantInventory}
              >
                Ver recetas e inventario
              </PearlButton>
            )}
            <PearlButton
              to={`/dashboard?${new URLSearchParams({ project: projectId, view: 'start', step: 'sell' })}`}
            >
              Continuar a cómo vender tu oferta →
            </PearlButton>
          </div>
        </div>

        {!offer && (error || notice) && <p role={error ? 'alert' : 'status'}>{error || notice}</p>}
        {offer && (
          <div className="proposal-modal-backdrop" onClick={e => { if (e.target === e.currentTarget && !busy) setOffer(null); }}>
            <div className="proposal-modal-card" role="dialog" aria-modal="true" aria-labelledby="modal-offer-title">
              <button type="button" className="proposal-modal-close-btn" aria-label="Cerrar" disabled={busy} onClick={() => setOffer(null)}>
                ✕
              </button>
              <div className="proposal-modal-header">
                <h2 id="modal-offer-title">{editingNativeOffer ? 'Editar precio' : offer.name ? 'Editar oferta' : 'Añadir oferta'}</h2>
              </div>

              <div className="proposal-modal-showcase" aria-hidden="true">
                <div className="proposal-showcase-center">
                  <div className="proposal-showcase-plate">
                    {offer.image ? <img src={offer.image} alt="" /> : <span>🧁</span>}
                  </div>
                  <div className="proposal-showcase-tag">
                    <span>🏷️</span>
                  </div>
                </div>
              </div>

              <form className="proposal-modal-form" onSubmit={event => { event.preventDefault(); void applyOffer(); }}>
                <div className="proposal-modal-field">
                  <label htmlFor="offer-name-input">Nombre</label>
                  <input
                    id="offer-name-input"
                    required
                    autoFocus={!editingNativeOffer}
                    readOnly={editingNativeOffer}
                    disabled={busy}
                    maxLength={120}
                    placeholder="Ej. Brownie de chocolate"
                    value={offer.name}
                    onChange={e => setOffer({ ...offer, name: e.target.value })}
                  />
                </div>

                <div className="proposal-modal-field">
                  <label htmlFor="offer-price-input">Precio de venta</label>
                  <div className="proposal-price-input-wrap">
                    <span className="proposal-price-prefix">S/</span>
                    <input
                      id="offer-price-input"
                      autoFocus={editingNativeOffer}
                      disabled={busy}
                      required={editingNativeOffer}
                      type="number"
                      min="0"
                      max="1000000"
                      step="0.01"
                      placeholder="12.00"
                      value={offer.price ?? ''}
                      onChange={event => {
                        const price = event.target.value ? event.target.valueAsNumber : null;
                        setOffer({ ...offer, price, pricing: price === null ? 'quote' : price === 0 ? 'free' : 'fixed' });
                      }}
                    />
                  </div>
                </div>

                {error && <p role="alert" style={{ color: '#a11b35', margin: '4px 0', fontSize: '0.88rem' }}>{error}</p>}

                <PearlButton className="proposal-modal-submit-btn" type="submit" disabled={busy}>
                  {busy ? 'Guardando…' : 'Guardar oferta'}
                </PearlButton>
              </form>
            </div>
          </div>
        )}
      </section>
    );
  }

  return <section className="proposal-page">
    <header><span className="proposal-kicker">MI PROPUESTA · {business.name}</span><h1>Mi propuesta</h1><p>Lo que ya definiste, listo para seguir tomando forma.</p></header>
    <JourneyImport proposal={proposal} onApply={patch}/><details className="proposal-switch" key={step}><summary>{['Tu idea','Tus ofertas','Mensaje y contacto'][step]} <span aria-hidden="true">⌄</span></summary><nav aria-label="Pasos de mi propuesta">{type&&business.route!=='services'&&<Link className="pe-action-link" to={'/modules/'+type+'/editor'+query}>Catálogo original →</Link>}{['Tu idea','Tus ofertas','Mensaje y contacto'].map((title,i)=><button type="button" key={title} aria-current={i===step?'step':undefined} onClick={()=>setStep(i)}>{title}</button>)}<Link className="pe-action-link" to={'/dashboard/tools/landing'+query}>Abrir mi página →</Link></nav></details>
    <fieldset disabled={busy} className="proposal-fields">
      {step === 0 && <><h2 className="sr-only">Tu idea</h2><div className="proposal-definition-cards">{(['offering','audience','need','value'] as const).map((key,i)=><button type="button" className={`proposal-definition-card proposal-card-${i}`} key={key} onClick={()=>setField(key)}><span aria-hidden="true">{['✦','◉','♡','✧'][i]}</span><h3>{cardTitles[key]}</h3><p>{proposal[key]||'Toca para darle forma'}</p><small>{proposal[key]?'Editar →':'Comenzar →'}</small></button>)}</div></>}
      {step === 1 && <><div className="proposal-section-title"><h2>Mis ofertas</h2><PearlButton compact onClick={() => editOffer(blankOffer())}>＋ Añadir oferta</PearlButton></div>
        <p>Empieza con una oferta. Puedes añadir más cuando quieras.</p>

        {!native.length && !proposal.offers.length && <p>Aún no hay ofertas. Añade la primera cuando estés lista.</p>}
        <div className="proposal-offer-grid">{native.map(item => <article className="proposal-offer" key={item.id}>
          {item.image&&<ProjectImage value={item.image} alt={item.name} />}<h3>{item.name}</h3><p>{item.description}</p><strong>{offerPrice(item)}</strong>
          <details className="proposal-offer-controls"><summary>Ajustar esta oferta</summary><label><input type="checkbox" checked={proposal.nativeIds.includes(item.id)} onChange={e => patch({ nativeIds:e.target.checked ? [...proposal.nativeIds,item.id] : proposal.nativeIds.filter(id => id !== item.id) })} /> Incluir {item.name} en mi propuesta</label>
          <details><summary>Editar precio en el catálogo</summary><Input label={'Precio de ' + item.name} type="number" min="0" step="0.01" value={prices[item.id] ?? item.price ?? ''} onChange={e => setPrices(current => ({ ...current,[item.id]:e.target.value }))} /><label><input type="checkbox" checked={!!free[item.id]} onChange={e => setFree(current => ({ ...current,[item.id]:e.target.checked }))} /> Confirmar Gratis si el precio es cero</label><ButtonSecondary disabled={prices[item.id] === undefined} onClick={() => void storePrice(item)}>Guardar precio de {item.name}</ButtonSecondary></details></details>
        </article>)}{proposal.offers.map(item => <article className="proposal-offer" key={item.id}>{item.image&&<ProjectImage value={item.image} alt={item.name} />}<h3>{item.name}</h3><p>{item.description}</p><strong>{offerPrice(item)}</strong><small>{item.kind === 'package' ? 'Paquete' : item.kind === 'service' ? 'Servicio' : 'Producto'} · oferta complementaria</small><ButtonSecondary onClick={() => editOffer(item)}>Editar {item.name}</ButtonSecondary><ButtonSecondary onClick={() => patch({ offers:proposal.offers.filter(o => o.id !== item.id) })}>Quitar de la propuesta {item.name}</ButtonSecondary></article>)}</div>
        {offer && <EditorSheet open={offerPanel} title="Editar oferta" onClose={() => setOfferPanel(false)}>
          <OfferComposer key={offer.id} offer={offer} onChange={setOffer} onApply={() => void applyOffer()} onCancel={() => setOffer(null)} busy={busy} />
        </EditorSheet>}
        {offer && !offerPanel && <ButtonSecondary onClick={() => setOfferPanel(true)}>Retomar mi oferta pendiente</ButtonSecondary>}
      </>}
      {step === 2 && <><h2>Invita a dar el siguiente paso</h2><div className="proposal-definition-cards">{(['message','cta','whatsapp','conditions'] as const).map((key,i)=><button type="button" className={`proposal-definition-card proposal-card-${i}`} key={key} onClick={()=>setField(key)}><h3>{cardTitles[key]}</h3><p>{proposal[key]||'Lo puedes definir después'}</p><small>Editar →</small></button>)}</div></>}
    </fieldset>
    <EditorSheet open={field!==null} title={field?cardLabels[field]:''} onClose={()=>setField(null)}>{field&&<><Textarea disabled={busy} label={cardLabels[field]} autoFocus value={proposal[field]} maxLength={field==='cta'?50:field==='message'?180:field==='whatsapp'?30:2000} onChange={e=>patch({[field]:e.target.value})}/><p>Escribe con tus palabras. Podrás volver a cambiarlo.</p><ButtonPrimary disabled={busy} onClick={()=>void storeProposal()}>Guardar esta parte</ButtonPrimary></>}</EditorSheet>
    <footer className="proposal-actions">{step===1&&!dirty?native.length+proposal.offers.length>0?<Link className="pe-action-link pe-action-primary" to={'/dashboard/tools/landing'+query}>Ver mi página →</Link>:null:dirty?<ButtonPrimary disabled={busy||uncommitted} onClick={()=>void storeProposal()}>{busy?'Guardando…':'Guardar mis cambios'}</ButtonPrimary>:step<2?<ButtonPrimary disabled={busy} onClick={()=>setStep(step+1)}>Continuar →</ButtonPrimary>:<ButtonPrimary disabled={!canPrepare} onClick={openPreparation}>Ver mi página →</ButtonPrimary>}</footer>
    <p role={error ? 'alert' : 'status'}>{error || (busy ? 'Guardando…' : uncommitted ? 'Aplica o cancela las ediciones de ofertas pendientes.' : dirty ? 'Propuesta pendiente de guardar.' : notice || (documentRevision('module-proposal') ? 'Propuesta guardada en tu cuenta.' : 'Aún no guardaste tu propuesta.'))}</p>
    {error && <ButtonSecondary disabled={busy} onClick={() => { if (dirty || uncommitted) setConfirmRecovery(true); else void reload(); }}>Recuperar datos guardados</ButtonSecondary>}
    {confirmRecovery && <section className="proposal-preparation" aria-label="Confirmar recuperación"><h2>¿Recuperar la versión guardada?</h2><p>Se descartarán las ediciones pendientes de esta propuesta. Puedes cancelar para conservarlas en pantalla.</p><ButtonSecondary onClick={() => setConfirmRecovery(false)}>Conservar mis cambios pendientes</ButtonSecondary><ButtonPrimary disabled={busy} onClick={() => void reload()}>Descartar pendientes y recuperar</ButtonPrimary></section>}
    {preparing && <section className="proposal-preparation" aria-label="Revisar cambios de la página"><h2>{docs.landing ? 'Elige qué actualizar' : 'Tu página está por nacer'}</h2><p>Conservaremos tus secciones, imágenes y dirección. Esto cambia el borrador; no publica.</p>{(docs.landing?changedPreparationFields(base,proposal,proposalOffers(proposal,type,docs[catalogKey])):[...preparationFields]).map(field => <label key={field}><input type="checkbox" checked={chosen.includes(field)} onChange={e => setChosen(current => e.target.checked ? [...current,field] : current.filter(f => f !== field))} /><span><strong>{labels[field]}</strong>{docs.landing && <small>Actual: {previewValue(field,false) || 'Vacío'}</small>}<small>Propuesta: {previewValue(field,true) || 'Vacío'}</small></span></label>)}{docs.landing&&!changedPreparationFields(base,proposal,proposalOffers(proposal,type,docs[catalogKey])).length&&<p>No hay diferencias con el borrador. Puedes abrir el editor para seguir creando.</p>}<ButtonPrimary disabled={busy || !chosen.length} onClick={() => void run(async () => {
      const source = { proposalRevision:documentRevision('module-proposal')!, catalogRevision:documentRevision(catalogKey) };
      const landing = prepareLanding(base,proposal,proposalOffers(proposal,type,docs[catalogKey]),source,chosen);
      await save('landing',landing); setPreparing(false); remember({ projectId,tool:'landing' }); navigate('/dashboard/tools/landing' + query);
    })}>Aplicar al borrador y abrir editor</ButtonPrimary><ButtonSecondary onClick={() => setPreparing(false)}>Volver a mi propuesta</ButtonSecondary></section>}
  </section>;
}
