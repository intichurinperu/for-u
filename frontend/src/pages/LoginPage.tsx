import Logo from '../components/Logo';
import { Input as DSInput } from '../components/ui/DesignSystem';
import { type FormEvent, useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import MagicButton from '../components/ui/MagicButton';
import MagicCard from '../components/ui/MagicCard';

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signIn, session, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const requestedNext = searchParams.get('next');
  const next = requestedNext?.startsWith('/') && !requestedNext.startsWith('//') ? requestedNext : '/dashboard';

  if (!loading && session) return <Navigate to={next} replace />;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setErrorMessage('');

    try {
      await signIn(email, password);
      navigate(next, { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No pudimos iniciar sesion. Intenta otra vez.';
      setErrorMessage(
        message.toLowerCase().includes('invalid login credentials')
          ? 'Revisa tu email y contraseña. Si acabas de registrarte, confirma primero el enlace que recibiste por correo.'
          : message,
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="foru-auth-page">
      <MagicCard as="section" className="foru-auth-card">
        <Link to="/" className="foru-auth-wordmark" aria-label="FOR U">
          <Logo />
        </Link>
        <h1>Entra a For U</h1>
        <p>Vuelve a tu Ruta Digital y continua desde la proxima accion clara.</p>

        <form onSubmit={handleSubmit} className="foru-auth-form">
          <label>
            Email
            <DSInput
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="tu@email.com"
              autoComplete="email"
              required
            />
          </label>
          <label>
            Password
            <DSInput
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Tu clave"
              autoComplete="current-password"
              required
            />
          </label>

          {errorMessage ? <div className="foru-auth-error">{errorMessage}</div> : null}

          <MagicButton type="submit" disabled={submitting}>
            {submitting ? 'Entrando...' : 'Entrar'}
          </MagicButton>
        </form>

        <small>
          ¿Primera vez por aqui? <Link to="/register">Crear cuenta gratis</Link>
        </small>
      </MagicCard>
    </main>
  );
}
