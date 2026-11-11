import {presentationClass} from '../../presentation/model';
import { Card as DSCard } from '../../components/ui/DesignSystem';
import { Input as DSInput, ButtonSecondary as DSButtonSecondary } from '../../components/ui/DesignSystem';
import ProjectImage from '../../components/shared/ProjectImage';
import { useEffect, useState } from 'react';
import { readSavedCart } from './orderSession';
import RestaurantCheckout from './RestaurantCheckout';
import CustomerRestaurantProfile from './CustomerRestaurantProfile';
import type { Dish } from './model';
import { quoteRestaurantCart, cartWhatsappUrl, type CartSelection } from './cart';
import type { RestaurantMenuData } from './publicMenu';

/** Customer-facing menu; the editor supplies the current draft for preview. */
export default function RestaurantMenu({ data, slug }: { data: RestaurantMenuData; slug?: string }) {
  const [selections, setSelections] = useState<CartSelection[]>(()=>{try{return slug?readSavedCart(localStorage.getItem(`foru-cart:${slug}`)):[];}catch{return [];}});
  useEffect(()=>{if(slug){try{localStorage.setItem(`foru-cart:${slug}`,JSON.stringify(selections));}catch{/* Cart still works in memory. */}}},[slug,selections]);
  const [notice, setNotice] = useState('');
  const [category, setCategory] = useState('');
  const { settings } = data;
  const available = data.dishes.filter(dish => dish.available);
  const categories = [...new Set(available.map(dish => dish.category))];
  let quote: ReturnType<typeof quoteRestaurantCart> | null = null;
  let orderUrl = '';
  let orderError = '';
  try {
    quote = quoteRestaurantCart(data.dishes, selections);
    if (quote.lines.length) orderUrl = cartWhatsappUrl(settings.whatsapp, quote);
  } catch (error) { orderError = (error as Error).message; }
  const total = quote ? quote.totalCents / 100 : null;
  return <div className={`restaurant-menu-preview ${presentationClass(data.presentationVersion)}`}>
    {!data.sections.some(section => section.id === 'hero' && section.visible) && <h1>{settings.title}</h1>}
    {data.sections.filter(section => section.visible).map(section => <DSCard as="section" id={section.id} key={section.id} className="component-card" aria-label={section.title}>
      {section.id === 'hero' && <><h1>{settings.title}</h1><p>{settings.tagline}</p><a className="restaurant-order-cta" href="#menu">Ver menú y hacer mi pedido</a><ProjectImage className="restaurant-menu-cover" value={settings.coverImage} alt={settings.title} /></>}
      {section.id === 'menu' && <><h2>Menú</h2><label>Categoría<select value={categories.includes(category) ? category : ''} onChange={event => setCategory(event.target.value)}><option value="">Todas</option>{categories.map(value => <option key={value} value={value}>{value}</option>)}</select></label>
        <div className="menu-grid">{available.filter(dish => !categories.includes(category) || dish.category === category).map(dish => <DSCard as="article" className="dish-card" key={dish.id}>
          <ProjectImage value={dish.image} alt={dish.name} />
          <div className="dish-card-body"><h3>{dish.name}</h3><p>{dish.description}</p><strong>{dish.variants?.length ? 'Elige tu presentación' : `S/ ${dish.price.toFixed(2)}`}</strong><DishOrderControls dish={dish} onAdd={selection => {
            if (selections.length >= 100) { setNotice('Tu pedido admite hasta 100 líneas.'); return; }
            setSelections(current => [...current, selection]); setNotice(`${dish.name} añadido a tu pedido.`);
          }} /></div>
        </DSCard>)}</div>{!available.length && <p>La carta se está preparando.</p>}
        <p role="status">{notice}</p>
        {selections.length > 0 && <aside id="pedido" aria-label="Tu pedido"><h3>Tu pedido</h3><ul>{selections.map(selection => {
          const line = quote?.lines.find(item => item.id === selection.id);
          return <li key={selection.id}><strong>{selection.quantity} × {line?.name ?? data.dishes.find(item => item.id === selection.dishId)?.name ?? 'Producto no disponible'}</strong>
            {line?.variantName && <span> · {line.variantName}</span>}{line?.extraNames.length ? <p>Extras: {line.extraNames.join(', ')}</p> : null}
            {selection.note && <p>Nota: {selection.note}</p>}{line && <p>S/ {(line.totalCents / 100).toFixed(2)}</p>}
            <DSButtonSecondary type="button" aria-label={`Quitar ${line?.name ?? 'producto'} del pedido`} onClick={() => setSelections(current => current.filter(item => item.id !== selection.id))}>Quitar</DSButtonSecondary></li>;
        })}</ul>{total !== null && <strong>Productos: S/ {total.toFixed(2)}</strong>}<details><summary>Consultar por WhatsApp (opcional)</summary><p>WhatsApp es una consulta aparte. Usa la confirmación de FOR U para registrar el pedido.</p>{orderError ? <p role="alert">{orderError}</p> : <a href={orderUrl} target="_blank" rel="noopener noreferrer">Revisar pedido en WhatsApp</a>}</details><DSButtonSecondary type="button" onClick={() => { setSelections([]); setNotice('Pedido vaciado.'); }}>Vaciar pedido</DSButtonSecondary></aside>}
        {slug && <RestaurantCheckout slug={slug} selections={selections} onPlaced={()=>{setSelections([]);setNotice('Pedido registrado. Abre el seguimiento privado.');}}/>}
      </>}
      {section.id === 'about' && <><h2>Conócenos</h2><p>{settings.about}</p></>}
      {section.id === 'faq' && <><h2>Preguntas frecuentes</h2>{settings.faq.filter(item => item.question.trim()).map(item => <details key={item.id}><summary>{item.question}</summary><p>{item.answer}</p></details>)}</>}
      {section.id === 'location' && <><h2>Visítanos</h2><p>{settings.address}</p><p>{settings.hours}</p>{settings.address.trim() && <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.address)}`} target="_blank" rel="noopener noreferrer">Ver ubicación</a>}</>}
      {section.id === 'loyalty' && <><h2>Para nuestros clientes frecuentes</h2><p>{settings.loyalty}</p></>}
    </DSCard>)}
    {slug && <CustomerRestaurantProfile slug={slug} dishes={data.dishes}/>}
    {selections.length > 0 && <a className="restaurant-order-summary" href="#pedido">Ver mi pedido{total !== null ? ` · S/ ${total.toFixed(2)}` : ' · revisar opciones'}</a>}
  </div>;
}

function DishOrderControls({ dish, onAdd }: { dish: Dish; onAdd: (selection: CartSelection) => void }) {
  const [variantId, setVariantId] = useState('');
  const [extraIds, setExtraIds] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  return <div className="restaurant-order-options">
    {!!dish.variants?.length && <label>Presentación de {dish.name}<select value={variantId} onChange={event => setVariantId(event.target.value)}><option value="">Elige una presentación</option>{dish.variants.filter(option => option.available).map(option => <option key={option.id} value={option.id}>{option.name} · S/ {option.price.toFixed(2)}</option>)}</select></label>}
    {!!dish.extras?.some(option => option.available) && <fieldset><legend>Extras para {dish.name}</legend>{dish.extras.filter(option => option.available).map(option => <label key={option.id}><input type="checkbox" checked={extraIds.includes(option.id)} onChange={event => setExtraIds(current => event.target.checked ? [...current, option.id] : current.filter(id => id !== option.id))} />{option.name} · + S/ {option.price.toFixed(2)}</label>)}</fieldset>}
    <label>Cantidad de {dish.name}<DSInput type="number" min="1" max="99" step="1" value={Number.isFinite(quantity) ? quantity : ''} onChange={event => setQuantity(event.target.valueAsNumber)} /></label>
    <label>Nota para {dish.name}<textarea maxLength={300} value={note} placeholder="Opcional" onChange={event => setNote(event.target.value)} /></label>
    <DSButtonSecondary type="button" onClick={() => {
      const selection = { id: crypto.randomUUID(), dishId: dish.id, variantId: variantId || undefined, extraIds, quantity, note };
      try { quoteRestaurantCart([dish], [selection]); onAdd(selection); setError(''); }
      catch (failure) { setError((failure as Error).message); }
    }}>Agregar {dish.name} al pedido</DSButtonSecondary>
    {error && <p role="alert">{error}</p>}
  </div>;
}
