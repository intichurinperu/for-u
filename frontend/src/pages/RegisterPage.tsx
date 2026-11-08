import { type FormEvent, useEffect, useRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import PearlButton from '../components/ui/PearlButton';
import { useAuth } from '../contexts/AuthContext';
import './registerPage.css';

type Field = 'name' | 'email' | 'password';
type FieldErrors = Partial<Record<Field, string>>;

export default function RegisterPage() {
  const navigate = useNavigate();
  const { signUp, session, loading } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [errorMessage, setErrorMessage] = useState('');
  const [confirmation, setConfirmation] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const busy = useRef(false);
  const nameInput = useRef<HTMLInputElement>(null);
  const emailInput = useRef<HTMLInputElement>(null);
  const passwordInput = useRef<HTMLInputElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const locked = submitting || loading;

  useEffect(() => { if (confirmation) heading.current?.focus(); }, [confirmation]);

  // An existing session goes home; a session created by this form continues to onboarding.
  if (!loading && session && !submitting && !confirmation) return <Navigate to="/dashboard" replace />;

  function validate(field: Field): string | undefined {
    if (field === 'name' && !displayName.trim()) return 'Escribe tu nombre.';
    if (field === 'email') {
      if (!email.trim()) return 'Escribe tu correo.';
      if (emailInput.current?.validity.typeMismatch) return 'Revisa el formato de tu correo.';
    }
    // AuthContext already trims the password before sending it to Supabase.
    if (field === 'password' && password.trim().length < 6) return 'Usa al menos 6 caracteres.';
  }

  function checkField(field: Field) { setErrors(current => ({ ...current, [field]: validate(field) })); }
  function clearFieldError(field: Field) {
    setErrors(current => ({ ...current, [field]: undefined }));
    setErrorMessage('');
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy.current || loading) return;
    const nextErrors: FieldErrors = { name: validate('name'), email: validate('email'), password: validate('password') };
    setErrors(nextErrors);
    setErrorMessage('');
    const firstInvalid = (['name', 'email', 'password'] as const).find(field => nextErrors[field]);
    if (firstInvalid) {
      ({ name: nameInput, email: emailInput, password: passwordInput })[firstInvalid].current?.focus();
      return;
    }
    busy.current = true;
    setSubmitting(true);
    try {
      const result = await signUp(email.trim(), password, displayName.trim());
      if (result.needsEmailConfirmation) {
        setConfirmation(true);
        setPassword('');
        setShowPassword(false);
        return;
      }
      navigate('/onboarding', { replace: true });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'No pudimos crear la cuenta. Intenta otra vez.');
    } finally {
      busy.current = false;
      setSubmitting(false);
    }
  }

  return (
    <div className="public-register">
      <header className="public-register-header"><Link to="/" aria-label="FOR U, volver al inicio"><Logo /></Link></header>
      <main className="public-register-main">
        <div className="public-register-art" aria-hidden="true"><img src="/brand/foru-landing-islands.png" alt="" width="1448" height="1086" /></div>
        <section className="public-register-content" aria-labelledby="register-title">
          <h1 id="register-title" ref={heading} tabIndex={-1}>{confirmation ? 'Revisa tu correo.' : 'Tu idea empieza aquí.'}</h1>
          {confirmation ? (
            <div className="public-register-confirmation">
              <p>Te enviamos un enlace a <strong>{email.trim()}</strong>.</p>
              <p>Confirma tu correo para entrar y continuar con tu proyecto.</p>
              <p className="public-register-hint">Si no lo encuentras, revisa spam.</p>
              <PearlButton to="/login?next=%2Fdashboard">Ir a iniciar sesión</PearlButton>
            </div>
          ) : (
            <>
              <p className="public-register-intro">Crea tu cuenta para guardar y continuar tu proyecto.</p>
              <form onSubmit={handleSubmit} noValidate aria-busy={submitting} className="public-register-form">
                <div className="public-register-field">
                  <label htmlFor="register-name">Tu nombre</label>
                  <input ref={nameInput} id="register-name" name="name" value={displayName} onChange={event => { setDisplayName(event.target.value); clearFieldError('name'); }} onBlur={() => checkField('name')} placeholder="¿Cómo te llamas?" autoComplete="name" required maxLength={100} readOnly={locked} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'register-name-error' : undefined} />
                  {errors.name && <p id="register-name-error" className="public-register-field-error">{errors.name}</p>}
                </div>
                <div className="public-register-field">
                  <label htmlFor="register-email">Correo</label>
                  <input ref={emailInput} id="register-email" name="email" type="email" value={email} onChange={event => { setEmail(event.target.value); clearFieldError('email'); }} onBlur={() => checkField('email')} placeholder="tu@correo.com" autoComplete="email" autoCapitalize="none" spellCheck={false} required readOnly={locked} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'register-email-error' : undefined} />
                  {errors.email && <p id="register-email-error" className="public-register-field-error">{errors.email}</p>}
                </div>
                <div className="public-register-field">
                  <label htmlFor="register-password">Contraseña</label>
                  <div className="public-register-password">
                    <input ref={passwordInput} id="register-password" name="password" type={showPassword ? 'text' : 'password'} value={password} onChange={event => { setPassword(event.target.value); clearFieldError('password'); }} onBlur={() => checkField('password')} placeholder="Mínimo 6 caracteres" autoComplete="new-password" minLength={6} required readOnly={locked} aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? 'register-password-error' : undefined} />
                    <button type="button" className="public-register-password-toggle" aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'} aria-pressed={showPassword} aria-controls="register-password" disabled={locked} onClick={() => setShowPassword(value => !value)}>{showPassword ? <EyeOff size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}</button>
                  </div>
                  {errors.password && <p id="register-password-error" className="public-register-field-error">{errors.password}</p>}
                </div>
                {errorMessage && <p role="alert" className="public-register-server-error">{errorMessage}</p>}
                <PearlButton type="submit" disabled={locked}>{submitting ? 'Creando tu cuenta…' : 'Crear mi cuenta'}</PearlButton>
                <p className="public-register-hint" role="status">{loading ? 'Comprobando tu sesión…' : 'Si es necesario, te pediremos confirmar tu correo.'}</p>
              </form>
              <p className="public-register-login">¿Ya tienes cuenta? <Link to="/login">Iniciar sesión</Link></p>
            </>
          )}
          <Link to="/" className="public-register-back">Volver al inicio</Link>
        </section>
      </main>
    </div>
  );
}
