import { Card } from '../lib/api';
import { BoardContent } from '../lib/useBoardContent';
import { validateCardTitle } from '../lib/validation';
import InlineEdit from './InlineEdit';
import { Spinner } from './Skeleton';

export default function CardItem({ card, actions }: { card: Card; actions: BoardContent }) {
  const duplicating = actions.duplicateCard.isPending && actions.duplicateCard.variables === card.id;
  const deleting = actions.deleteCard.isPending && actions.deleteCard.variables === card.id;

  return (
    <li className={`group relative rounded-lg bg-white p-2 text-sm shadow-sm ring-1 ring-slate-200 ${deleting ? 'opacity-50' : ''}`}>
      <InlineEdit
        value={card.title}
        label="Titre de la carte"
        multiline
        validate={validateCardTitle}
        onSave={(title) => actions.renameCard.mutateAsync({ id: card.id, title })}
        className="w-full break-words text-slate-800"
      />
      {/* Toujours visibles sur mobile (pas de survol), au survol sur ordinateur */}
      <div className="mt-1 flex justify-end gap-1 text-xs text-slate-500 transition sm:absolute sm:top-1 sm:right-1 sm:mt-0 sm:rounded-md sm:bg-white sm:shadow sm:ring-1 sm:ring-slate-200 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100">
        <button
          type="button"
          onClick={() => actions.duplicateCard.mutate(card.id)}
          disabled={duplicating}
          className="flex items-center gap-1 rounded px-1.5 py-0.5 hover:bg-slate-100"
        >
          {duplicating && <Spinner className="h-3 w-3" />} Dupliquer
        </button>
        <button
          type="button"
          onClick={() => confirm(`Supprimer la carte « ${card.title} » ?`) && actions.deleteCard.mutate(card.id)}
          disabled={deleting}
          className="rounded px-1.5 py-0.5 hover:bg-red-50 hover:text-red-600"
        >
          Supprimer
        </button>
      </div>
    </li>
  );
}
