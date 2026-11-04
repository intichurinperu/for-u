import { Sparkles, X } from 'lucide-react';
import { VIDEO_TEMPLATES, type VideoTemplateId } from './videoTemplates';
import './videoTemplateModal.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (templateId: VideoTemplateId) => void;
  title?: string;
  sourceText?: string;
}

export default function VideoTemplateSelector({
  isOpen,
  onClose,
  onSelect,
  title = 'Elige tu plantilla de video',
  sourceText,
}: Props) {
  if (!isOpen) return null;

  return (
    <div className="foru-template-backdrop" role="dialog" aria-modal="true" aria-labelledby="template-modal-title">
      <div className="foru-template-modal">
        <header className="foru-template-header">
          <div>
            <span className="foru-template-kicker">
              <Sparkles size={14} aria-hidden="true" /> Emprende como jugando
            </span>
            <h2 id="template-modal-title">{title}</h2>
            {sourceText && (
              <p className="foru-template-hint">
                Usaremos tu información para armar el video automáticamente:
                <em> "{sourceText.slice(0, 60)}{sourceText.length > 60 ? '…' : ''}"</em>
              </p>
            )}
          </div>
          <button type="button" className="foru-template-close" aria-label="Cerrar selector" onClick={onClose}>
            <X size={18} aria-hidden="true" />
          </button>
        </header>

        <div className="foru-template-grid">
          {(Object.values(VIDEO_TEMPLATES)).map((tpl) => (
            <button
              key={tpl.id}
              type="button"
              className="foru-template-card"
              onClick={() => onSelect(tpl.id)}
            >
              <div className="foru-template-card-icon" aria-hidden="true">{tpl.icon}</div>
              <span className="foru-template-card-intent">{tpl.intent}</span>
              <h3>{tpl.name}</h3>
              <p>{tpl.tagline}</p>
              <div className="foru-template-card-footer">
                <small>~{tpl.recommendedDuration}s</small>
                <span>Usar plantilla →</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
