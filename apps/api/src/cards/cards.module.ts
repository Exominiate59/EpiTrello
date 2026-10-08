import { Module } from '@nestjs/common';
import { ListsModule } from '../lists/lists.module';
import { CardsController } from './cards.controller';
import { CardsService } from './cards.service';

@Module({ imports: [ListsModule], controllers: [CardsController], providers: [CardsService] })
export class CardsModule {}
