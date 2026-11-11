import { getBusinessTemplate } from "../data/templates.ts";
import type { ForUActiveProject } from "../stores/useActiveProjectsStore";
export type TodayProgress = {
  completed: string[];
  pending?: string[];
  notes?: Record<string, string>;
  micro?: string[];
};
export function todayRoute(
  project: Pick<ForUActiveProject, "industryKey" | "nodes">,
  progress: TodayProgress,
) {
  const template =
    getBusinessTemplate(project.industryKey) ??
    getBusinessTemplate("services")!;
  const completed = new Set(progress.completed);
  const pending = new Set(progress.pending ?? []);
  const steps = template.steps.map((step, index) => {
    const phaseDone = project.nodes.some(
      (node) =>
        node.id.endsWith("-" + step.id) &&
        (node.completedAt || node.taskStatus === "done"),
    );
    const tasks = step.tasks.map((title, taskIndex) => {
      const id = template.key + "/" + step.id + "/" + taskIndex;
      const node = project.nodes.find(
        (n) => n.title.trim().toLowerCase() === title.trim().toLowerCase(),
      );
      return {
        id,
        title,
        minutes: 15,
        done: !pending.has(id) && (
          completed.has(id) ||
          phaseDone ||
          Boolean(node?.completedAt || node?.taskStatus === "done")),
        nodeId: node?.id,
      };
    });
    return { ...step, index, tasks, done: tasks.every((task) => task.done) };
  });
  const current = steps.find((step) => !step.done) ?? steps[steps.length - 1];
  const task = current.tasks.find((task) => !task.done) ?? current.tasks[0];
  const done = steps
    .flatMap((step) => step.tasks)
    .filter((task) => task.done).length;
  return {
    steps,
    current,
    task,
    percentage: Math.round((done / 15) * 100),
    finished: done === 15,
  };
}
