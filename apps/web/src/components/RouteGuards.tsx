import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '../lib/auth';

function FullPageSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent" />
    </div>
  );
}

/** Redirige vers /login si non connecté, en mémorisant la page demandée */
export function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <FullPageSpinner />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}

/** Empêche un utilisateur déjà connecté de revenir sur login/register */
export function GuestRoute() {
  const { user, loading } = useAuth();
  if (loading) return <FullPageSpinner />;
  if (user) return <Navigate to="/boards" replace />;
  return <Outlet />;
}
