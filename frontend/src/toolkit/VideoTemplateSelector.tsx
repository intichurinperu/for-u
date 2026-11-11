import { Check } from 'lucide-react';
import { useState } from 'react';
import PearlButton from '../components/ui/PearlButton';
import EditorSheet from './EditorSheet';
import { VIDEO_TEMPLATES, type VideoTemplateId } from './videoTemplates';
import './videoTemplateModal.css';

interface Props {
  onClose: () => void;
  onSelect: (templateId: VideoTemplateId) => void;
  sourceText?: string;
  busy: boolean;
  error: string;
}

const choices: { id: VideoTemplateId; label: string }[] = [
  { id: 'product', label: 'Producto estrella' },
  { id: 'story', label: 'Historia y conexión' },
  { id: 'flash', label: 'Oferta flash' },
  { id: 'review', label: 'Testimonio' },
];

export default function VideoTemplateSelector({ onClose, onSelect, sourceText, busy, error }: Props) {
  const [selected, setSelected] = useState<VideoTemplateId | null>(null);
  return (
    <EditorSheet open title="Elige tu plantilla de video" closeLabel="Atrás" closeDisabled={busy}
      className="foru-video-template-sheet" onClose={() => { if (!busy) onClose(); }}>
      {sourceText && <p className="foru-template-idea">{sourceText}</p>}
      <fieldset className="foru-template-grid" disabled={busy}>
        <legend className="sr-only">Plantillas de video</legend>
        {choices.map(({ id, label }) => {
          const template = VIDEO_TEMPLATES[id];
          return (
            <label key={id} className="foru-template-card">
              <input type="radio" name="video-template" value={id} checked={selected === id}
                onChange={() => setSelected(id)} />
              <span className={`foru-template-preview foru-template-preview-${id}`} aria-hidden="true">
                <span>~{template.recommendedDuration} s</span>
              </span>
              <span className="foru-template-name">{label}<small>{template.tagline}</small></span>
              <span className="foru-template-check" aria-hidden="true">{selected === id && <Check size={16}/>}</span>
            </label>
          );
        })}
      </fieldset>
      <footer className="foru-template-actions">
        {error && <p role="alert">{error}</p>}
        <PearlButton compact disabled={!selected || busy} onClick={() => { if (selected) onSelect(selected); }}>
          {busy ? 'Preparando tu video…' : 'Usar esta plantilla'}
        </PearlButton>
      </footer>
    </EditorSheet>
  );
}
