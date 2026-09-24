import { compact, validateBoardTitle, validateConfirm, validateEmail, validateName, validatePassword } from './validation';

describe('validation des formulaires', () => {
  it('valide les e-mails', () => {
    expect(validateEmail('')).toBe("L'e-mail est obligatoire");
    expect(validateEmail('pas-un-mail')).toBe('Adresse e-mail invalide');
    expect(validateEmail('a@b.fr')).toBeUndefined();
  });

  it('impose 8 caractères minimum au mot de passe', () => {
    expect(validatePassword('')).toBe('Le mot de passe est obligatoire');
    expect(validatePassword('1234567')).toMatch(/8 caractères/);
    expect(validatePassword('12345678')).toBeUndefined();
  });

  it('valide le nom et le titre de board', () => {
    expect(validateName('   ')).toBe('Le nom est obligatoire');
    expect(validateBoardTitle('a'.repeat(61))).toMatch(/60 caractères/);
    expect(validateBoardTitle('Projet')).toBeUndefined();
  });

  it('vérifie la confirmation du mot de passe', () => {
    expect(validateConfirm('abcdefgh', 'abcdefgX')).toBe('Les mots de passe ne correspondent pas');
    expect(validateConfirm('abcdefgh', 'abcdefgh')).toBeUndefined();
  });

  it('compact retire les champs sans erreur', () => {
    expect(compact({ email: undefined, password: 'x' })).toEqual({ password: 'x' });
  });
});
