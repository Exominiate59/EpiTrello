import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { POSITION_STEP } from '../common/position';
import { CardsService } from './cards.service';

describe('CardsService', () => {
  let prisma: any;
  let lists: any;
  let service: CardsService;
  const ownedCard = { id: 'c1', title: 'Maquette', position: 1000, listId: 'l1', list: { board: { ownerId: 'u1' } } };

  beforeEach(() => {
    prisma = { card: { findFirst: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() } };
    lists = { findOwned: jest.fn().mockResolvedValue({ id: 'l1' }) };
    service = new CardsService(prisma, lists);
  });

  it("vérifie l'accès à la liste avant de créer une carte", async () => {
    lists.findOwned.mockRejectedValue(new ForbiddenException());
    await expect(service.create('u2', 'l1', { title: 'x' })).rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.card.create).not.toHaveBeenCalled();
  });

  it('ajoute la carte en bas de la liste', async () => {
    prisma.card.findFirst.mockResolvedValue({ position: 3000 });
    await service.create('u1', 'l1', { title: ' Écrire les tests ' });
    expect(prisma.card.create).toHaveBeenCalledWith({
      data: { title: 'Écrire les tests', listId: 'l1', position: 3000 + POSITION_STEP },
    });
  });

  it('renvoie 404 pour une carte inexistante', async () => {
    prisma.card.findUnique.mockResolvedValue(null);
    await expect(service.update('u1', 'c1', { title: 'x' })).rejects.toBeInstanceOf(NotFoundException);
  });

  it("interdit de supprimer la carte d'un autre utilisateur", async () => {
    prisma.card.findUnique.mockResolvedValue({ ...ownedCard, list: { board: { ownerId: 'u2' } } });
    await expect(service.remove('u1', 'c1')).rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.card.delete).not.toHaveBeenCalled();
  });

  it('modifie le titre', async () => {
    prisma.card.findUnique.mockResolvedValue(ownedCard);
    await service.update('u1', 'c1', { title: ' Maquette v2 ' });
    expect(prisma.card.update).toHaveBeenCalledWith({ where: { id: 'c1' }, data: { title: 'Maquette v2' } });
  });

  describe('dupliquer', () => {
    it('place la copie juste sous la carte originale', async () => {
      prisma.card.findUnique.mockResolvedValue(ownedCard);
      prisma.card.findFirst.mockResolvedValue({ position: 2000 });
      await service.duplicate('u1', 'c1');
      expect(prisma.card.findFirst).toHaveBeenCalledWith({
        where: { listId: 'l1', position: { gt: 1000 } },
        orderBy: { position: 'asc' },
      });
      expect(prisma.card.create).toHaveBeenCalledWith({
        data: { title: 'Maquette (copie)', listId: 'l1', position: 1500 },
      });
    });

    it("met la copie en dernier si l'originale est la dernière carte", async () => {
      prisma.card.findUnique.mockResolvedValue(ownedCard);
      prisma.card.findFirst.mockResolvedValue(null);
      await service.duplicate('u1', 'c1');
      expect(prisma.card.create.mock.calls[0][0].data.position).toBe(1000 + POSITION_STEP);
    });

    it('ne dépasse pas la longueur maximale du titre', async () => {
      prisma.card.findUnique.mockResolvedValue({ ...ownedCard, title: 'a'.repeat(200) });
      prisma.card.findFirst.mockResolvedValue(null);
      await service.duplicate('u1', 'c1');
      expect(prisma.card.create.mock.calls[0][0].data.title.length).toBeLessThanOrEqual(200);
    });
  });
});
