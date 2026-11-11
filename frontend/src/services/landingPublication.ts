import { parseWidgets } from '../widgets/model';
import { widgetPreview } from '../widgets/service';
import type { LandingDraft } from '../toolkit/types';
import { parseSiteData } from '../toolkit/publicData';
import { validatePublicationSlug, imagePublisher } from './modulePublishing';

export { readLandingPublication, writeLandingPublication } from './landingPublicationRepository';
export type { LandingPublication } from './landingPublicationRepository';

export async function landingPublicSnapshot(userId: string, projectId: string, draft: LandingDraft): Promise<LandingDraft> {
  validatePublicationSlug(draft.slug);
  for(const widget of parseWidgets(draft.widgets,projectId)){if(!await widgetPreview(projectId,widget))throw new Error('Una fuente no está publicada o autorizada. Revisa o quita su conexión antes de publicar.');}
  const publicImage = imagePublisher(userId, projectId);
  const offers = draft.offers ? await Promise.all(draft.offers.map(async offer => ({ ...offer, image: await publicImage(offer.image) }))) : undefined;
  const snapshot = parseSiteData({ ...draft, offers,
    heroImage: await publicImage(draft.heroImage ?? ''),
    gallery: draft.gallery ? await Promise.all(draft.gallery.map(async image => ({ ...image, url: await publicImage(image.url) }))) : undefined,
  });
  if (!snapshot) throw new Error('Revisa los datos públicos de tu página antes de publicar.');
  if (new TextEncoder().encode(JSON.stringify(snapshot)).length > 60000) throw new Error('La página es demasiado grande. Reduce textos o cantidad de ofertas.');
  return snapshot;
}
