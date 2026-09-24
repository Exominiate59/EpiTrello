import { IsHexColor, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateBoardDto {
  @IsString()
  @IsNotEmpty({ message: 'Le titre est obligatoire' })
  @MaxLength(60, { message: 'Le titre doit faire 60 caractères maximum' })
  title: string;

  @IsOptional()
  @IsHexColor({ message: 'Couleur invalide' })
  color?: string;
}

export class UpdateBoardDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Le titre est obligatoire' })
  @MaxLength(60, { message: 'Le titre doit faire 60 caractères maximum' })
  title?: string;

  @IsOptional()
  @IsHexColor({ message: 'Couleur invalide' })
  color?: string;
}
