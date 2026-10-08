import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateCardDto {
  @IsString()
  @IsNotEmpty({ message: 'Le titre est obligatoire' })
  @MaxLength(200, { message: 'Le titre doit faire 200 caractères maximum' })
  title: string;
}

export class UpdateCardDto extends CreateCardDto {}
