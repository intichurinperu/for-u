import { useEffect } from 'react';
import { Navigate, Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useActiveProjectsStore } from '../../stores/useActiveProjectsStore';
import Toolkit from '../../toolkit/Toolkit';
import type { ToolId } from '../../toolkit/types';
import { projectStartPath } from '../../workspace/navigation';

const tools = new Set<ToolId>(['profile', 'proposal', 'content', 'teleprompter', 'video', 'images', 'calendar', 'analytics', 'assistant', 'landing', 'bookings', 'automation']);

export default function DashboardTool() {
  const { user } = useAuth();
  const { tool = '' } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const hydrate = useActiveProjectsStore(state => state.hydrateFromSupabase);
  const projectId = params.get('project');
  const project = useActiveProjectsStore(state => projectId ? state.projectsById[projectId] : state.projectsById[state.activeProjectId ?? ''] ?? state.getActiveProjects()[0]);
  const cloudUserId = useActiveProjectsStore(state => state.cloudUserId);
  useEffect(() => { if (user?.id && cloudUserId !== user.id) void hydrate(user.id); }, [cloudUserId, hydrate, user?.id]);
  if (!user || cloudUserId !== user.id) return <main className="dashboard-tool-loader"><p>Cargando tus herramientas…</p></main>;
  if (!project || !tools.has(tool as ToolId)) return <main className="dashboard-tool-loader"><h1>Esta herramienta no está disponible</h1><Link to="/dashboard">Volver al tablero</Link></main>;
  if(tool==='calendar')return <Navigate replace to={`/dashboard?project=${encodeURIComponent(project.id)}&view=calendar`}/>;
  if(tool==='profile'){const query=new URLSearchParams({project:project.id,tab:'profile'});const piece=params.get('piece');if(piece)query.set('piece',piece);return <Navigate replace to={'/creator-studio?'+query.toString()}/>;}
  const templates = params.get('page') === 'templates';
  const taskId = params.get('task');
  return <Toolkit embedded key={`${project.id}:${tool}:${templates}:${params.get("section") ?? ""}:${params.get("step") ?? ""}:${tool === "profile" ? "" : params.get("piece") ?? ""}`} project={project} initialTool={templates ? undefined : tool as ToolId} initialPage={templates ? 'templates' : undefined} onBack={() => taskId ? navigate(projectStartPath(project.id,taskId)) : navigate(-1)} />;
}
