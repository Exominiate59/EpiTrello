export type Errors<T extends string> = Partial<Record<T, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: string): string | undefined {
  if (!email.trim()) return "L'e-mail est obligatoire";
  if (!EMAIL_RE.test(email.trim())) return 'Adresse e-mail invalide';
}

export function validatePassword(password: string): string | undefined {
  if (!password) return 'Le mot de passe est obligatoire';
  if (password.length < 8) return 'Le mot de passe doit faire au moins 8 caractères';
}

export function validateName(name: string): string | undefined {
  if (!name.trim()) return 'Le nom est obligatoire';
  if (name.trim().length > 50) return 'Le nom doit faire 50 caractères maximum';
}

export function validateBoardTitle(title: string): string | undefined {
  if (!title.trim()) return 'Le titre est obligatoire';
  if (title.trim().length > 60) return 'Le titre doit faire 60 caractères maximum';
}

export function validateConfirm(password: string, confirm: string): string | undefined {
  if (password !== confirm) return 'Les mots de passe ne correspondent pas';
}

/** Retire les entrées vides pour savoir si le formulaire est valide */
export function compact<T extends string>(errors: Errors<T>): Errors<T> {
  return Object.fromEntries(Object.entries(errors).filter(([, v]) => v)) as Errors<T>;
}
