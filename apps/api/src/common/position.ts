/**
 * Les listes et les cartes sont ordonnées par un nombre décimal `position`.
 * Pour placer un élément entre deux autres, on prend le milieu de leurs positions :
 * un déplacement ne modifie qu'une seule ligne en base, pas toutes les voisines.
 */
export const POSITION_STEP = 1024;

export function positionBetween(prev?: number, next?: number): number {
  if (prev === undefined && next === undefined) return POSITION_STEP;
  if (prev === undefined) return next! / 2;
  if (next === undefined) return prev + POSITION_STEP;
  return (prev + next) / 2;
}

/** Position à donner à un élément pour qu'il arrive à `index` parmi `siblings` (déjà triés, sans lui). */
export function positionAt(siblings: { position: number }[], index: number): number {
  const i = Math.max(0, Math.min(index, siblings.length));
  return positionBetween(siblings[i - 1]?.position, siblings[i]?.position);
}
