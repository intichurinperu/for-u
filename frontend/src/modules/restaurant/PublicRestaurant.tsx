import { ButtonSecondary as DSButtonSecondary } from '../../components/ui/DesignSystem';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import RestaurantMenu from './RestaurantMenu';
import RestaurantCheckout from './RestaurantCheckout';
import { parsePublishedRestaurant, type PublishedRestaurant } from './publicMenu';
import './restaurant.css';
import { usePublicModuleAnalytics } from '../usePublicModuleAnalytics';


export default function PublicRestaurant() {
  const { slug } = useParams();
  return <PublicRestaurantSession key={slug} slug={slug ?? ''} />;
}
function PublicRestaurantSession({ slug }: { slug: string }) {
  const [site, setSite] = useState<PublishedRestaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');
  const [attempt, setAttempt] = useState(0);
  const trackContact = usePublicModuleAnalytics(slug, Boolean(site));
  useEffect(() => {
    let active = true;
    async function refresh() {
      try {
        if (!supabase || !/^[a-z0-9][a-z0-9-]{2,59}$/.test(slug)) throw new Error('Esta carta no está disponible.');
        const { data, error } = await supabase.rpc('module_public_site', { site_slug: slug });
        if (error) throw new Error('No se pudo cargar la carta. Reintenta en un momento.');
        const parsed = parsePublishedRestaurant(data?.content);
        if (active) { setSite(parsed); setNotice(parsed ? '' : 'Esta carta no está disponible.'); }
      } catch (error) { if (active) { setSite(null); setNotice((error as Error).message); } }
      finally { if (active) setLoading(false); }
    }
    void refresh();
    const interval = window.setInterval(() => { if (!document.hidden) void refresh(); }, 30000);
    return () => { active = false; window.clearInterval(interval); };
  }, [slug, attempt]);
  useEffect(() => {
    const previous = document.title;
    document.title = site ? `${site.menu.settings.title} · Carta` : 'Carta · For U';
    return () => { document.title = previous; };
  }, [site]);
  return <main className="restaurant-module restaurant-public" onClickCapture={trackContact}>
    {loading ? <p role="status">Cargando la carta…</p> : site ? <RestaurantMenu data={site.menu} slug={slug} /> : <><h1>Carta no disponible</h1><p role="status">{notice}</p><DSButtonSecondary type="button" onClick={() => setAttempt(value => value + 1)}>Reintentar</DSButtonSecondary><RestaurantCheckout slug={slug} selections={[]} onPlaced={()=>{}} /></>}
  </main>;
}
