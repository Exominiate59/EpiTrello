import { useState } from 'react';

interface InlineEditProps {
  value: string;
  /** Renvoie une promesse : le champ reste ouvert tant que la sauvegarde n'est pas terminée */
  onSave: (value: string) => Promise<unknown>;
  validate?: (value: string) => string | undefined;
  label: string;
  multiline?: boolean;
  className?: string;
  inputClassName?: string;
  errorClassName?: string;
}

/** Texte cliquable qui devient un champ : Entrée ou clic ailleurs = enregistrer, Échap = annuler */
export default function InlineEdit({
  value,
  onSave,
  validate,
  label,
  multiline,
  className = '',
  inputClassName = '',
  errorClassName = 'text-red-600',
}: InlineEditProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [error, setError] = useState<string>();
  const [saving, setSaving] = useState(false);

  function start() {
    setDraft(value);
    setError(undefined);
    setEditing(true);
  }

  async function save() {
    if (saving) return;
    const next = draft.trim();
    if (next === value) return setEditing(false);
    const err = validate?.(next);
    if (err) return setError(err);
    setSaving(true);
    try {
      await onSave(next);
      setEditing(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur inattendue');
    } finally {
      setSaving(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      save();
    }
    if (e.key === 'Escape') setEditing(false);
  }

  if (!editing) {
    return (
      <button type="button" onClick={start} title="Cliquer pour renommer" className={`text-left ${className}`}>
        {value}
      </button>
    );
  }

  const common = {
    autoFocus: true,
    'aria-label': label,
    'aria-invalid': !!error,
    value: draft,
    disabled: saving,
    onChange: (e: React.ChangeEvent<HTMLInputElement & HTMLTextAreaElement>) => setDraft(e.target.value),
    onFocus: (e: React.FocusEvent<HTMLInputElement & HTMLTextAreaElement>) => e.target.select(),
    onBlur: save,
    onKeyDown,
    className: `w-full rounded px-2 py-1 text-slate-800 outline-none ring-2 ${error ? 'ring-red-400' : 'ring-blue-400'} ${inputClassName}`,
  };

  return (
    <div className="w-full">
      {multiline ? <textarea rows={3} {...common} className={`${common.className} resize-none`} /> : <input {...common} />}
      {error && <p className={`mt-1 text-xs ${errorClassName}`}>{error}</p>}
    </div>
  );
}
