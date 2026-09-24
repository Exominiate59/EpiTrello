# EpiTrello

Clone de **Trello** (boards → listes → cartes) réalisé seul dans le cadre du Travail
Professionnel Simulé (PGE3 — Epitech), sur ~4 mois (rendu mi-janvier 2027).

## Lancer le projet

```bash
cp .env.example .env        # puis remplir JWT_SECRET avec : openssl rand -hex 32
docker compose up --build
```

| Service | URL |
|---|---|
| Application | http://localhost:8080 |
| API | http://localhost:3000 |
| Mails de test (Mailpit) | http://localhost:8025 |

**Tests** (sans Docker ni base de données) :

```bash
cd apps/api && npm install && npm test   # serveur — Jest
cd apps/web && npm install && npm test   # interface — Vitest
```

<details>
<summary>Mode développement (rechargement automatique)</summary>

```bash
docker compose up -d db mailpit
cd apps/api && cp .env.example .env && npm install && npx prisma migrate dev && npm run dev
cd apps/web && cp .env.example .env && npm install && npm run dev   # http://localhost:5180
```

Chaque `.env.example` liste les variables nécessaires. Les `.env` ne sont jamais commités.
</details>

## Organisation

- **1 semaine = 1 feature majeure (MA) + 2 mineures (MI)**, soutenance toutes les 2 semaines.
- Suivi dans les [issues GitHub](https://github.com/Exominiate59/Part-time/issues) : une issue par
  feature (user story + critères d'acceptation), labels `semaine XX`, un jalon par soutenance.
- Tests écrits avant le code, lancés automatiquement par GitHub Actions à chaque push.

## Avancement

| Semaines | Thème | Statut |
|---|---|---|
| 1–2 | Comptes, boards, mot de passe oublié, Docker | ✅ Livré |
| 3–4 | Listes et cartes | En cours |
| 5–6 | Glisser-déposer, détail d'une carte, déplacer entre boards | À venir |
| 7–8 | Temps réel, membres, invitations, assignation | À venir |
| 9–10 | Labels et checklists | À venir |
| 11–12 | Commentaires, recherche et filtres | À venir |
| 13–14 | Journal d'activité, pièces jointes | À venir |
| 15–16 | Notifications, archives, mode sombre | À venir |

## Stack

| | Choix | Pourquoi |
|---|---|---|
| Langage | TypeScript partout | Un seul langage ; les erreurs sont détectées avant l'exécution |
| Interface | React + Vite + Tailwind | Meilleures bibliothèques de glisser-déposer, rapide à faire évoluer |
| Serveur | NestJS | Code organisé en modules, outils de test inclus |
| Données | PostgreSQL + Prisma | Board → liste → carte : des données liées entre elles |
| Connexion | JWT + bcrypt | Standard, sécurisé, réutilisable pour le temps réel |
| Environnement | Docker Compose | Tout le projet se relance en une commande |

## Structure

```
apps/api   serveur NestJS (src/auth, src/boards, prisma/schema.prisma)
apps/web   interface React (src/pages, src/components, src/lib)
docker-compose.yml   base de données + Mailpit + API + interface
```
