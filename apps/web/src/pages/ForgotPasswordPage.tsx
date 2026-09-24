import { FormEvent, useState } from 'react';
import { Link } from 'react-router';
import { Alert, AuthLayout, Button, Field } from '../components/ui';
import { api, ApiError } from '../lib/api';
import { validateEmail } from '../lib/validation';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string>();
  const [serverError, setServerError] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const err = validateEmail(email);
    setError(err);
    setServerError('');
    if (err) return;

    setLoading(true);
    try {
      await api('/auth/forgot-password', { method: 'POST', body: { email: email.trim() } });
      setSent(true);
    } catch (err) {
      setServerError(err instanceof ApiError ? err.messages.join(' · ') : 'Erreur inattendue');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout title="Mot de passe oublié" footer={<Link to="/login" className="text-brand hover:underline">Retour à la connexion</Link>}>
      {sent ? (
        <Alert kind="success">Si un compte existe pour {email}, un lien de réinitialisation vient d'être envoyé.</Alert>
      ) : (
        <>
          {serverError && <Alert>{serverError}</Alert>}
          <p className="mb-4 text-sm text-slate-600">Entrez votre e-mail, nous vous enverrons un lien pour choisir un nouveau mot de passe.</p>
          <form onSubmit={onSubmit} noValidate>
            <Field label="E-mail" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} error={error} />
            <Button type="submit" loading={loading}>Envoyer le lien</Button>
          </form>
        </>
      )}
    </AuthLayout>
  );
}
