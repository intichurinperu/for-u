import {useRef, useState} from 'react';
import {Link, useSearchParams} from 'react-router-dom';
import PearlButton from '../components/ui/PearlButton';
import {Input} from '../components/ui/DesignSystem';
import {usePrivateDocument} from '../experience/usePrivateDocument';
import {randomId} from '../lib/randomId';
import {useUnsavedNavigation} from '../lib/useUnsavedNavigation';
import {downloadBlob} from '../toolkit/api';
import {useToolkit} from '../toolkit/ToolkitContext';
import type {BusinessRoute} from '../workspace/contracts';
import {offerPrice, type Offer} from './model';
import {costCategories, costLineTotal, costMoney, costTotals, emptyOfferCosts, offerCostsPath, parseOfferCosts, summarizeOfferCosts, type CostLine} from './offerCosts';
import './offerCosts.css';

export default function OfferCostsEditor({offers, route}: {offers: Offer[]; route: BusinessRoute}) {
  const {userId, projectId, business, demo} = useToolkit();
  const [params] = useSearchParams();
  const doc = usePrivateDocument(userId, projectId, 'offer-costs', emptyOfferCosts, parseOfferCosts);
  const [selected, setSelected] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string|null>(null);
  const [notice, setNotice] = useState('');
  const [exporting, setExporting] = useState(false);
  const exportLock = useRef(false);
  const saveLock = useRef(false);
  const rows = summarizeOfferCosts(offers, doc.data);
  const current = rows.find(row => row.offer.id === params.get('costOffer'));
  const editing = current?.lines.find(line => line.id === editingId);
  const promotion = rows.filter(row => selected.includes(row.offer.id));
  const totals = costTotals(promotion);
  const back = new URLSearchParams(params);
  back.set('section', 'offers');
  back.delete('costOffer');
  const price = new URLSearchParams(back);
  if (current) price.set('offer', current.offer.id);
  useUnsavedNavigation(doc.dirty || doc.operation === 'saving');

  async function saveLines(lines: CostLine[]) {
    if (saveLock.current || doc.busy || doc.conflict || demo) return;
    saveLock.current = true;
    try {
      const next = parseOfferCosts({version: 1, lines});
      doc.change(next);
      setNotice(await doc.save() ? 'Costos guardados.' : '');
      setEditingId(null);
    } finally {
      saveLock.current = false;
    }
  }

  async function exportCosts() {
    if (exportLock.current || doc.dirty || doc.conflict) return;
    exportLock.current = true;
    setExporting(true);
    setNotice('');
    try {
      const {offerCostsWorkbook} = await import('./offerCostsWorkbook');
      const blob = await offerCostsWorkbook(business.name, route, rows, promotion);
      downloadBlob(blob, 'costos-y-precios-for-u.xlsx');
      setNotice('Excel descargado.');
    } catch {
      setNotice('No pudimos descargar el Excel. Inténtalo otra vez.');
    } finally {
      exportLock.current = false;
      setExporting(false);
    }
  }

  return <section className="proposal-offers-container offer-costs">
    <header className="proposal-offers-top offer-costs-intro">
      <div>
        <span className="proposal-kicker">{business.name}</span>
        <h1>Costos y precios</h1>
        <p>Calcula cuánto te cuesta preparar una unidad de cada oferta.</p>
        <PearlButton compact tone="neutral" to={'/dashboard/tools/proposal?' + back}>Mis ofertas</PearlButton>
      </div>
      <img src={`/brand/island-areas/${route}-finance.jpg`} width={374} height={300} alt=""/>
    </header>

    {!doc.loaded && <p role="status">Preparando tus costos…</p>}
    {doc.error && <div className="offer-costs-feedback">
      <p role="alert">{doc.error}</p>
      {doc.conflict
        ? <PearlButton compact tone="neutral" onClick={() => {
          if (window.confirm('¿Cargar la versión guardada y descartar los cambios pendientes?')) void doc.recover();
        }}>Recuperar versión guardada</PearlButton>
        : <PearlButton compact tone="neutral" disabled={doc.busy} onClick={() => void (doc.dirty ? doc.save() : doc.reload())}>Reintentar</PearlButton>}
    </div>}

    {doc.loaded && current && <section className="proposal-offers-card">
      <div className="offer-costs-heading">
        <div><h2>{current.offer.name}</h2><p>Precio de venta · {offerPrice(current.offer)}</p></div>
        <PearlButton compact tone="neutral" to={'/dashboard/tools/proposal?' + price}>Editar precio</PearlButton>
      </div>
      {current.lines.length > 0 && <ul className="offer-costs-lines">
        {current.lines.map(line => <li key={line.id}>
          <div><strong>{line.name}</strong><small>{line.category} · {line.quantity} {line.unit} × {costMoney(line.unitCents)}</small></div>
          <span>{costMoney(costLineTotal(line))}</span>
          <button type="button" className="proposal-action-pill-btn" aria-label={`Editar ${line.name}`}
            disabled={doc.busy || doc.conflict || demo}
            onClick={() => setEditingId(line.id)}>Editar</button>
        </li>)}
      </ul>}
      <p>Costo registrado · <strong>{costMoney(current.cost)}</strong></p>
      <CostForm key={current.offer.id + (editing?.id ?? '')} route={route} initial={editing}
        disabled={doc.busy || doc.conflict || demo}
        onCancel={() => setEditingId(null)}
        onRemove={editing ? () => void saveLines(doc.data.lines.filter(item => item.id !== editing.id)) : undefined}
        onSave={line => saveLines(editing
          ? doc.data.lines.map(item => item.id === editing.id ? {...editing, ...line} : item)
          : [...doc.data.lines, {...line, id: randomId(), offerId: current.offer.id}])}/>
    </section>}

    {doc.loaded && <section className="proposal-offers-card">
      <div className="offer-costs-heading">
        <div><h2>Mis ofertas</h2><p>Marca las que quieres comparar para una promoción.</p></div>
        <PearlButton compact tone="neutral" disabled={!rows.length || doc.busy || doc.dirty || !!doc.error || exporting} onClick={() => void exportCosts()}>
          {exporting ? 'Preparando Excel…' : 'Descargar Excel'}
        </PearlButton>
      </div>
      {!rows.length && <p>Añade una oferta para registrar sus costos.</p>}
      <ul className="offer-costs-lines">
        {rows.map(row => <li key={row.offer.id}>
          <label className="offer-costs-choice">
            <input type="checkbox" checked={selected.includes(row.offer.id)}
              onChange={event => setSelected(event.target.checked ? [...selected, row.offer.id] : selected.filter(id => id !== row.offer.id))}/>
            <span>{row.offer.name}</span>
          </label>
          <span>{offerPrice(row.offer)} · Costo {costMoney(row.cost)}</span>
          <Link className="proposal-action-pill-btn" aria-label={`Ver costos de ${row.offer.name}`} to={offerCostsPath(params, projectId, row.offer.id)}>Ver costos</Link>
        </li>)}
      </ul>
      {promotion.length > 0 && <div className="offer-costs-promotion">
        <h3>Comparación para promoción</h3>
        <p>{promotion.length} {promotion.length === 1 ? 'oferta' : 'ofertas'} · Una unidad de cada una</p>
        <p>Precios registrados <strong>{costMoney(totals.price)}</strong> · Costos registrados <strong>{costMoney(totals.cost)}</strong></p>
        <p>{totals.difference === null ? 'Completa los precios y costos para ver la diferencia.' : <>Precio menos costo <strong>{costMoney(totals.difference)}</strong></>}</p>
      </div>}
    </section>}
    {notice && <p role="status">{notice}</p>}
  </section>;
}

