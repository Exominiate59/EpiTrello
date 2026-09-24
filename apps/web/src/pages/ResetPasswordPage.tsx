import { FormEvent, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { Alert, AuthLayout, Button, Field } from '../components/ui';
import { api, ApiError } from '../lib/api';
import { compact, validateConfirm, validatePassword } from '../lib/validation';

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({});
  const [serverError, setServerError] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const errs = compact({ password: validatePassword(password), confirm: validateConfirm(password, confirm) });
    setErrors(errs);
    setServerError('');
    if (Object.keys(errs).length) return;

    setLoading(true);
    try {
      await api('/auth/reset-password', { method: 'POST', body: { token, password } });
      setDone(true);
    } catch (err) {
      setServerError(err instanceof ApiError ? err.messages.join(' · ') : 'Erreur inattendue');
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <AuthLayout title="Lien invalide">
        <Alert>Ce lien de réinitialisation est incomplet.</Alert>
        <Link to="/forgot-password" className="text-sm text-brand hover:underline">Demander un nouveau lien</Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Nouveau mot de passe">
      {done ? (
        <>
          <Alert kind="success">Mot de passe mis à jour.</Alert>
          <Link to="/login" className="block text-center text-sm font-medium text-brand hover:underline">Se connecter</Link>
        </>
      ) : (
        <>
          {serverError && <Alert>{serverError}</Alert>}
          <form onSubmit={onSubmit} noValidate>
            <Field label="Nouveau mot de passe" name="password" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} />
            <Field label="Confirmer" name="confirm" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} error={errors.confirm} />
            <Button type="submit" loading={loading}>Mettre à jour</Button>
          </form>
        </>
      )}
    </AuthLayout>
  );
}
