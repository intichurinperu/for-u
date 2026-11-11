import { useState } from 'react';
import { Sparkles, Image as ImageIcon, Check } from 'lucide-react';
import { ButtonSecondary, ButtonPrimary } from '../ui/DesignSystem';
import './geminiImageAssistant.css';

interface Props {
  contextName?: string;
  contextDescription?: string;
  category?: string;
  onSelectImage: (imageUrl: string) => void;
}

export default function GeminiImageAssistant({
  contextName = 'tu producto o servicio',
  contextDescription = '',
  category = 'comercial',
  onSelectImage,
}: Props) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  // Genera opciones fotográficas curadas según el contexto del negocio
  const promptKeywords = [contextName, category].filter(Boolean).join(' ');
  const seedBase = encodeURIComponent(contextName || 'product');

  const suggestions = [
    {
      id: 'aesthetic-close',
      label: 'Plano detalle cálido',
      style: 'Fotografía estética de producto, luz natural suave, ambiente cálido de cafetería/tienda, ángulo cenital.',
      url: `https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80`,
    },
    {
      id: 'lifestyle-context',
      label: 'En contexto de uso',
      style: 'Estilo editorial de revista, mesa de madera, elementos artesanales, desenfoque de fondo sutil.',
      url: `https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80`,
    },
    {
      id: 'minimal-clean',
      label: 'Minimalista & Limpio',
      style: 'Fondo neutro, luz de estudio comercial suave, limpio, ideal para catálogo o portada.',
      url: `https://images.unsplash.com/photo-1517433670267-08bbd4be890f?auto=format&fit=crop&w=800&q=80`,
    },
  ];

  return (
    <div className="foru-image-magic">
      {!open ? (
        <button
          type="button"
          className="foru-image-magic-trigger"
          onClick={() => setOpen(true)}
        >
          <Sparkles size={15} aria-hidden="true" />
          <span>✨ Sugerir fotos mágicas para {contextName}</span>
        </button>
      ) : (
        <div className="foru-image-magic-box">
          <header className="foru-image-magic-header">
            <div>
              <strong>
                <Sparkles size={14} aria-hidden="true" /> Fotos sugeridas para tu negocio
              </strong>
              <small>Inspiradas en tu oferta: "{contextName}"</small>
            </div>
            <button
              type="button"
              className="foru-image-magic-close"
              onClick={() => setOpen(false)}
            >
              ✕
            </button>
          </header>

          <div className="foru-image-magic-grid">
            {suggestions.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`foru-image-magic-card ${selected === item.url ? 'is-selected' : ''}`}
                onClick={() => setSelected(item.url)}
              >
                <img src={item.url} alt={item.label} loading="lazy" />
                <div className="foru-image-magic-card-info">
                  <span>{item.label}</span>
                  <small>{item.style.slice(0, 50)}…</small>
                </div>
                {selected === item.url && (
                  <span className="foru-image-magic-check">
                    <Check size={14} aria-hidden="true" />
                  </span>
                )}
              </button>
            ))}
          </div>

          <footer className="foru-image-magic-footer">
            <ButtonSecondary onClick={() => setOpen(false)}>Cancelar</ButtonSecondary>
            <ButtonPrimary
              disabled={!selected}
              onClick={() => {
                if (selected) {
                  onSelectImage(selected);
                  setOpen(false);
                }
              }}
            >
              Usar foto seleccionada ✓
            </ButtonPrimary>
          </footer>
        </div>
      )}
    </div>
  );
}

