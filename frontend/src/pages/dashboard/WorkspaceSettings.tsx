import AccountPreferences from '../../workspace/AccountPreferences';
import {useState} from 'react';
import EmotionalCompass,{CompassBadge} from './EmotionalCompass';
import {ButtonSecondary} from '../../components/ui/DesignSystem';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useActiveProjectsStore } from '../../stores/useActiveProjectsStore';
import { projectModuleType } from '../../modules/moduleProjects';
import { ToolkitProvider } from '../../toolkit/ToolkitContext';
import { businessFromProject } from '../../toolkit/types';
import ConnectionStatus from '../../toolkit/ConnectionStatus';
import PaymentSettings from '../../payments/PaymentSettings';
import '../../toolkit/toolkit.css';
export default function WorkspaceSettings() {
  const [compass,setCompass]=useState(false);
  const { user } = useAuth();
  const store = useActiveProjectsStore();
  const [params] = useSearchParams();
  const project = store.projectsById[params.get('project') ?? store.activeProjectId ?? ''];
  if (!user || !project || store.cloudUserId !== user.id) return <p>Elige un proyecto desde el tablero.</p>;
  return <section className="workspace-settings"><AccountPreferences/><h1>Configuración</h1><p>Gestiona los datos de tu negocio y sus conexiones.</p><Link to={`/modules/${projectModuleType(project)}/editor?project=${project.id}`}>Editar datos del negocio →</Link><section className="magic-card"><h2>Mi brújula</h2><CompassBadge projectId={project.id}/><p>Tu propósito y la emoción que eliges. Puedes cambiarlos a tu ritmo.</p><ButtonSecondary onClick={()=>setCompass(true)}>Editar mi propósito y emoción</ButtonSecondary>{compass&&<EmotionalCompass key={project.id} projectId={project.id} edit onDone={()=>setCompass(false)}/>}</section><PaymentSettings project={project.id}/><ToolkitProvider key={`${user.id}:${project.id}`} userId={user.id} projectId={project.id} business={businessFromProject(project)}><ConnectionStatus /></ToolkitProvider></section>;
}
