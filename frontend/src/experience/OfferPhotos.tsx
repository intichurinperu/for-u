import { useEffect, useRef, useState } from 'react';
import PearlButton from '../components/ui/PearlButton';
import { randomId } from '../lib/randomId';
import { supabase } from '../lib/supabaseClient';
import type { Material } from './journeyModel';

const types: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };

export default function OfferPhotos({ user, project, options, files, disabled, onChange, onPending }: {
  user: string;
  project: string;
  options: string[];
  files: Material[];
  disabled: boolean;
  onChange: (files: Material[]) => void;
  onPending: (value: boolean) => void;
}) {
  const uploadLock = useRef(false);
  const latest = useRef({ files, onChange });
  const [uploading, setUploading] = useState('');
  const [error, setError] = useState('');
  useEffect(() => { latest.current = { files, onChange }; }, [files, onChange]);

  async function attach(option: string, picked: File[]) {
    if (!picked.length || disabled || uploadLock.current) return;
    if (!supabase) { setError('No se pudieron adjuntar las fotos. Vuelve a intentarlo.'); return; }
    if (picked.length + files.length > 20) { setError('El proyecto admite hasta 20 archivos en este recorrido.'); return; }
    if (picked.some(file => !types[file.type] || file.size > 20 * 1024 * 1024)) {
      setError('Elige fotos JPG, PNG o WebP de hasta 20 MB cada una.');
      return;
    }
    uploadLock.current = true;
    setUploading(option);
    onPending(true);
    setError('');
    const uploaded: Material[] = [];
    try {
      for (const file of picked) {
        const path = `${user}/${project}/${randomId()}.${types[file.type]}`;
        const { error } = await supabase.storage.from('user-uploads').upload(path, file, { contentType: file.type, upsert: false });
        if (error) throw error;
        uploaded.push({ path, name: file.name.slice(0, 200), offerOption: option });
      }
    } catch {
      setError(uploaded.length ? 'Guardamos parte de las fotos. Vuelve a adjuntar las que faltan.' : 'No se adjuntaron las fotos. Vuelve a intentarlo.');
    } finally {
      if (uploaded.length) latest.current.onChange([...latest.current.files, ...uploaded]);
      uploadLock.current = false;
      setUploading('');
      onPending(false);
    }
  }

  const selected = options.filter(option => option !== 'Lo definiré después');
  if (!selected.length) return null;
  return <div className="offer-photo-groups">
    {selected.map(option => {
      const attachments = files.filter(file => file.offerOption === option);
      return <section className="offer-photo-group" key={option} aria-label={`Fotos de ${option}`}>
        <strong>{option}</strong>
        <label className="offer-photo-drop" onDragOver={event => event.preventDefault()} onDrop={event => {
          event.preventDefault();
          void attach(option, Array.from(event.dataTransfer.files));
        }}>
          <span aria-hidden="true">＋</span>
          <span>{uploading === option ? 'Adjuntando fotos…' : 'Añade o arrastra fotos'}</span>
          <input type="file" multiple accept="image/jpeg,image/png,image/webp" aria-label={`Añadir fotos de ${option}`}
            disabled={disabled || !!uploading || files.length >= 20} onChange={event => {
              const picked = Array.from(event.currentTarget.files || []);
              event.currentTarget.value = '';
              void attach(option, picked);
            }} />
        </label>
        {attachments.map(file => <div className="offer-photo-file" key={file.path}>
          <span>{file.name}</span>
          <PearlButton compact subtle aria-label={`Quitar ${file.name}`} disabled={disabled || !!uploading}
            onClick={() => onChange(files.filter(item => item.path !== file.path))}>Quitar</PearlButton>
        </div>)}
      </section>;
    })}
    {error && <p role="alert">{error}</p>}
  </div>;
}
