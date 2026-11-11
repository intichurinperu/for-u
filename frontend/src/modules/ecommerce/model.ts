export type Product = { conditions?: string; id: string; name: string; description: string; category: string; price: number; stock: number; image: string; active: boolean };
export type CartLine = { productId: string; quantity: number };
export type Order = {
  id: string; customer: string; contact: string; address: string; createdAt: string;
  lines: Array<{ productId: string; name: string; quantity: number; unitPrice: number }>;
  total: number; status: 'pending' | 'paid' | 'fulfilled' | 'cancelled'; paymentReference: string;
};
export type EcommerceData = { version: 1; products: Product[]; orders: Order[]; settings: { name: string; tagline: string; about: string; whatsapp: string; shipping: string; returns: string; coverImage: string } };
export function emptyEcommerce(name: string): EcommerceData { return { version: 1, products: [], orders: [], settings: { name, tagline: '', about: '', whatsapp: '', shipping: '', returns: '', coverImage: '' } }; }
export function saveProduct(data: EcommerceData, product: Product): EcommerceData {
  if (!product.name.trim() || !Number.isFinite(product.price) || product.price < 0 || !Number.isSafeInteger(product.stock) || product.stock < 0) throw new Error('Completa el nombre, un precio válido y un stock entero igual o mayor a cero.');
  const value = { ...product, name: product.name.trim(), price: Math.round(product.price * 100) / 100 };
  return { ...data, products: data.products.some(item => item.id === value.id) ? data.products.map(item => item.id === value.id ? value : item) : [...data.products, value] };
}
export function priceCart(data: EcommerceData, cart: CartLine[]) {
  if (!cart.length) throw new Error('Agrega al menos un producto al carrito.');
  const counts = new Map<string, number>();
  for (const line of cart) {
    if (!Number.isSafeInteger(line.quantity) || line.quantity < 1) throw new Error('Cada cantidad debe ser un entero mayor a cero.');
    counts.set(line.productId, (counts.get(line.productId) ?? 0) + line.quantity);
  }
  const lines = [...counts].map(([productId, quantity]) => {
    const product = data.products.find(item => item.id === productId);
    if (!product || !product.active) throw new Error('Uno de los productos ya no está disponible.');
    if (quantity > product.stock) throw new Error(`No hay suficiente stock de ${product.name}.`);
    if (!Number.isFinite(product.price) || product.price < 0) throw new Error('El producto tiene un precio inválido.');
    return { productId, name: product.name, quantity, unitPrice: product.price };
  });
  const cents = lines.reduce((sum, line) => sum + Math.round(line.unitPrice * 100) * line.quantity, 0);
  if (!Number.isSafeInteger(cents)) throw new Error('El total excede el límite permitido.');
  return { lines, total: cents / 100 };
}
export function createOrder(data: EcommerceData, cart: CartLine[], customer: Pick<Order, 'customer' | 'contact' | 'address'>, id: string, createdAt = new Date().toISOString()): EcommerceData {
  if (data.orders.some(order => order.id === id)) return data;
  if (!id || !customer.customer.trim() || !customer.contact.trim()) throw new Error('Completa el nombre y un medio de contacto.');
  const priced = priceCart(data, cart);
  return { ...data,
    products: data.products.map(product => ({ ...product, stock: product.stock - (priced.lines.find(line => line.productId === product.id)?.quantity ?? 0) })),
    orders: [...data.orders, { id, ...customer, ...priced, createdAt, status: 'pending', paymentReference: '' }],
  };
}
export function cancelOrder(data: EcommerceData, id: string): EcommerceData {
  const order = data.orders.find(item => item.id === id);
  if (!order) throw new Error('Pedido no encontrado.');
  if (order.status === 'cancelled') return data;
  if (order.status !== 'pending') throw new Error('Un pedido cobrado requiere gestionar su devolución antes de cancelar.');
  return { ...data, orders: data.orders.map(item => item.id === id ? { ...item, status: 'cancelled' } : item), products: data.products.map(product => ({ ...product, stock: product.stock + (order.lines.find(line => line.productId === product.id)?.quantity ?? 0) })) };
}
export function fulfillOrder(data: EcommerceData, id: string): EcommerceData {
  const order = data.orders.find(item => item.id === id);
  if (!order || order.status !== 'paid') throw new Error('Solo puedes despachar pedidos con pago confirmado.');
  return { ...data, orders: data.orders.map(item => item.id === id ? { ...item, status: 'fulfilled' } : item) };
}
