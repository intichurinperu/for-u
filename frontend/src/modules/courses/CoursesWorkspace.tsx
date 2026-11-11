import ModuleWorkspace, { type ModuleConfiguration } from '../ModuleWorkspace';
import CoursesDashboard from './CoursesDashboard';
import CoursesEditor from './CoursesEditor';
import { emptyCourses, type CoursesData } from './model';
const config: ModuleConfiguration<CoursesData> = {
  type: 'courses', create: emptyCourses, Dashboard: CoursesDashboard, Editor: CoursesEditor,
  dashboardLabel: 'Alumnos y ventas', editorLabel: 'Editor de cursos',
  parse(value) {
    const data = value as CoursesData;
    if (!data || data.version !== 1 || !Array.isArray(data.courses) || !Array.isArray(data.enrollments) || !Array.isArray(data.sales) || !Array.isArray(data.certificates) || !data.settings) throw new Error('El documento tiene un formato incompatible. No se ha sobrescrito.');
    return data;
  },
};
export default function CoursesWorkspace() { return <ModuleWorkspace config={config} />; }
