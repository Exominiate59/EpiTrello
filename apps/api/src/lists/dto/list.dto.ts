import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateListDto {
  @IsString()
  @IsNotEmpty({ message: 'Le titre est obligatoire' })
  @MaxLength(60, { message: 'Le titre doit faire 60 caractères maximum' })
  title: string;
}

export class UpdateListDto extends CreateListDto {}
