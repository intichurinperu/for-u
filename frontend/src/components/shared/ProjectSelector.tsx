import { moduleLabels, type ModuleProject } from '../../modules/moduleProjects';

export default function ProjectSelector({ projects, value, onChange, disabled = false }: {
  projects: ModuleProject[]; value: string; onChange: (id: string) => void; disabled?: boolean;
}) {
  return <label>Proyecto<select value={value} disabled={disabled} onChange={event => onChange(event.target.value)}>
    {projects.map(project => <option key={project.id} value={project.id}>{project.name} · {moduleLabels[project.type]}</option>)}
  </select></label>;
}
