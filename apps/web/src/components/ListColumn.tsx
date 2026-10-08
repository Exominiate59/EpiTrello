import { List } from '../lib/api';
import { BoardContent } from '../lib/useBoardContent';
import { validateCardTitle, validateListTitle } from '../lib/validation';
import AddForm from './AddForm';
import CardItem from './CardItem';
import InlineEdit from './InlineEdit';
import { Skeleton, Spinner } from './Skeleton';

interface ListColumnProps {
  list: List;
  index: number;
  count: number;
  actions: BoardContent;
}

export default function ListColumn({ list, index, count, actions }: ListColumnProps) {
  const moving = actions.moveList.isPending && actions.moveList.variables?.id === list.id;
  const addingCard = actions.createCard.isPending && actions.createCard.variables?.listId === list.id;

  function remove() {
    const n = list.cards.length;
    const detail = n ? ` et ses ${n} carte${n > 1 ? 's' : ''}` : '';
    if (confirm(`Supprimer la liste « ${list.title} »${detail} ?`)) actions.deleteList.mutate(list.id);
  }

  return (
    <section aria-label={`Liste ${list.title}`} className="flex max-h-full w-72 shrink-0 flex-col rounded-xl bg-slate-100 p-2 shadow">
      <header className="flex items-start gap-1 px-1 pb-2">
        <div className="min-w-0 flex-1">
          <InlineEdit
            value={list.title}
            label="Titre de la liste"
            validate={validateListTitle}
            onSave={(title) => actions.renameList.mutateAsync({ id: list.id, title })}
            className="w-full truncate rounded px-1 py-0.5 text-sm font-semibold text-slate-800 hover:bg-slate-200"
          />
        </div>
        {moving && <Spinner className="mt-1.5 h-3 w-3 text-slate-500" />}
        <button
          type="button"
          aria-label={`Déplacer « ${list.title} » à gauche`}
          disabled={index === 0 || moving}
          onClick={() => actions.moveList.mutate({ id: list.id, index: index - 1 })}
          className="rounded px-1.5 py-0.5 text-slate-500 hover:bg-slate-200 disabled:opacity-30"
        >
          ←
        </button>
        <button
          type="button"
          aria-label={`Déplacer « ${list.title} » à droite`}
          disabled={index === count - 1 || moving}
          onClick={() => actions.moveList.mutate({ id: list.id, index: index + 1 })}
          className="rounded px-1.5 py-0.5 text-slate-500 hover:bg-slate-200 disabled:opacity-30"
        >
          →
        </button>
        <button
          type="button"
          aria-label={`Supprimer la liste « ${list.title} »`}
          onClick={remove}
          className="rounded px-1.5 py-0.5 text-slate-500 hover:bg-red-50 hover:text-red-600"
        >
          ✕
        </button>
      </header>

      <ol className="flex min-h-1 flex-col gap-2 overflow-y-auto px-1">
        {list.cards.map((card) => (
          <CardItem key={card.id} card={card} actions={actions} />
        ))}
        {addingCard && <Skeleton className="h-9 w-full bg-white" />}
      </ol>
      {list.cards.length === 0 && !addingCard && <p className="px-2 py-1 text-xs text-slate-500">Aucune carte pour l'instant.</p>}

      <div className="mt-2">
        <AddForm
          openLabel="Ajouter une carte"
          placeholder="Titre de la carte"
          submitLabel="Ajouter"
          multiline
          validate={validateCardTitle}
          onAdd={(title) => actions.createCard.mutateAsync({ listId: list.id, title })}
        />
      </div>
    </section>
  );
}
