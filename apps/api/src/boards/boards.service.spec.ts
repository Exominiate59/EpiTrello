import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { BoardsService } from './boards.service';

describe('BoardsService', () => {
  let prisma: any;
  let service: BoardsService;

  beforeEach(() => {
    prisma = { board: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() } };
    service = new BoardsService(prisma);
  });

  it("ne liste que les boards de l'utilisateur", async () => {
    await service.findAll('u1');
    expect(prisma.board.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { ownerId: 'u1' } }));
  });

  it("crée un board rattaché à l'utilisateur", async () => {
    await service.create('u1', { title: '  Projet  ' });
    expect(prisma.board.create).toHaveBeenCalledWith({ data: { title: 'Projet', color: undefined, ownerId: 'u1' } });
  });

  it('renvoie 404 si le board existe pas', async () => {
    prisma.board.findUnique.mockResolvedValue(null);
    await expect(service.findOne('u1', 'b1')).rejects.toBeInstanceOf(NotFoundException);
  });

  it("interdit de supprimer le board d'un autre utilisateur", async () => {
    prisma.board.findUnique.mockResolvedValue({ id: 'b1', ownerId: 'u2' });
    await expect(service.remove('u1', 'b1')).rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.board.delete).not.toHaveBeenCalled();
  });

  it('supprime son propre board', async () => {
    prisma.board.findUnique.mockResolvedValue({ id: 'b1', ownerId: 'u1' });
    await service.remove('u1', 'b1');
    expect(prisma.board.delete).toHaveBeenCalledWith({ where: { id: 'b1' } });
  });
});
