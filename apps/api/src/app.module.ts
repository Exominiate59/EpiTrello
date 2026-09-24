import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { BoardsModule } from './boards/boards.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule, AuthModule, BoardsModule],
})
export class AppModule {}
