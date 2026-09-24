import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBoardDto, UpdateBoardDto } from './dto/board.dto';

@Injectable()
export class BoardsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(userId: string) {
    return this.prisma.board.findMany({ where: { ownerId: userId }, orderBy: { createdAt: 'desc' } });
  }

  async findOne(userId: string, id: string) {
    const board = await this.prisma.board.findUnique({ where: { id } });
    if (!board) throw new NotFoundException('Board introuvable');
    if (board.ownerId !== userId) throw new ForbiddenException("Vous n'avez pas accès à ce board");
    return board;
  }

  create(userId: string, dto: CreateBoardDto) {
    return this.prisma.board.create({ data: { title: dto.title.trim(), color: dto.color, ownerId: userId } });
  }

  async update(userId: string, id: string, dto: UpdateBoardDto) {
    await this.findOne(userId, id);
    return this.prisma.board.update({ where: { id }, data: { ...dto, title: dto.title?.trim() } });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    await this.prisma.board.delete({ where: { id } });
  }
}
