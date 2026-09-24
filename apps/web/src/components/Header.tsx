import { Link } from 'react-router';
import { useAuth } from '../lib/auth';
import { Logo } from './ui';

export default function Header({ transparent }: { transparent?: boolean }) {
  const { user, logout } = useAuth();
  return (
    <header className={`flex h-12 items-center justify-between px-4 ${transparent ? 'bg-black/25 text-white' : 'border-b border-slate-200 bg-white text-slate-800'}`}>
      <Link to="/boards" className="flex items-center gap-2 font-bold">
        <Logo /> EpiTrello
      </Link>
      <div className="flex items-center gap-3 text-sm">
        <span className="hidden sm:inline">{user?.name}</span>
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 font-semibold text-white" title={user?.email}>
          {user?.name.charAt(0).toUpperCase()}
        </span>
        <button onClick={logout} className="rounded px-2 py-1 hover:bg-black/10">Déconnexion</button>
      </div>
    </header>
  );
}
