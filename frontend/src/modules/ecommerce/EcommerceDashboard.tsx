import { Card as DSCard } from '../../components/ui/DesignSystem';
import { ButtonSecondary as DSButtonSecondary, Input as DSInput, Textarea as DSTextarea } from '../../components/ui/DesignSystem';
import { useModuleDraft } from '../useModuleDraft';
import { useState, type FormEvent } from 'react';
import { cancelOrder, createOrder, fulfillOrder, priceCart, type CartLine } from './model';
import type { EcommerceProps } from './EcommerceEditor';
import './ecommerce.css';
const labels = { pending: 'Pendiente de pago', paid: 'Pagado', fulfilled: 'Despachado', cancelled: 'Cancelado' };

export default function EcommerceDashboard({ data, onChange }: EcommerceProps) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [customer, setCustomer] = useState({ customer: '', contact: '', address: '' });
  const [operationId, setOperationId] = useState(() => crypto.randomUUID());
  const [message, setMessage] = useState('');
  const [showOrder, setShowOrder] = useState(false);
  useModuleDraft(showOrder && (cart.length > 0 || !!customer.customer || !!customer.contact || !!customer.address));
  let quote: ReturnType<typeof priceCart> | null = null;
  let cartError = '';
  if (cart.length) { try { quote = priceCart(data, cart); } catch (error) { cartError = (error as Error).message; } }
  function submit(event: FormEvent) {
    event.preventDefault();
    try { onChange(createOrder(data, cart, customer, operationId)); setCart([]); setCustomer({ customer: '', contact: '', address: '' }); setOperationId(crypto.randomUUID()); setShowOrder(false); setMessage('Pedido registrado y stock reservado. El pago sigue pendiente. Guarda el proyecto.'); }
    catch (error) { setMessage((error as Error).message); }
  }
  return <div className="ecommerce-module"><h2>Pedidos y ventas</h2><p role="status">{message}</p>
    <div className="commerce-grid"><DSCard as="article" className="commerce-card"><h3>Pedidos pendientes</h3><strong>{data.orders.filter(order => order.status === 'pending').length}</strong></DSCard><DSCard as="article" className="commerce-card"><h3>Ventas con pago confirmado</h3><strong>S/ {data.orders.filter(order => ['paid', 'fulfilled'].includes(order.status)).reduce((total, order) => total + order.total, 0).toFixed(2)}</strong></DSCard><DSCard as="article" className="commerce-card"><h3>Productos sin stock</h3><strong>{data.products.filter(product => product.active && product.stock === 0).length}</strong></DSCard></div>
    <DSCard as="section" className="commerce-card"><div className="commerce-header"><h3>Pedidos registrados</h3><DSButtonSecondary onClick={() => setShowOrder(true)}>Registrar pedido</DSButtonSecondary></div>
      {!data.orders.length && <p>Los pedidos que registres aparecerán aquí con su estado de pago.</p>}
      {data.orders.map(order => <details className="commerce-order" key={order.id}><summary>{order.customer} · S/ {order.total.toFixed(2)} · {labels[order.status]}</summary><p>{order.contact}</p><p>{order.address}</p><ul>{order.lines.map(line => <li key={line.productId}>{line.quantity} × {line.name} · S/ {(line.quantity * line.unitPrice).toFixed(2)}</li>)}</ul>
        {order.paymentReference && <p>Referencia de pago: {order.paymentReference}</p>}
        <div className="commerce-actions">{order.status === 'pending' && <DSButtonSecondary onClick={() => { if (window.confirm('¿Cancelar el pedido y devolver las unidades al stock?')) { try { onChange(cancelOrder(data, order.id)); setMessage('Pedido cancelado; stock repuesto.'); } catch (error) { setMessage((error as Error).message); } } }}>Cancelar pedido</DSButtonSecondary>}
        {order.status === 'paid' && <DSButtonSecondary onClick={() => { try { onChange(fulfillOrder(data, order.id)); setMessage('Pedido despachado.'); } catch (error) { setMessage((error as Error).message); } }}>Marcar despachado</DSButtonSecondary>}</div>
      </details>)}
    </DSCard>
    {showOrder && <DSCard as="section" className="commerce-card"><h3>Nuevo pedido</h3><p>Registra un pedido recibido y reserva su stock. Esta acción no cobra al cliente.</p>
      <div className="commerce-grid">{data.products.filter(product => product.active).map(product => <article className="commerce-product" key={product.id}><h3>{product.name}</h3><p>S/ {product.price.toFixed(2)} · {product.stock} disponibles</p><DSButtonSecondary disabled={product.stock === 0} onClick={() => setCart(current => current.some(line => line.productId === product.id) ? current.map(line => line.productId === product.id ? { ...line, quantity: line.quantity + 1 } : line) : [...current, { productId: product.id, quantity: 1 }])}>Agregar {product.name}</DSButtonSecondary></article>)}</div>
      <h3>Carrito</h3>{cart.map(line => <div className="commerce-actions" key={line.productId}><label>{data.products.find(product => product.id === line.productId)?.name}<DSInput type="number" min="1" step="1" value={Number.isFinite(line.quantity) ? line.quantity : ''} onChange={event => setCart(current => current.map(item => item.productId === line.productId ? { ...item, quantity: event.target.valueAsNumber } : item))} /></label><DSButtonSecondary onClick={() => setCart(current => current.filter(item => item.productId !== line.productId))}>Quitar {data.products.find(product => product.id === line.productId)?.name}</DSButtonSecondary></div>)}
      {cartError && <p role="alert">{cartError}</p>}{quote && <p>Total: S/ {quote.total.toFixed(2)}</p>}
      <form className="commerce-form" onSubmit={submit}>
        <label>Nombre del cliente<DSInput required value={customer.customer} onChange={event => setCustomer({ ...customer, customer: event.target.value })} /></label>
        <label>Contacto del cliente<DSInput required value={customer.contact} onChange={event => setCustomer({ ...customer, contact: event.target.value })} /></label>
        <label>Dirección o punto de entrega<DSTextarea value={customer.address} onChange={event => setCustomer({ ...customer, address: event.target.value })} /></label>
        <div className="commerce-actions"><DSButtonSecondary type="submit" disabled={!quote}>Confirmar pedido pendiente de pago</DSButtonSecondary><DSButtonSecondary type="button" onClick={() => setShowOrder(false)}>Cerrar pedido</DSButtonSecondary></div>
      </form>
    </DSCard>}
  </div>;
}
