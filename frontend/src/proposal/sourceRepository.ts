import type { SupabaseClient } from '@supabase/supabase-js';
import type { ModuleType } from '../modules/moduleProjects';
import { parseProposal, proposalOffers, type ProposalSource } from './model';

export async function readProposalSource(db: SupabaseClient, userId: string, projectId: string, type: ModuleType | undefined) {
  const { data, error } = await db.from('toolkit_documents').select('kind,payload,updated_at')
    .eq('user_id', userId).eq('project_id', projectId).in('kind', type?['module-proposal', 'module-' + type]:['module-proposal']);
  if (error) throw new Error('No pudimos comprobar las ofertas guardadas. Tu publicación anterior no cambió.');
  const proposal = data?.find(row => row.kind === 'module-proposal');
  const catalog = data?.find(row => row.kind === 'module-' + type);
  if (!proposal) throw new Error('Guarda tu propuesta antes de publicar esta página.');
  return {
    offers: proposalOffers(parseProposal(proposal.payload), type, catalog?.payload),
    source: { proposalRevision: proposal.updated_at, catalogRevision: catalog?.updated_at ?? null } as ProposalSource,
  };
}
