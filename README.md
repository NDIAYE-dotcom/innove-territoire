# Innov'Territoires

Plateforme web du Cabinet Innov'Territoires — cabinet de conseil et d'ingénierie territoriale.

## Stack

- React.js + JavaScript (Vite, sans TypeScript)
- React Router
- CSS pur (variables CSS, un fichier `.css` par composant/page)
- Supabase (PostgreSQL, Auth, Storage, RLS, Edge Functions) — intégré à partir de la Phase 3

## Démarrage

```bash
npm install
cp .env.example .env   # puis renseigner VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY
npm run dev
```

## Scripts

- `npm run dev` — serveur de développement
- `npm run build` — build de production
- `npm run preview` — prévisualisation du build
- `npm run lint` — lint (oxlint)

## Structure

Voir `src/` : `components/` (common, layout, home, services, formations, dashboard, admin), `pages/` (public, client, admin), `services/` (accès Supabase), `styles/` (variables, global, responsive, animations), `routes/`.

## État du projet

Développement mené phase par phase (voir le prompt maître du projet). Phase 1 — Fondations en cours.
