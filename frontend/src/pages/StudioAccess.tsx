import { Input as DSInput, ButtonSecondary as DSButtonSecondary } from '../components/ui/DesignSystem';
import type { FormEvent } from 'react';
import { useState } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, Clapperboard, Sparkles } from '../lib/icons';
import { playUiTone } from '../lib/sound';

const accessStorageKey = 'foru:studio-access-granted';
const defaultPasswordHash = '5f1873fa04286dd1ce22cf0eedbc3467af3a84ac87f09a626b00a275ecda0ec2';

async function sha256(value: string) {
  const data = new TextEncoder().encode(value);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);

  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

export function hasStudioAccess() {
  return sessionStorage.getItem(accessStorageKey) === 'yes';
}

export default function StudioAccess() {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(hasStudioAccess());
  const [isChecking, setIsChecking] = useState(false);

  async function submitAccess(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsChecking(true);
    setError('');

    const configuredHash = import.meta.env.VITE_STUDIO_ACCESS_HASH || defaultPasswordHash;
    const typedHash = await sha256(password);

    if (typedHash === configuredHash) {
      sessionStorage.setItem(accessStorageKey, 'yes');
      playUiTone('next');
      setIsUnlocked(true);
      return;
    }

    playUiTone('tap');
    setError('Contraseña incorrecta. Este espacio todavía es privado.');
    setIsChecking(false);
  }

  const requestedNextPath = searchParams.get('next');
  const nextPath = requestedNextPath?.startsWith('/') ? requestedNextPath : '/dashboard';

  if (isUnlocked) return <Navigate to={nextPath} replace />;

  return (
    <main className="foru-reference-hub text-[#0A0A0A]">
      <div className="foru-reference-blur foru-reference-blur--gold" />
      <div className="foru-reference-blur foru-reference-blur--green" />
      <div className="foru-reference-blur foru-reference-blur--pink" />

      <section className="foru-private-access">
        <span className="foru-lp-badge"><Sparkles size={16} /> Muy pronto</span>
        <span className="foru-reference-card-icon mt-5"><Clapperboard size={32} /></span>
        <h1>Studio Digital <span className="foru-reference-gradient-text">FOR U</span></h1>
        <p>
          El espacio donde se organizaran contenidos, calendario, web, campanas y publicaciones.
          Por ahora esta en acceso privado mientras terminamos la experiencia completa.
        </p>

        <form onSubmit={submitAccess} className="foru-private-form">
          <label htmlFor="studio-password">Acceso privado</label>
          <DSInput
            id="studio-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Contraseña"
            autoComplete="current-password"
            required
          />
          {error && <span className="foru-form-error">{error}</span>}
          <DSButtonSecondary type="submit" className="foru-btn" disabled={isChecking}>
            {isChecking ? 'Validando...' : 'Ingresar'} <ArrowRight size={18} />
          </DSButtonSecondary>
        </form>
      </section>
    </main>
  );
}
