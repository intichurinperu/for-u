import { Card as DSCard } from '../../components/ui/DesignSystem';
import { Input as DSInput, Textarea as DSTextarea, ButtonSecondary as DSButtonSecondary } from '../../components/ui/DesignSystem';
import ProjectImage from '../../components/shared/ProjectImage';
import ProjectImageField from '../../components/shared/ProjectImageField';
import { useModuleDraft } from '../useModuleDraft';
import { useState, type FormEvent } from 'react';
import { saveProduct, type EcommerceData, type Product } from './model';
import './ecommerce.css';
export type EcommerceProps = { data: EcommerceData; onChange: (data: EcommerceData) => void };

export default function EcommerceEditor({ data, onChange }: EcommerceProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [message, setMessage] = useState('');
  useModuleDraft(!!product);
  function submit(event: FormEvent) {
    event.preventDefault(); if (!product) return;
    try { onChange(saveProduct(data, product)); setProduct(null); setMessage('Producto actualizado. Guarda los cambios de tu tienda.'); }
    catch (error) { setMessage((error as Error).message); }
  }
  return <div className="ecommerce-module"><h2>Catálogo y tienda</h2><p role="status">{message}</p>
    <details className="module-identity"><summary>Identidad y condiciones de mi tienda</summary><DSCard as="section" className="commerce-card commerce-form"><h3>Identidad de la tienda</h3><ProjectImageField label="Imagen de portada" value={data.settings.coverImage} onChange={value => onChange({ ...data, settings: { ...data.settings, coverImage: value } })} />
      {([['name', 'Nombre', 'Nombre que verán tus clientes en la tienda.'], ['tagline', 'Frase de portada', 'Resume en una frase qué ofreces.'], ['whatsapp', 'WhatsApp con código de país', 'Incluye el código de país, por ejemplo +51 para Perú.']] as const).map(([key, label, info]) => <DSInput key={key} label={label} info={info} type={key === 'whatsapp' ? 'tel' : 'text'} value={data.settings[key]} onChange={event => onChange({ ...data, settings: { ...data.settings, [key]: event.target.value } })} />)}
      {([['about', 'Sobre la tienda', 'Cuenta la historia y especialidad de tu negocio.'], ['shipping', 'Entregas y envíos', 'Explica zonas, plazos y costos de entrega.'], ['returns', 'Cambios y devoluciones', 'Describe tus condiciones y cómo solicitar un cambio.']] as const).map(([key, label, info]) => <DSTextarea key={key} label={label} info={info} value={data.settings[key]} onChange={event => onChange({ ...data, settings: { ...data.settings, [key]: event.target.value } })} />)}
    </DSCard></details>
    <DSCard as="section" className="commerce-card"><div className="commerce-header"><h3>Productos</h3><DSButtonSecondary onClick={() => setProduct({ id: crypto.randomUUID(), name: '', category: '', description: '', image: '', price: 0, stock: 0, active: true })}>Nuevo producto</DSButtonSecondary></div>
      {!data.products.length && <p>Agrega tu primer producto con su precio y stock.</p>}
      <div className="commerce-grid">{data.products.map(item => <article className="commerce-product" key={item.id}>
        <ProjectImage value={item.image} alt={item.name} />
        <h3>{item.name}</h3><p>{item.category}</p><p>{item.description}</p><strong>S/ {item.price.toFixed(2)}</strong><p>{item.stock} disponibles · {item.active ? 'Visible' : 'Oculto'}</p><DSButtonSecondary onClick={() => setProduct({ ...item })}>Editar {item.name}</DSButtonSecondary>
      </article>)}</div>
    </DSCard>
    {product && <form className="commerce-card commerce-form" onSubmit={submit}><h3>Datos del producto</h3>
      <DSInput label="Nombre del producto" info="Nombre con el que tus clientes encontrarán este producto." required value={product.name} onChange={event => setProduct({ ...product, name: event.target.value })} />
      <DSInput label="Categoría" info="Agrupa productos similares para organizar tu catálogo." value={product.category} onChange={event => setProduct({ ...product, category: event.target.value })} />
      <DSTextarea label="Descripción" info="Explica los detalles que necesita conocer tu cliente antes de elegir." value={product.description} onChange={event => setProduct({ ...product, description: event.target.value })} />
      <DSInput label="Precio (S/)" info="Precio por unidad en soles; admite dos decimales." type="number" min="0" step="0.01" required value={Number.isFinite(product.price) ? product.price : ''} onChange={event => setProduct({ ...product, price: event.target.valueAsNumber })} />
      <DSInput label="Stock disponible" info="Cantidad de unidades que puedes ofrecer actualmente." type="number" min="0" step="1" required value={Number.isFinite(product.stock) ? product.stock : ''} onChange={event => setProduct({ ...product, stock: event.target.valueAsNumber })} />
      <ProjectImageField label="Imagen del producto" value={product.image} onChange={value => setProduct({ ...product, image: value })} />
      <label className="commerce-check"><DSInput type="checkbox" checked={product.active} onChange={event => setProduct({ ...product, active: event.target.checked })} />Mostrar en catálogo</label>
      <div className="commerce-actions"><DSButtonSecondary type="submit">Guardar producto</DSButtonSecondary><DSButtonSecondary type="button" onClick={() => setProduct(null)}>Cancelar</DSButtonSecondary></div>
    </form>}
  </div>;
}
