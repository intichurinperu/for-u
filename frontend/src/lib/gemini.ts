// Kept as a compatibility entry point for the existing chat. Provider keys stay server-side.
import { askAI } from '../toolkit/api';
import { isSupabaseConfigured } from './supabaseClient';
import { useActiveProjectsStore } from '../stores/useActiveProjectsStore';
import { businessFromProject } from '../toolkit/types';
export type ForUChatRole = 'user' | 'model';
export type ForUChatMessage = { role: ForUChatRole; text: string };
export const isGeminiConfigured = isSupabaseConfigured;
export async function sendForUChatMessage(messages: ForUChatMessage[]) {
  const state = useActiveProjectsStore.getState();
  const project = state.activeProjectId ? state.getProjectById(state.activeProjectId) : null;
  const business = project ? businessFromProject(project) : { name: 'Mi negocio', industry: 'servicios', objective: 'Definir mi siguiente paso', audience: 'mi comunidad', offer: 'mi servicio', location: '' };
  const last = [...messages].reverse().find(message => message.role === 'user')?.text ?? '';
  try { return await askAI('chat', last, business, { projectId:project?.id, history: messages.slice(-8), context: { nextAction: project ? state.getNextAction(project.id)?.title : null } }); }
  catch (error) { return `${error instanceof Error ? error.message : 'No se pudo conectar con la IA.'}\n\nMientras tanto, elige una sola tarea y escribe su primer paso. Esta orientación es local.`; }
}
