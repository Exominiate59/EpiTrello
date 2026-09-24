import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Alert, AuthLayout, Button, Field } from '../components/ui';
import { ApiError } from '../lib/api';
import { useAuth } from '../lib/auth';
import { compact, validateConfirm, validateEmail, validateName, validatePassword } from '../lib/validation';

type FieldName = 'name' | 'email' | 'password' | 'confirm';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (field: FieldName) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [field]: e.target.value });
    if (errors[field]) setErrors({ ...errors, [field]: undefined });
  };

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const errs = compact<FieldName>({
      name: validateName(form.name),
      email: validateEmail(form.email),
      password: validatePassword(form.password),
      confirm: validateConfirm(form.password, form.confirm),
    });
    setErrors(errs);
    setServerError('');
    if (Object.keys(errs).length) return;

    setLoading(true);
    try {
      await register(form.name.trim(), form.email.trim(), form.password);
      navigate('/boards', { replace: true });
    } catch (err) {
      setServerError(err instanceof ApiError ? err.messages.join(' · ') : 'Erreur inattendue');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Créer un compte"
      footer={
        <>
          Déjà un compte ? <Link to="/login" className="font-medium text-brand hover:underline">Se connecter</Link>
        </>
      }
    >
      {serverError && <Alert>{serverError}</Alert>}
      <form onSubmit={onSubmit} noValidate>
        <Field label="Nom" name="name" autoComplete="name" value={form.name} onChange={set('name')} error={errors.name} />
        <Field label="E-mail" name="email" type="email" autoComplete="email" value={form.email} onChange={set('email')} error={errors.email} />
        <Field label="Mot de passe (8 caractères min.)" name="password" type="password" autoComplete="new-password" value={form.password} onChange={set('password')} error={errors.password} />
        <Field label="Confirmer le mot de passe" name="confirm" type="password" autoComplete="new-password" value={form.confirm} onChange={set('confirm')} error={errors.confirm} />
        <Button type="submit" loading={loading}>Créer mon compte</Button>
      </form>
    </AuthLayout>
  );
}
