import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FormEvent, useState } from 'react';
import { Link } from 'react-router';
import Header from '../components/Header';
import { Alert } from '../components/ui';
import { api, ApiError, Board } from '../lib/api';
import { validateBoardTitle } from '../lib/validation';

export const BOARD_COLORS = ['#0079bf', '#d29034', '#519839', '#b04632', '#89609e', '#cd5a91', '#4bbf6b', '#00aecc'];

export default function BoardsPage() {
  const qc = useQueryClient();
  const boards = useQuery({ queryKey: ['boards'], queryFn: () => api<Board[]>('/boards') });
  const [creating, setCreating] = useState(false);

  const remove = useMutation({
    mutationFn: (id: string) => api(`/boards/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['boards'] }),
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="mb-6 text-xl font-bold text-slate-800">Mes boards</h1>

        {boards.isError && <Alert>{(boards.error as ApiError).messages.join(' · ')}</Alert>}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
          {boards.isLoading &&
            Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 animate-pulse rounded-lg bg-slate-200" />)}

          {boards.data?.map((board) => (
            <BoardTile
              key={board.id}
              board={board}
              onDelete={() => {
                if (confirm(`Supprimer le board « ${board.title} » ?`)) remove.mutate(board.id);
              }}
            />
          ))}

          {creating ? (
            <CreateBoardForm onClose={() => setCreating(false)} />
          ) : (
            <button
              onClick={() => setCreating(true)}
              className="flex h-24 items-center justify-center rounded-lg bg-slate-200 text-sm font-medium text-slate-700 transition hover:bg-slate-300"
            >
              + Créer un board
            </button>
          )}
        </div>

        {boards.data?.length === 0 && !creating && (
          <p className="mt-8 text-center text-sm text-slate-500">Vous n'avez pas encore de board. Créez-en un pour commencer !</p>
        )}
      </main>
    </div>
  );
}

function BoardTile({ board, onDelete }: { board: Board; onDelete: () => void }) {
  return (
    <div className="group relative h-24 rounded-lg shadow-sm transition hover:brightness-95" style={{ backgroundColor: board.color }}>
      <Link to={`/boards/${board.id}`} className="block h-full p-3 font-semibold text-white">
        {board.title}
      </Link>
      <button
        onClick={onDelete}
        aria-label={`Supprimer ${board.title}`}
        className="absolute right-2 bottom-2 rounded bg-black/30 px-2 py-0.5 text-xs text-white transition sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100"
      >
        Supprimer
      </button>
    </div>
  );
}

function CreateBoardForm({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const [title, setTitle] = useState('');
  const [color, setColor] = useState(BOARD_COLORS[0]);
  const [error, setError] = useState<string>();

  const create = useMutation({
    mutationFn: () => api<Board>('/boards', { method: 'POST', body: { title: title.trim(), color } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['boards'] });
      onClose();
    },
    onError: (err) => setError(err instanceof ApiError ? err.messages.join(' · ') : 'Erreur inattendue'),
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const err = validateBoardTitle(title);
    setError(err);
    if (!err) create.mutate();
  }

  return (
    <form onSubmit={onSubmit} noValidate className="col-span-1 rounded-lg bg-white p-3 shadow-md sm:col-span-2">
      <div className="mb-2 h-10 rounded" style={{ backgroundColor: color }} />
      <div className="mb-2 flex gap-1">
        {BOARD_COLORS.map((c) => (
          <button
            key={c}
            type="button"
            aria-label={`Couleur ${c}`}
            onClick={() => setColor(c)}
            className={`h-6 w-8 rounded ${c === color ? 'ring-2 ring-slate-800 ring-offset-1' : ''}`}
            style={{ backgroundColor: c }}
          />
        ))}
      </div>
      <input
        autoFocus
        aria-label="Titre du board"
        placeholder="Titre du board"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
        className={`w-full rounded border px-2 py-1.5 text-sm outline-none focus:ring-2 ${error ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:ring-blue-200'}`}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      <div className="mt-2 flex gap-2">
        <button type="submit" disabled={create.isPending} className="rounded bg-brand px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60">
          Créer
        </button>
        <button type="button" onClick={onClose} className="rounded px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100">
          Annuler
        </button>
      </div>
    </form>
  );
}
