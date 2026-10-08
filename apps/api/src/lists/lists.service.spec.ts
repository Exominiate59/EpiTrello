import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { POSITION_STEP } from '../common/position';
import { ListsService } from './lists.service';

describe('ListsService', () => {
  let prisma: any;
  let boards: any;
  let service: ListsService;

  beforeEach(() => {
    prisma = {
      list: { findMany: jest.fn(), findFirst: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
    };
    boards = { findOne: jest.fn().mockResolvedValue({ id: 'b1', ownerId: 'u1' }) };
    service = new ListsService(prisma, boards);
  });

  it('vérifie l\'accès au board avant de lister', async () => {
    boards.findOne.mockRejectedValue(new ForbiddenException());
    await expect(service.findAllForBoard('u2', 'b1')).rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.list.findMany).not.toHaveBeenCalled();
  });

  it('renvoie les listes triées avec leurs cartes triées', async () => {
    await service.findAllForBoard('u1', 'b1');
    expect(prisma.list.findMany).toHaveBeenCalledWith({
      where: { boardId: 'b1' },
      orderBy: { position: 'asc' },
      include: { cards: { orderBy: { position: 'asc' } } },
    });
  });

  it('ajoute une nouvelle liste à la fin du board', async () => {
    prisma.list.findFirst.mockResolvedValue({ position: 2048 });
    await service.create('u1', 'b1', { title: '  À faire ' });
    expect(prisma.list.create).toHaveBeenCalledWith({
      data: { title: 'À faire', boardId: 'b1', position: 2048 + POSITION_STEP },
    });
  });

  it('crée la première liste à la position de départ', async () => {
    prisma.list.findFirst.mockResolvedValue(null);
    await service.create('u1', 'b1', { title: 'À faire' });
    expect(prisma.list.create.mock.calls[0][0].data.position).toBe(POSITION_STEP);
  });

  it('renvoie 404 pour une liste inexistante', async () => {
    prisma.list.findUnique.mockResolvedValue(null);
    await expect(service.update('u1', 'l1', { title: 'x' })).rejects.toBeInstanceOf(NotFoundException);
  });

  it("interdit de modifier la liste d'un board qui n'est pas à soi", async () => {
    prisma.list.findUnique.mockResolvedValue({ id: 'l1', boardId: 'b1', board: { ownerId: 'u2' } });
    await expect(service.remove('u1', 'l1')).rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.list.delete).not.toHaveBeenCalled();
  });

  it('renomme une liste', async () => {
    prisma.list.findUnique.mockResolvedValue({ id: 'l1', boardId: 'b1', board: { ownerId: 'u1' } });
    await service.update('u1', 'l1', { title: ' Terminé ' });
    expect(prisma.list.update).toHaveBeenCalledWith({ where: { id: 'l1' }, data: { title: 'Terminé' } });
  });

  it("déplace une liste à l'index demandé en ne modifiant qu'elle", async () => {
    prisma.list.findUnique.mockResolvedValue({ id: 'l3', boardId: 'b1', board: { ownerId: 'u1' } });
    prisma.list.findMany.mockResolvedValue([{ position: 1000 }, { position: 2000 }]);
    await service.move('u1', 'l3', 1);
    expect(prisma.list.findMany).toHaveBeenCalledWith({
      where: { boardId: 'b1', id: { not: 'l3' } },
      orderBy: { position: 'asc' },
      select: { position: true },
    });
    expect(prisma.list.update).toHaveBeenCalledWith({ where: { id: 'l3' }, data: { position: 1500 } });
  });
});
