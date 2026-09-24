import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Link, useParams } from 'react-router';
import Header from '../components/Header';
import { api, ApiError, Board } from '../lib/api';
import { validateBoardTitle } from '../lib/validation';

export default function BoardPage() {
  const { id } = useParams();
  const qc = useQueryClient();
  const board = useQuery({ queryKey: ['boards', id], queryFn: () => api<Board>(`/boards/${id}`) });
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string>();

  const rename = useMutation({
    mutationFn: (newTitle: string) => api<Board>(`/boards/${id}`, { method: 'PATCH', body: { title: newTitle } }),
    onSuccess: (updated) => {
      qc.setQueryData(['boards', id], updated);
      qc.invalidateQueries({ queryKey: ['boards'], exact: true });
      setEditing(false);
    },
    onError: (err) => setError(err instanceof ApiError ? err.messages.join(' · ') : 'Erreur inattendue'),
  });

  function save() {
    if (title.trim() === board.data?.title) return setEditing(false);
    const err = validateBoardTitle(title);
    setError(err);
    if (!err) rename.mutate(title.trim());
  }

  if (board.isError) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="p-8 text-center">
          <p className="mb-4 text-slate-700">{(board.error as ApiError).messages.join(' · ')}</p>
          <Link to="/boards" className="text-brand hover:underline">Retour à mes boards</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: board.data?.color ?? '#0079bf' }}>
      <Header transparent />
      <div className="flex items-center gap-3 bg-black/15 px-4 py-2">
        {editing ? (
          <div>
            <input
              autoFocus
              aria-label="Titre du board"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onFocus={(e) => e.target.select()}
              onBlur={save}
              onKeyDown={(e) => {
                if (e.key === 'Enter') save();
                if (e.key === 'Escape') setEditing(false);
              }}
              className="rounded px-2 py-1 text-lg font-bold text-slate-800"
            />
            {error && <p className="mt-1 text-xs text-white">{error}</p>}
          </div>
        ) : (
          <button
            onClick={() => {
              setTitle(board.data?.title ?? '');
              setError(undefined);
              setEditing(true);
            }}
            title="Cliquer pour renommer"
            className="rounded px-2 py-1 text-lg font-bold text-white hover:bg-white/20"
          >
            {board.data?.title ?? '…'}
          </button>
        )}
      </div>
      <main className="p-4">
        <div className="w-72 rounded-lg bg-white/80 p-4 text-sm text-slate-600">
          Les listes et les cartes arrivent bientot.
        </div>
      </main>
    </div>
  );
}
