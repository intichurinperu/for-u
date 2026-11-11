import {presentationClass} from '../../presentation/model';
import { ButtonSecondary as DSButtonSecondary } from '../../components/ui/DesignSystem';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import PublicTours from './PublicTours';
import { usePublicModuleAnalytics } from '../usePublicModuleAnalytics';
import { parsePublishedTourism, type PublishedTourism } from './tourismPublicationModel';
import CommerceCheckout from '../../payments/CommerceCheckout';
export default function PublicTourism() { const { slug } = useParams(); return <PublicTourismSession key={slug} slug={slug ?? ''} />; }
function PublicTourismSession({ slug }: { slug: string }) {
  const [loaded, setLoaded] = useState(false);
  const [site, setSite] = useState<{ content: PublishedTourism; revision: string } | null>(null);
  const [notice, setNotice] = useState('');
  const [attempt, setAttempt] = useState(0);
  const trackContact = usePublicModuleAnalytics(slug, Boolean(site));
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        if (!supabase || !/^[a-z0-9][a-z0-9-]{2,59}$/.test(slug)) throw new Error('Esta página no está disponible.');
        const { data, error } = await supabase.rpc('module_public_site', { site_slug: slug });
        const parsed = parsePublishedTourism(data?.content);
        if (error || !parsed || typeof data?.revision !== 'string') throw new Error('No se pudieron cargar las experiencias. Revisa el enlace o reintenta.');
        if (active) { setSite({ content: parsed, revision: data.revision }); setNotice(''); }
      } catch (error) { if (active) setNotice((error as Error).message); }
      finally { if (active) setLoaded(true); }
    })();
    return () => { active = false; };
  }, [slug, attempt]);
  useEffect(() => { const previous = document.title; document.title = site ? `${site.content.settings.name} · Experiencias` : 'Experiencias · For U'; return () => { document.title = previous; }; }, [site]);
  if (!loaded) return <main className="tourism-module tourism-public"><p role="status">Cargando experiencias…</p></main>;
  return <main className={presentationClass(site?.content.presentationVersion)} onClickCapture={trackContact}>{site ? <><PublicTours site={site.content} revision={site.revision} slug={slug} /><CommerceCheckout slug={slug} sourceKind="module"/></> : <section className="tourism-module tourism-public"><h1>Página no disponible</h1><p role="status">{notice}</p><DSButtonSecondary onClick={() => setAttempt(value => value + 1)}>Reintentar</DSButtonSecondary></section>}</main>;
}
