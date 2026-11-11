import { useEffect, useRef, useState, type ReactNode } from 'react';
import PearlButton from '../components/ui/PearlButton';
import ProjectQuestionStep, { type ProjectQuestionStepProps } from './ProjectQuestionStep';
import './projectOriginStep.css';

type Presentation = {
  key: string;
  label: string;
  title: string;
  intro: string;
  fieldLabel: string;
  placeholder: string;
  customLabel: string;
};

export type ProjectMultipleChoiceStepProps = Omit<ProjectQuestionStepProps, 'presentation' | 'value' | 'onChange'> & {
  presentation: Presentation;
  values: readonly string[];
  options: readonly string[];
  customText: string;
  openTextInitially?: boolean;
  allowText?: boolean;
  multi?: boolean;
  maxSelections?: number;
  extra?: ReactNode;
  onSelect: (value: string) => void;
  onCustom: (value: string) => void;
};

export default function ProjectMultipleChoiceStep({ presentation, values, options, customText, openTextInitially = Boolean(customText), allowText = true, multi = true, maxSelections, extra, onSelect, onCustom, audioResponse, ...props }: ProjectMultipleChoiceStepProps) {
  const [customOpen, setCustomOpen] = useState(openTextInitially);
  const storyField = useRef<HTMLTextAreaElement>(null);
  const focusStory = useRef(false);
  useEffect(() => {
    if (customOpen && focusStory.current) {
      storyField.current?.focus();
      focusStory.current = false;
    }
  }, [customOpen]);
  const storyId = `project-${presentation.key}-story`;
  // Keep legacy answers visible and removable rather than silently replacing them.
  const choices = [...new Set([...options, ...values])];
  return <ProjectQuestionStep {...props} value="" onChange={() => {}} saveHint={props.saveHint === undefined ? 'Tus respuestas se guardan al continuar.' : props.saveHint} presentation={{
    ...presentation,
    placeholder: '',
    hint: '',
    choices: [],
  }} answerContent={<div className="project-origin-answer">
    <fieldset className="project-origin-choices" disabled={props.busy} aria-describedby={`project-${presentation.key}-hint`}>
      <legend>{presentation.fieldLabel} · {presentation.label}</legend>
      <p id={`project-${presentation.key}-hint`}>{multi ? (maxSelections ? `Elige hasta ${maxSelections} opciones.` : 'Puedes elegir varias opciones.') : 'Elige una opción.'}</p>
      <div className="project-origin-choice-grid">
        {choices.map(value => <label key={value} className={`project-origin-choice${values.includes(value) ? ' is-selected foru-pearl-button' : ''}`}>
          <input type={multi ? 'checkbox' : 'radio'} disabled={!!maxSelections && values.length >= maxSelections && !values.includes(value) && value !== 'Lo definiré después'} name={presentation.key} value={value} checked={values.includes(value)} onChange={() => onSelect(value)} />
          <span>{value}</span>
        </label>)}
      </div>
    </fieldset>
    {extra}
    {(allowText || audioResponse) && <div className="project-answer-actions">
      {allowText && <PearlButton compact subtle aria-expanded={customOpen} aria-controls={storyId} disabled={props.busy} onClick={() => {
        focusStory.current = !customOpen;
        setCustomOpen(!customOpen);
      }}>{customOpen ? 'Cerrar texto' : 'Escribir'}</PearlButton>}
      {audioResponse}
    </div>}
    {allowText && <div className="project-origin-story" id={storyId} hidden={!customOpen}>
      <label htmlFor={`${storyId}-field`}>{presentation.customLabel}</label>
      <textarea ref={storyField} id={`${storyId}-field`} name={`${presentation.key}Custom`} value={customText} maxLength={2000} disabled={props.busy} placeholder={presentation.placeholder} onChange={event => onCustom(event.target.value)} />
    </div>}
  </div>} />;
}
