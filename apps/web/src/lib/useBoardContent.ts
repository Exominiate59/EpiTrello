import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, Card, List } from './api';

/** Listes + cartes d'un board, et toutes les actions qui les modifient */
export function useBoardContent(boardId: string) {
  const qc = useQueryClient();
  const key = ['boards', boardId, 'lists'];
  const lists = useQuery({ queryKey: key, queryFn: () => api<List[]>(`/boards/${boardId}/lists`) });
  const refresh = () => qc.invalidateQueries({ queryKey: key });
  const mutation = <T,>(fn: (arg: T) => Promise<unknown>) => useMutation({ mutationFn: fn, onSuccess: refresh });

  return {
    lists,
    createList: mutation((title: string) => api<List>(`/boards/${boardId}/lists`, { method: 'POST', body: { title } })),
    renameList: mutation(({ id, title }: { id: string; title: string }) => api(`/lists/${id}`, { method: 'PATCH', body: { title } })),
    moveList: mutation(({ id, index }: { id: string; index: number }) => api(`/lists/${id}/move`, { method: 'PATCH', body: { index } })),
    deleteList: mutation((id: string) => api(`/lists/${id}`, { method: 'DELETE' })),
    createCard: mutation(({ listId, title }: { listId: string; title: string }) =>
      api<Card>(`/lists/${listId}/cards`, { method: 'POST', body: { title } }),
    ),
    renameCard: mutation(({ id, title }: { id: string; title: string }) => api(`/cards/${id}`, { method: 'PATCH', body: { title } })),
    duplicateCard: mutation((id: string) => api<Card>(`/cards/${id}/duplicate`, { method: 'POST' })),
    deleteCard: mutation((id: string) => api(`/cards/${id}`, { method: 'DELETE' })),
  };
}

export type BoardContent = ReturnType<typeof useBoardContent>;
