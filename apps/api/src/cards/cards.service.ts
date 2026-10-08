import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { positionBetween } from '../common/position';
import { ListsService } from '../lists/lists.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCardDto, UpdateCardDto } from './dto/card.dto';

const MAX_TITLE = 200;
const COPY_SUFFIX = ' (copie)';

@Injectable()
export class CardsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly lists: ListsService,
  ) {}

  async create(userId: string, listId: string, dto: CreateCardDto) {
    await this.lists.findOwned(userId, listId);
    const last = await this.prisma.card.findFirst({ where: { listId }, orderBy: { position: 'desc' } });
    return this.prisma.card.create({
      data: { title: dto.title.trim(), listId, position: positionBetween(last?.position) },
    });
  }

  async update(userId: string, id: string, dto: UpdateCardDto) {
    await this.findOwned(userId, id);
    return this.prisma.card.update({ where: { id }, data: { title: dto.title.trim() } });
  }

  async remove(userId: string, id: string) {
    await this.findOwned(userId, id);
    await this.prisma.card.delete({ where: { id } });
  }

  /** Copie la carte juste en dessous de l'originale, dans la même liste */
  async duplicate(userId: string, id: string) {
    const card = await this.findOwned(userId, id);
    const next = await this.prisma.card.findFirst({
      where: { listId: card.listId, position: { gt: card.position } },
      orderBy: { position: 'asc' },
    });
    const title = card.title.slice(0, MAX_TITLE - COPY_SUFFIX.length) + COPY_SUFFIX;
    return this.prisma.card.create({
      data: { title, listId: card.listId, position: positionBetween(card.position, next?.position) },
    });
  }

  private async findOwned(userId: string, id: string) {
    const card = await this.prisma.card.findUnique({ where: { id }, include: { list: { include: { board: true } } } });
    if (!card) throw new NotFoundException('Carte introuvable');
    if (card.list.board.ownerId !== userId) throw new ForbiddenException("Vous n'avez pas accès à cette carte");
    return card;
  }
}
