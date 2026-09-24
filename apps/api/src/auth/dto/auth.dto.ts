import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Adresse e-mail invalide' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Le nom est obligatoire' })
  @MaxLength(50, { message: 'Le nom doit faire 50 caractères maximum' })
  name: string;

  @IsString()
  @MinLength(8, { message: 'Le mot de passe doit faire au moins 8 caractères' })
  password: string;
}

export class LoginDto {
  @IsEmail({}, { message: 'Adresse e-mail invalide' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Le mot de passe est obligatoire' })
  password: string;
}

export class ForgotPasswordDto {
  @IsEmail({}, { message: 'Adresse e-mail invalide' })
  email: string;
}

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty({ message: 'Token manquant' })
  token: string;

  @IsString()
  @MinLength(8, { message: 'Le mot de passe doit faire au moins 8 caractères' })
  password: string;
}
