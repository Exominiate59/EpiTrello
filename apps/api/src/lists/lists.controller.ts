import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { AuthUser, JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MoveDto } from '../common/move.dto';
import { CreateListDto, UpdateListDto } from './dto/list.dto';
import { ListsService } from './lists.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class ListsController {
  constructor(private readonly lists: ListsService) {}

  @Get('boards/:boardId/lists')
  findAll(@CurrentUser() user: AuthUser, @Param('boardId') boardId: string) {
    return this.lists.findAllForBoard(user.userId, boardId);
  }

  @Post('boards/:boardId/lists')
  create(@CurrentUser() user: AuthUser, @Param('boardId') boardId: string, @Body() dto: CreateListDto) {
    return this.lists.create(user.userId, boardId, dto);
  }

  @Patch('lists/:id')
  update(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateListDto) {
    return this.lists.update(user.userId, id, dto);
  }

  @Patch('lists/:id/move')
  move(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: MoveDto) {
    return this.lists.move(user.userId, id, dto.index);
  }

  @Delete('lists/:id')
  @HttpCode(204)
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.lists.remove(user.userId, id);
  }
}
