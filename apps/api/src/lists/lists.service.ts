import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { BoardsService } from '../boards/boards.service';
import { positionAt, positionBetween } from '../common/position';
import { PrismaService } from '../prisma/prisma.service';
import { CreateListDto, UpdateListDto } from './dto/list.dto';

@Injectable()
export class ListsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly boards: BoardsService,
  ) {}

  /** Un seul appel renvoie tout le contenu du board (listes + cartes) */
  async findAllForBoard(userId: string, boardId: string) {
    await this.boards.findOne(userId, boardId);
    return this.prisma.list.findMany({
      where: { boardId },
      orderBy: { position: 'asc' },
      include: { cards: { orderBy: { position: 'asc' } } },
    });
  }

  async create(userId: string, boardId: string, dto: CreateListDto) {
    await this.boards.findOne(userId, boardId);
    const last = await this.prisma.list.findFirst({ where: { boardId }, orderBy: { position: 'desc' } });
    return this.prisma.list.create({
      data: { title: dto.title.trim(), boardId, position: positionBetween(last?.position) },
    });
  }

  async update(userId: string, id: string, dto: UpdateListDto) {
    await this.findOwned(userId, id);
    return this.prisma.list.update({ where: { id }, data: { title: dto.title.trim() } });
  }

  async move(userId: string, id: string, index: number) {
    const list = await this.findOwned(userId, id);
    const siblings = await this.prisma.list.findMany({
      where: { boardId: list.boardId, id: { not: id } },
      orderBy: { position: 'asc' },
      select: { position: true },
    });
    return this.prisma.list.update({ where: { id }, data: { position: positionAt(siblings, index) } });
  }

  async remove(userId: string, id: string) {
    await this.findOwned(userId, id);
    // Les cartes de la liste sont supprimées avec elle (onDelete: Cascade)
    await this.prisma.list.delete({ where: { id } });
  }

  async findOwned(userId: string, id: string) {
    const list = await this.prisma.list.findUnique({ where: { id }, include: { board: true } });
    if (!list) throw new NotFoundException('Liste introuvable');
    if (list.board.ownerId !== userId) throw new ForbiddenException("Vous n'avez pas accès à cette liste");
    return list;
  }
}
