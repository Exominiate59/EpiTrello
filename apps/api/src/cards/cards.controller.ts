import { Body, Controller, Delete, HttpCode, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { AuthUser, JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CardsService } from './cards.service';
import { CreateCardDto, UpdateCardDto } from './dto/card.dto';

@Controller()
@UseGuards(JwtAuthGuard)
export class CardsController {
  constructor(private readonly cards: CardsService) {}

  @Post('lists/:listId/cards')
  create(@CurrentUser() user: AuthUser, @Param('listId') listId: string, @Body() dto: CreateCardDto) {
    return this.cards.create(user.userId, listId, dto);
  }

  @Patch('cards/:id')
  update(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateCardDto) {
    return this.cards.update(user.userId, id, dto);
  }

  @Post('cards/:id/duplicate')
  duplicate(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.cards.duplicate(user.userId, id);
  }

  @Delete('cards/:id')
  @HttpCode(204)
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.cards.remove(user.userId, id);
  }
}
