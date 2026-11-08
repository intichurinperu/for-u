import type { ReactNode } from 'react';
import type { Question } from './personalizationModel';
import ProjectQuestionStep, { type ProjectQuestionStepProps } from './ProjectQuestionStep';
import ProjectMultipleChoiceStep from './ProjectMultipleChoiceStep';
import './projectOriginStep.css';

type Props = Omit<ProjectQuestionStepProps, 'presentation' | 'value' | 'onChange'> & {
  question: Question;
  group: string;
  values: string[];
  customText: string;
  commercial: boolean;
  onSelect: (value: string) => void;
  onCustom: (value: string) => void;
  extra?: ReactNode;
};

export default function StandardJourneyQuestion({ question, group, values, customText, commercial, onSelect, onCustom, extra, ...shell }: Props) {
  const offering = question.key === 'offering';
  const presentation = {
    key: question.key, label: group, title: question.title,
    intro: offering ? 'Elige lo que ofreces. Si ya tienes fotos, puedes añadirlas aquí.' : question.why,
    fieldLabel: offering ? 'Tu oferta' : question.text || 'Tu respuesta',
    placeholder: '', hint: '', choices: [],
    customLabel: offering ? 'Describe lo que ofreces' : 'Con tus palabras',
  };
  if (question.options) return <ProjectMultipleChoiceStep {...shell} presentation={presentation}
    options={question.options} values={commercial ? values.filter(value => question.options!.includes(value)) : values}
    customText={customText} openTextInitially={commercial ? values.some(value => !question.options!.includes(value)) : !!customText}
    allowText={!!question.custom} multi={!!question.multi} maxSelections={question.maxSelections}
    onSelect={onSelect} onCustom={onCustom} extra={extra} />;
  const fieldId = `project-${question.key}-answer`;
  return <ProjectQuestionStep {...shell} presentation={presentation} value="" onChange={() => {}}
    answerContent={extra || <div className="project-origin-story">
      <label htmlFor={fieldId}>{presentation.fieldLabel}</label>
      <textarea id={fieldId} maxLength={2000} value={customText} disabled={shell.busy} onChange={event => onCustom(event.target.value)} />
    </div>} />;
}
