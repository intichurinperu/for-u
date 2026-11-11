import {isPrivateMedia,mediaReference} from '../../components/shared/mediaReference';
export type Lesson = { id: string; title: string; type: 'text' | 'video' | 'file' | 'quiz'; content: string; durationMinutes: number; question: string; options: string[]; correctOption: number };
export type CourseModule = { id: string; title: string; lessons: Lesson[] };
export type Course = { id: string; name: string; description: string; price: number; cover: string; modules: CourseModule[] };
export type Enrollment = { id: string; courseId: string; name: string; email: string; completedLessonIds: string[]; enrolledAt: string };
export type CourseSale = { id: string; enrollmentId: string; amount: number; reference: string; date: string };
export type Certificate = { id: string; enrollmentId: string; studentName: string; courseName: string; lessonCount: number; issuedAt: string };
export type CoursesData = { version: 1; courses: Course[]; enrollments: Enrollment[]; sales: CourseSale[]; certificates: Certificate[]; settings: { name: string; tagline: string; coverImage: string; whatsapp: string } };
export function emptyCourses(name: string): CoursesData { return { version: 1, courses: [], enrollments: [], sales: [], certificates: [], settings: { name, tagline: '', coverImage: '', whatsapp: '' } }; }
export function saveCourse(data: CoursesData, course: Course): CoursesData {
  if (!course.name.trim() || !Number.isFinite(course.price) || course.price < 0) throw new Error('Completa el nombre y un precio válido.');
  const ids = new Set<string>();
  for (const module of course.modules) {
    if (!module.title.trim()) throw new Error('Todos los módulos necesitan un título.');
    for (const lesson of module.lessons) {
      if (ids.has(lesson.id)) throw new Error('Las lecciones deben tener identificadores únicos.'); ids.add(lesson.id);
      if (!lesson.title.trim() || !Number.isFinite(lesson.durationMinutes) || lesson.durationMinutes < 0) throw new Error('Completa el título y la duración de cada lección.');
      if (lesson.type === 'quiz' && (!lesson.question.trim() || lesson.options.length < 2 || lesson.options.some(option => !option.trim()) || !Number.isInteger(lesson.correctOption) || lesson.correctOption < 0 || lesson.correctOption >= lesson.options.length)) throw new Error('Completa la pregunta, al menos dos opciones y una respuesta correcta.');
      if (['video', 'file'].includes(lesson.type) && lesson.content && !/^https?:\/\//.test(lesson.content)&& !isPrivateMedia(lesson.content)) throw new Error('Sube el recurso a la biblioteca o usa un enlace https o http.');
      if(isPrivateMedia(lesson.content))mediaReference(lesson.content.slice('foru-media:'.length));
    }
  }
  const value = { ...course, name: course.name.trim(), price: Math.round(course.price * 100) / 100 };
  return { ...data, courses: data.courses.some(item => item.id === value.id) ? data.courses.map(item => item.id === value.id ? value : item) : [...data.courses, value] };
}
export function enrollStudent(data: CoursesData, student: Omit<Enrollment, 'completedLessonIds' | 'enrolledAt'>): CoursesData {
  if (!data.courses.some(course => course.id === student.courseId)) throw new Error('Selecciona un curso existente.');
  if (!student.name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(student.email.trim())) throw new Error('Completa el nombre y un correo válido.');
  if (data.enrollments.some(item => item.courseId === student.courseId && item.email.toLowerCase() === student.email.trim().toLowerCase())) throw new Error('Este alumno ya está inscrito en el curso.');
  return { ...data, enrollments: [...data.enrollments, { ...student, email: student.email.trim().toLowerCase(), completedLessonIds: [], enrolledAt: new Date().toISOString() }] };
}
export function enrollmentProgress(data: CoursesData, enrollmentId: string) {
  const enrollment = data.enrollments.find(item => item.id === enrollmentId);
  const lessons = data.courses.find(course => course.id === enrollment?.courseId)?.modules.flatMap(module => module.lessons) ?? [];
  const completed = lessons.filter(lesson => enrollment?.completedLessonIds.includes(lesson.id)).length;
  return { completed, total: lessons.length, percent: lessons.length ? Math.round(completed * 100 / lessons.length) : 0 };
}
export function completeLesson(data: CoursesData, enrollmentId: string, lessonId: string, answer?: number): CoursesData {
  const enrollment = data.enrollments.find(item => item.id === enrollmentId);
  const lesson = data.courses.find(course => course.id === enrollment?.courseId)?.modules.flatMap(module => module.lessons).find(item => item.id === lessonId);
  if (!enrollment || !lesson) throw new Error('No se encontró esta lección para el alumno.');
  if (lesson.type === 'quiz' && answer !== lesson.correctOption) throw new Error('La respuesta no es correcta. Revisa la lección y vuelve a intentar.');
  if (lesson.type !== 'quiz' && !lesson.content.trim()) throw new Error('La lección aún no tiene contenido.');
  return { ...data, enrollments: data.enrollments.map(item => item.id === enrollmentId ? { ...item, completedLessonIds: [...new Set([...item.completedLessonIds, lessonId])] } : item) };
}
export function issueCertificate(data: CoursesData, enrollmentId: string, id: string): CoursesData {
  const progress = enrollmentProgress(data, enrollmentId);
  if (!progress.total || progress.completed !== progress.total) throw new Error('Completa todas las lecciones antes de emitir el certificado.');
  if (data.certificates.some(item => item.enrollmentId === enrollmentId)) return data;
  const enrollment = data.enrollments.find(item => item.id === enrollmentId)!;
  const course = data.courses.find(item => item.id === enrollment.courseId)!;
  return { ...data, certificates: [...data.certificates, { id, enrollmentId, studentName: enrollment.name, courseName: course.name, lessonCount: progress.total, issuedAt: new Date().toISOString() }] };
}
export function recordCoursePayment(data: CoursesData, sale: CourseSale): CoursesData {
  if (data.sales.some(item => item.id === sale.id)) return data;
  if (!data.enrollments.some(item => item.id === sale.enrollmentId) || !Number.isFinite(sale.amount) || sale.amount <= 0 || !sale.reference.trim() || !Number.isFinite(Date.parse(sale.date))) throw new Error('Selecciona un alumno, monto válido y referencia del pago recibido.');
  if (data.sales.some(item => item.reference === sale.reference.trim())) throw new Error('Esta referencia de pago ya se registró.');
  return { ...data, sales: [...data.sales, { ...sale, amount: Math.round(sale.amount * 100) / 100, reference: sale.reference.trim() }] };
}
export function certificateSvg(certificate: Certificate, issuer: string) {
  const escape = (value: string) => value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[char]!);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1120" height="792" viewBox="0 0 1120 792"><rect width="1120" height="792" fill="white"/><rect x="28" y="28" width="1064" height="736" rx="12" fill="none" stroke="#059669" stroke-width="3"/><g text-anchor="middle" font-family="Georgia, serif" fill="#0f172a"><text x="560" y="150" font-size="24">${escape(issuer)}</text><text x="560" y="240" font-size="42">Certificado de finalización</text><text x="560" y="335" font-size="30">${escape(certificate.studentName)}</text><text x="560" y="395" font-size="20">ha completado ${certificate.lessonCount} lecciones de</text><text x="560" y="465" font-size="28">${escape(certificate.courseName)}</text><text x="560" y="590" font-size="18">Emitido: ${escape(certificate.issuedAt.slice(0, 10))}</text><text x="560" y="650" font-size="12">Código: ${escape(certificate.id)}</text></g></svg>`;
}
