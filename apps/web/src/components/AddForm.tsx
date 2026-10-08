import { FormEvent, useState } from 'react';
import { ApiError } from '../lib/api';
import { Spinner } from './Skeleton';

interface AddFormProps {
  openLabel: string;
  placeholder: string;
  submitLabel: string;
  validate: (value: string) => string | undefined;
  onAdd: (value: string) => Promise<unknown>;
  multiline?: boolean;
  dark?: boolean;
}

/** Bouton « + Ajouter… » qui s'ouvre en formulaire ; reste ouvert pour enchaîner les ajouts */
export default function AddForm({ openLabel, placeholder, submitLabel, validate, onAdd, multiline, dark }: AddFormProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const [error, setError] = useState<string>();
  const [saving, setSaving] = useState(false);

  async function submit(e?: FormEvent) {
    e?.preventDefault();
    if (saving) return;
    const err = validate(value);
    setError(err);
    if (err) return;
    setSaving(true);
    try {
      await onAdd(value.trim());
      setValue('');
    } catch (err) {
      setError(err instanceof ApiError ? err.messages.join(' · ') : 'Erreur inattendue');
    } finally {
      setSaving(false);
    }
  }

  function close() {
    setOpen(false);
    setValue('');
    setError(undefined);
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition ${
          dark ? 'bg-white/25 text-white hover:bg-white/35' : 'text-slate-600 hover:bg-slate-200'
        }`}
      >
        + {openLabel}
      </button>
    );
  }

  const fieldProps = {
    autoFocus: true,
    'aria-label': placeholder,
    placeholder,
    value,
    onChange: (e: React.ChangeEvent<HTMLInputElement & HTMLTextAreaElement>) => setValue(e.target.value),
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (multiline && e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        submit();
      }
    },
    className: `w-full rounded-md border px-2 py-1.5 text-sm text-slate-800 shadow-sm outline-none focus:ring-2 ${
      error ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:ring-blue-200'
    }`,
  };

  return (
    <form onSubmit={submit} noValidate className={`w-full space-y-2 rounded-lg ${dark ? 'bg-slate-100 p-2' : ''}`}>
      {multiline ? <textarea rows={2} {...fieldProps} className={`${fieldProps.className} resize-none`} /> : <input {...fieldProps} />}
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex items-center gap-2">
        <button type="submit" disabled={saving} className="flex items-center gap-2 rounded bg-brand px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60">
          {saving && <Spinner className="h-3 w-3" />} {submitLabel}
        </button>
        <button type="button" onClick={close} aria-label="Fermer" className="rounded px-2 py-1 text-lg leading-none text-slate-600 hover:bg-slate-200">
          ×
        </button>
      </div>
    </form>
  );
}
