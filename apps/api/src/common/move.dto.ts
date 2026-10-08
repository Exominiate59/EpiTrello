import { IsInt, Min } from 'class-validator';

export class MoveDto {
  @IsInt({ message: 'La position doit être un nombre entier' })
  @Min(0, { message: 'La position doit être positive' })
  index: number;
}
