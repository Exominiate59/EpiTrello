const REQUIRED = ['DATABASE_URL', 'JWT_SECRET'] as const;

/** Arrête le démarrage si une variable obligatoire manque dans le .env */
export function assertEnv() {
  const missing = REQUIRED.filter((key) => !process.env[key]);
  if (missing.length) {
    throw new Error(`Variables manquantes dans .env : ${missing.join(', ')} (voir .env.example)`);
  }
}
