import { cloneElement, forwardRef, isValidElement, useEffect, useId, useState, type ButtonHTMLAttributes, type HTMLAttributes, type InputHTMLAttributes, type ReactElement, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { createPortal } from 'react-dom';
import './designSystem.css';

type TipState = { left: number; top: number; below: boolean } | null;
function useTip(text?: string) {
  const id = useId();
  const [position, setPosition] = useState<TipState>(null);
  const show = (element: HTMLElement) => {
    if (!text) return;
    const rect = element.getBoundingClientRect();
    setPosition({ left: Math.max(148, Math.min(window.innerWidth - 148, rect.left + rect.width / 2)), top: rect.top > 110 ? rect.top - 10 : rect.bottom + 10, below: rect.top <= 110 });
  };
  const hide = () => setPosition(null);
  useEffect(() => {
    if (!position) return;
    const key = (event: KeyboardEvent) => { if (event.key === 'Escape') hide(); };
    window.addEventListener('keydown', key);
    window.addEventListener('scroll', hide, true);
    window.addEventListener('resize', hide);
    return () => { window.removeEventListener('keydown', key); window.removeEventListener('scroll', hide, true); window.removeEventListener('resize', hide); };
  }, [position]);
  return { id, show, hide, open: Boolean(position), bubble: position && typeof document !== 'undefined' ? createPortal(<span id={id} role="tooltip" className="ds-tooltip" style={{ left: position.left, top: position.top, transform: `translate(-50%, ${position.below ? '0' : '-100%'})` }}>{text}</span>, document.body) : null };
}
type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { tooltip?: string };
function makeButton(variant: string) {
  return forwardRef<HTMLButtonElement, ButtonProps>(function DesignButton({ children, tooltip, className = '', onFocus, onBlur, onMouseEnter, onMouseLeave, ...props }, ref) {
    const tip = useTip(tooltip || props.title);
    return <><button {...props} ref={ref} className={`ds-button ds-button-${variant} ${className}`} aria-describedby={[props['aria-describedby'], tip.open ? tip.id : undefined].filter(Boolean).join(' ') || undefined} onFocus={event => { onFocus?.(event); tip.show(event.currentTarget); }} onBlur={event => { onBlur?.(event); tip.hide(); }} onMouseEnter={event => { onMouseEnter?.(event); tip.show(event.currentTarget); }} onMouseLeave={event => { onMouseLeave?.(event); tip.hide(); }}>{children}</button>{tip.bubble}</>;
  });
}
export const ButtonPrimary = makeButton('primary');
export const ButtonSecondary = makeButton('secondary');
export const ButtonGhost = makeButton('ghost');
export function Tooltip({ text, children }: { text: string; children: ReactElement<HTMLAttributes<HTMLElement>> }) {
  const tip = useTip(text);
  return <>{cloneElement(children, { 'aria-describedby': [children.props['aria-describedby'], tip.open ? tip.id : undefined].filter(Boolean).join(' ') || undefined, onMouseEnter: event => { children.props.onMouseEnter?.(event); tip.show(event.currentTarget); }, onMouseLeave: event => { children.props.onMouseLeave?.(event); tip.hide(); }, onFocus: event => { children.props.onFocus?.(event); tip.show(event.currentTarget); }, onBlur: event => { children.props.onBlur?.(event); tip.hide(); } })}{tip.bubble}</>;
}
export function ButtonWithTooltip({ text, ...props }: ButtonProps & { text: string }) { return <ButtonSecondary {...props} tooltip={text} />; }
export function InfoIcon({ text, label = 'Más información' }: { text: string; label?: string }) {
  const tip = useTip(text);
  return <><button type="button" className="ds-info" aria-label={label} aria-expanded={tip.open} aria-describedby={tip.open ? tip.id : undefined} onMouseEnter={event => tip.show(event.currentTarget)} onMouseLeave={tip.hide} onFocus={event => tip.show(event.currentTarget)} onBlur={tip.hide} onClick={event => { event.preventDefault(); event.stopPropagation(); tip.show(event.currentTarget); }}>ⓘ</button>{tip.bubble}</>;
}
export function Card({ as: Tag = 'div', className = '', ...props }: HTMLAttributes<HTMLElement> & { as?: 'div' | 'section' | 'article' | 'aside' }) { return <Tag {...props} className={`ds-card ${className}`} />; }
export function StepIndicator({ currentStep, totalSteps, labels = [], onStepChange }: { currentStep: number; totalSteps: number; labels?: string[]; onStepChange?: (step: number) => void }) {
  return <ol className="ds-steps" aria-label={`Paso ${currentStep} de ${totalSteps}`}>{Array.from({ length: totalSteps }, (_, index) => { const step = index + 1; const content = <><span className="ds-step-number" aria-hidden="true">{step < currentStep ? '✓' : step}</span><span>{labels[index] || `Paso ${step}`}</span></>; return <li key={step} aria-current={step === currentStep ? 'step' : undefined} data-past={step < currentStep}>{onStepChange ? <ButtonGhost type="button" tooltip={`Ir a ${labels[index] || `paso ${step}`}`} onClick={() => onStepChange(step)}>{content}</ButtonGhost> : content}</li>; })}</ol>;
}
type FieldExtras = { label?: string; info?: string };
export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & FieldExtras>(function DesignInput({ label, info, id, className = '', ...props }, ref) {
  const autoId = useId(); const fieldId = id || (label ? autoId : undefined);
  const field = <input {...props} id={fieldId} ref={ref} className={`ds-input ${className}`} />;
  return label ? <div className="ds-field"><div className="ds-label"><label htmlFor={fieldId}>{label}</label>{info && <InfoIcon text={info} label={`Ayuda: ${label}`} />}</div>{field}</div> : field;
});
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement> & FieldExtras>(function DesignTextarea({ label, info, id, className = '', ...props }, ref) {
  const autoId = useId(); const fieldId = id || (label ? autoId : undefined);
  const field = <textarea {...props} id={fieldId} ref={ref} className={`ds-textarea ${className}`} />;
  return label ? <div className="ds-field"><div className="ds-label"><label htmlFor={fieldId}>{label}</label>{info && <InfoIcon text={info} label={`Ayuda: ${label}`} />}</div>{field}</div> : field;
});

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement> & FieldExtras>(function DesignSelect({ label, info, id, className = '', ...props }, ref) {
  const autoId = useId(); const fieldId = id || (label ? autoId : undefined);
  const field = <select {...props} id={fieldId} ref={ref} className={`ds-select ${className}`} />;
  return label ? <div className="ds-field"><div className="ds-label"><label htmlFor={fieldId}>{label}</label>{info && <InfoIcon text={info} label={`Ayuda: ${label}`} />}</div>{field}</div> : field;
});
