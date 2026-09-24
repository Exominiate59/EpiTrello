import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly mail: MailService,
  ) {}

  async register(dto: RegisterDto) {
    const email = dto.email.toLowerCase();
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new ConflictException('Un compte existe déjà avec cet e-mail');

    const user = await this.prisma.user.create({
      data: { email, name: dto.name.trim(), passwordHash: await bcrypt.hash(dto.password, 10) },
    });
    return this.buildSession(user);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
    // Même message dans les deux cas pour ne pas révéler si l'e-mail existe
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('E-mail ou mot de passe incorrect');
    }
    return this.buildSession(user);
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();
    return this.publicUser(user);
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    // Réponse identique que le compte existe ou non (anti-énumération)
    if (!user) return;

    const token = randomBytes(32).toString('hex');
    await this.prisma.user.update({
      where: { id: user.id },
      data: { resetToken: token, resetTokenExpires: new Date(Date.now() + RESET_TOKEN_TTL_MS) },
    });
    const webUrl = process.env.WEB_URL ?? 'http://localhost:5180';
    await this.mail.sendPasswordReset(user.email, `${webUrl}/reset-password?token=${token}`);
  }

  async resetPassword(token: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { resetToken: token } });
    if (!user || !user.resetTokenExpires || user.resetTokenExpires < new Date()) {
      throw new BadRequestException('Lien de réinitialisation invalide ou expiré');
    }
    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: await bcrypt.hash(password, 10), resetToken: null, resetTokenExpires: null },
    });
  }

  private buildSession(user: { id: string; email: string; name: string }) {
    return {
      accessToken: this.jwt.sign({ sub: user.id, email: user.email }),
      user: this.publicUser(user),
    };
  }

  private publicUser(user: { id: string; email: string; name: string }) {
    return { id: user.id, email: user.email, name: user.name };
  }
}
