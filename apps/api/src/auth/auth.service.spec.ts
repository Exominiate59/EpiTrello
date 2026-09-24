import { BadRequestException, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let prisma: any;
  let mail: any;
  let service: AuthService;

  beforeEach(() => {
    prisma = { user: { findUnique: jest.fn(), create: jest.fn(), update: jest.fn() } };
    mail = { sendPasswordReset: jest.fn() };
    service = new AuthService(prisma, new JwtService({ secret: 'test' }), mail);
  });

  describe('register', () => {
    it('crée un utilisateur avec un mot de passe hashé et renvoie un token', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockImplementation(({ data }: any) => ({ id: 'u1', ...data }));

      const res = await service.register({ email: 'Bob@Mail.com', name: ' Bob ', password: 'password123' });

      const data = prisma.user.create.mock.calls[0][0].data;
      expect(data.email).toBe('bob@mail.com');
      expect(data.name).toBe('Bob');
      expect(data.passwordHash).not.toBe('password123');
      expect(await bcrypt.compare('password123', data.passwordHash)).toBe(true);
      expect(res.accessToken).toEqual(expect.any(String));
      expect(res.user).toEqual({ id: 'u1', email: 'bob@mail.com', name: 'Bob' });
    });

    it("refuse un e-mail déjà utilisé", async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'u1' });
      await expect(service.register({ email: 'a@a.com', name: 'A', password: 'password123' })).rejects.toBeInstanceOf(
        ConflictException,
      );
    });
  });

  describe('login', () => {
    it('connecte avec le bon mot de passe', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'u1', email: 'a@a.com', name: 'A', passwordHash: await bcrypt.hash('password123', 4),
      });
      const res = await service.login({ email: 'a@a.com', password: 'password123' });
      expect(res.user.id).toBe('u1');
    });

    it('refuse un mauvais mot de passe', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'u1', passwordHash: await bcrypt.hash('password123', 4) });
      await expect(service.login({ email: 'a@a.com', password: 'wrong' })).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('refuse un e-mail inconnu avec le même message', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(service.login({ email: 'x@a.com', password: 'x' })).rejects.toThrow('E-mail ou mot de passe incorrect');
    });
  });

  describe('reset password', () => {
    it("n'envoie pas de mail si le compte n'existe pas", async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await service.forgotPassword('nobody@a.com');
      expect(mail.sendPasswordReset).not.toHaveBeenCalled();
    });

    it('génère un token et envoie le lien par mail', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'u1', email: 'a@a.com' });
      await service.forgotPassword('a@a.com');
      const token = prisma.user.update.mock.calls[0][0].data.resetToken;
      expect(token).toHaveLength(64);
      expect(mail.sendPasswordReset).toHaveBeenCalledWith('a@a.com', expect.stringContaining(token));
    });

    it('refuse un token expiré', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'u1', resetTokenExpires: new Date(Date.now() - 1000) });
      await expect(service.resetPassword('tok', 'newpassword')).rejects.toBeInstanceOf(BadRequestException);
    });

    it('met à jour le mot de passe et invalide le token', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'u1', resetTokenExpires: new Date(Date.now() + 60000) });
      await service.resetPassword('tok', 'newpassword');
      const data = prisma.user.update.mock.calls[0][0].data;
      expect(data.resetToken).toBeNull();
      expect(await bcrypt.compare('newpassword', data.passwordHash)).toBe(true);
    });
  });
});