function CostForm({route, disabled, initial, onCancel, onRemove, onSave}: {
  route: BusinessRoute; disabled: boolean; onSave: (line: Omit<CostLine, 'id'|'offerId'>) => Promise<void>;
  initial?: CostLine; onCancel: () => void; onRemove?: () => void;
}) {
  const categories = [...new Set([...costCategories[route], ...(initial ? [initial.category] : [])])];
  const [category, setCategory] = useState(initial?.category ?? categories[0]);
  const [name, setName] = useState(initial?.name ?? '');
  const [quantity, setQuantity] = useState(String(initial?.quantity ?? 1));
  const [unit, setUnit] = useState(initial?.unit ?? '');
  const [cost, setCost] = useState(initial ? String(initial.unitCents / 100) : '');
  const [error, setError] = useState('');
  return <form className="offer-costs-form" onSubmit={async event => {
    event.preventDefault();
    setError('');
    if (disabled) return;
    try {
      await onSave({category, name: name.trim(), quantity: Number(quantity), unit: unit.trim(), unitCents: cost.trim() ? Math.round(Number(cost) * 100) : NaN});
      setName(''); setQuantity('1'); setUnit(''); setCost('');
    } catch (e) {setError((e as Error).message);}
  }}>
    <h3>{initial ? 'Editar costo' : 'Añadir un costo'}</h3>
    <fieldset disabled={disabled}>
      <label className="offer-costs-category">Categoría<select value={category} onChange={event => setCategory(event.target.value)}>
        {categories.map(value => <option key={value}>{value}</option>)}
      </select></label>
      <Input label="Concepto" maxLength={120} required value={name} onChange={event => setName(event.target.value)}/>
      <Input label="Cantidad" type="number" min=".001" max="10000" step=".001" required value={quantity} onChange={event => setQuantity(event.target.value)}/>
      <Input label="Unidad" maxLength={40} placeholder="Ej. kg, horas o unidades" required value={unit} onChange={event => setUnit(event.target.value)}/>
      <Input label="Costo por unidad (S/)" type="number" min="0" max="1000000" step=".01" required value={cost} onChange={event => setCost(event.target.value)}/>
      <PearlButton type="submit" compact disabled={disabled}>Guardar costo</PearlButton>
      {initial && <div className="offer-costs-heading">
        <PearlButton type="button" compact tone="neutral" onClick={onCancel}>Cancelar</PearlButton>
        <PearlButton type="button" compact tone="neutral" onClick={onRemove}>Quitar costo</PearlButton>
      </div>}
    </fieldset>
    {error && <p role="alert">{error}</p>}
  </form>;
}
