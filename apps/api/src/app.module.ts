import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { BoardsModule } from './boards/boards.module';
import { CardsModule } from './cards/cards.module';
import { ListsModule } from './lists/lists.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule, AuthModule, BoardsModule, ListsModule, CardsModule],
})
export class AppModule {}
