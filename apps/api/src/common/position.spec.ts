import { positionAt, positionBetween, POSITION_STEP } from './position';

describe('positionBetween', () => {
  it('donne une première position quand la liste est vide', () => {
    expect(positionBetween(undefined, undefined)).toBe(POSITION_STEP);
  });

  it('ajoute à la fin après le dernier élément', () => {
    expect(positionBetween(3000, undefined)).toBe(3000 + POSITION_STEP);
  });

  it('insère au début avant le premier élément', () => {
    expect(positionBetween(undefined, 1000)).toBe(500);
  });

  it('insère au milieu de deux éléments sans les renuméroter', () => {
    expect(positionBetween(1000, 2000)).toBe(1500);
  });
});

describe('positionAt', () => {
  const siblings = [{ position: 1000 }, { position: 2000 }, { position: 3000 }];

  it("calcule la position pour arriver à l'index demandé", () => {
    expect(positionAt(siblings, 0)).toBe(500);
    expect(positionAt(siblings, 1)).toBe(1500);
    expect(positionAt(siblings, 3)).toBe(3000 + POSITION_STEP);
  });

  it("borne l'index s'il dépasse", () => {
    expect(positionAt(siblings, 99)).toBe(3000 + POSITION_STEP);
    expect(positionAt(siblings, -5)).toBe(500);
  });
});
