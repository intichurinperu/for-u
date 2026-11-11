import { isSupabaseConfigured, supabase } from './supabaseClient';

export type AgentMessage = {
  stepId: string;
  question: string;
  answer: string;
  timestamp: string;
};

export type AgentConversationInput = {
  projectId: string;
  agentArea: 'marketing' | 'finanzas' | 'logistica' | 'operaciones';
  messages: AgentMessage[];
  completed: boolean;
};

const localStorageKey = 'foru:agent-conversations';

export async function saveAgentConversation(input: AgentConversationInput) {
  const payload = {
    project_id: input.projectId,
    agent_area: input.agentArea,
    messages: input.messages,
    completed: input.completed,
    updated_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('project_configs').upsert({ 
        project_id: input.projectId, 
        config: { [input.agentArea]: input.messages } 
      }, { onConflict: 'project_id' });
      return { savedRemote: true };
    } catch (error) {
      console.warn('Fallback a local por error en Supabase:', error);
    }
  }

  try {
    const localConversations = JSON.parse(localStorage.getItem(localStorageKey) ?? '{}');
    localConversations[input.projectId] = localConversations[input.projectId] || {};
    localConversations[input.projectId][input.agentArea] = payload;
    localStorage.setItem(localStorageKey, JSON.stringify(localConversations));
    return { savedRemote: false, reason: 'local_fallback' };
  } catch (err) {
    console.error('Error guardando en localStorage:', err);
    return { savedRemote: false, reason: 'local_storage_failed' };
  }
}
