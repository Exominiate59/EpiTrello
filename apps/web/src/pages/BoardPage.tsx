import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useParams } from 'react-router';
import AddForm from '../components/AddForm';
import Header from '../components/Header';
import InlineEdit from '../components/InlineEdit';
import ListColumn from '../components/ListColumn';
import { BoardSkeleton, Skeleton } from '../components/Skeleton';
import { api, ApiError, Board } from '../lib/api';
import { useBoardContent } from '../lib/useBoardContent';
import { validateBoardTitle, validateListTitle } from '../lib/validation';

export default function BoardPage() {
  const { id } = useParams() as { id: string };
  const qc = useQueryClient();
  const board = useQuery({ queryKey: ['boards', id], queryFn: () => api<Board>(`/boards/${id}`) });
  const content = useBoardContent(id);

  const rename = useMutation({
    mutationFn: (title: string) => api<Board>(`/boards/${id}`, { method: 'PATCH', body: { title } }),
    onSuccess: (updated) => {
      qc.setQueryData(['boards', id], updated);
      qc.invalidateQueries({ queryKey: ['boards'], exact: true });
    },
  });

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

  const lists = content.lists.data ?? [];

  return (
    <div className="flex h-screen flex-col" style={{ backgroundColor: board.data?.color ?? '#0079bf' }}>
      <Header transparent />
      <div className="flex items-center gap-3 bg-black/15 px-4 py-2">
        {board.data ? (
          <InlineEdit
            value={board.data.title}
            label="Titre du board"
            validate={validateBoardTitle}
            onSave={(title) => rename.mutateAsync(title)}
            className="rounded px-2 py-1 text-lg font-bold text-white hover:bg-white/20"
            inputClassName="text-lg font-bold"
            errorClassName="text-white"
          />
        ) : (
          <Skeleton className="h-7 w-48 bg-white/40" />
        )}
      </div>

      <main className="flex flex-1 items-start gap-3 overflow-x-auto p-4">
        {content.lists.isLoading ? (
          <BoardSkeleton />
        ) : content.lists.isError ? (
          <p className="rounded bg-white/90 p-3 text-sm text-red-700">{(content.lists.error as ApiError).messages.join(' · ')}</p>
        ) : (
          <>
            {lists.map((list, index) => (
              <ListColumn key={list.id} list={list} index={index} count={lists.length} actions={content} />
            ))}
            {content.createList.isPending && <Skeleton className="h-24 w-72 shrink-0 rounded-xl bg-white/40" />}
            <div className="w-72 shrink-0">
              <AddForm
                dark
                openLabel={lists.length ? 'Ajouter une autre liste' : 'Ajouter une liste'}
                placeholder="Titre de la liste"
                submitLabel="Ajouter la liste"
                validate={validateListTitle}
                onAdd={(title) => content.createList.mutateAsync(title)}
              />
            </div>
          </>
        )}
      </main>
    </div>
  );
}
