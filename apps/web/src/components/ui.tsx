import { InputHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router';

export function AuthLayout({ title, children, footer }: { title: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-100 px-4">
      <Link to="/" className="mb-6 flex items-center gap-2 text-2xl font-bold text-slate-800">
        <Logo /> EpiTrello
      </Link>
      <div className="w-full max-w-sm rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-center text-lg font-semibold text-slate-700">{title}</h1>
        {children}
      </div>
      {footer && <div className="mt-6 text-sm text-slate-600">{footer}</div>}
    </div>
  );
}

export function Logo() {
  return (
    <span className="inline-flex h-7 w-7 items-center justify-center gap-0.5 rounded bg-brand p-1">
      <span className="h-full w-1.5 rounded-sm bg-white" />
      <span className="h-2/3 w-1.5 self-start rounded-sm bg-white" />
    </span>
  );
}

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function Field({ label, error, id, ...props }: FieldProps) {
  const inputId = id ?? props.name;
  return (
    <div className="mb-4">
      <label htmlFor={inputId} className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        id={inputId}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
        className={`w-full rounded border px-3 py-2 text-sm outline-none transition focus:ring-2 ${
          error ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:border-brand focus:ring-blue-200'
        }`}
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

export function Button({ loading, children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={`w-full rounded bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60 ${props.className ?? ''}`}
    >
      {loading ? 'Chargement…' : children}
    </button>
  );
}

export function Alert({ kind = 'error', children }: { kind?: 'error' | 'success'; children: ReactNode }) {
  const styles = kind === 'error' ? 'border-red-200 bg-red-50 text-red-700' : 'border-green-200 bg-green-50 text-green-700';
  return <div className={`mb-4 rounded border px-3 py-2 text-sm ${styles}`}>{children}</div>;
}
