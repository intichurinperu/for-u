import {Link,useSearchParams} from 'react-router-dom';
import {readPaymentReturn} from './service';
import PaymentPanel from './PaymentPanel';
export default function PaymentReturn(){const [params]=useSearchParams();const context=readPaymentReturn(sessionStorage,params.get('attempt')||'');return <main className="restaurant-module restaurant-public"><h1>Consulta tu pago</h1><p>Volver del checkout no confirma un pago.</p>{context?<><PaymentPanel {...context}/><Link to={`${context.kind==='restaurant'?'/pedidos/':'/compras/'}${context.order}${context.token?'#'+context.token:''}`}>Volver al seguimiento privado</Link></>:<p>Abre el enlace privado del pedido que guardaste antes de pagar. Este navegador no conserva su acceso; no mostraremos datos sin autorización.</p>}</main>;}
