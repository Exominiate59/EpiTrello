import { FormEvent, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { Alert, AuthLayout, Button, Field } from '../components/ui';
import { ApiError } from '../lib/api';
import { useAuth } from '../lib/auth';
import { compact, validateEmail, validatePassword } from '../lib/validation';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const errs = compact({ email: validateEmail(email), password: password ? undefined : 'Le mot de passe est obligatoire' });
    setErrors(errs);
    setServerError('');
    if (Object.keys(errs).length) return;

    setLoading(true);
    try {
      await login(email.trim(), password);
      navigate((location.state as { from?: string } | null)?.from ?? '/boards', { replace: true });
    } catch (err) {
      setServerError(err instanceof ApiError ? err.messages.join(' · ') : 'Erreur inattendue');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Connectez-vous pour continuer"
      footer={
        <>
          Pas de compte ? <Link to="/register" className="font-medium text-brand hover:underline">Créer un compte</Link>
        </>
      }
    >
      {serverError && <Alert>{serverError}</Alert>}
      <form onSubmit={onSubmit} noValidate>
        <Field label="E-mail" name="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} />
        <Field label="Mot de passe" name="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} />
        <Button type="submit" loading={loading}>Se connecter</Button>
      </form>
      <Link to="/forgot-password" className="mt-4 block text-center text-sm text-brand hover:underline">
        Mot de passe oublié ?
      </Link>
    </AuthLayout>
  );
}
