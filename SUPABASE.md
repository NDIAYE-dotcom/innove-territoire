# Supabase — Innov'Territoires

Projet : `mejvyzqoukvulsjsqdwp` (https://mejvyzqoukvulsjsqdwp.supabase.co)

## Appliquer les migrations

La CLI locale n'est pas liée à ce projet (autre compte). Exécuter les fichiers
de `supabase/migrations/` **dans l'ordre**, un par un, dans le **SQL Editor**
du dashboard Supabase (https://supabase.com/dashboard/project/mejvyzqoukvulsjsqdwp/sql/new) :

1. `20260825140000_extensions_and_helpers.sql`
2. `20260825140100_identity.sql`
3. `20260825140200_content.sql`
4. `20260825140300_service_requests.sql`
5. `20260825140400_elearning.sql`
6. `20260825140500_cms_and_system.sql`
7. `20260825140600_storage.sql`
8. `20260825140700_seed.sql`

Chaque fichier est idempotent-safe à l'exécution unique (pas de ré-exécution
automatique prévue). En cas d'erreur sur un fichier, ne pas réexécuter les
précédents : corriger puis reprendre à partir du fichier en échec.

## Tables créées

| Table | Rôle |
|---|---|
| `roles`, `profiles` | Rôles applicatifs + profil de chaque utilisateur Auth |
| `domains`, `services` | Domaines d'intervention / prestations (miroir de `src/data/institutionalContent.js`) |
| `service_requests`, `service_request_messages` | Demandes de service publiques + échanges |
| `formations`, `formation_modules`, `lessons`, `enrollments`, `lesson_progress`, `course_resources`, `formation_meet_links` | Espace e-learning |
| `site_sections`, `site_cards`, `site_settings` | CMS administrable (Phase 10) |
| `notifications`, `email_logs`, `admin_logs` | Notifications, historique email, journal d'activité SuperAdmin |

## Sécurité (RLS)

Toutes les tables ont RLS activé. Règle générale :
- Contenu public (`domains`, `services`, `formations` publiées, `site_*`) : lecture libre, écriture SuperAdmin uniquement.
- Données personnelles (`profiles`, `service_requests`, `enrollments`, `lesson_progress`, `notifications`) : chaque utilisateur ne voit que les siennes ; SuperAdmin voit tout.
- Contenu de cours (`formation_modules`, `lessons`, `course_resources`, `formation_meet_links`) : visible uniquement aux inscrits **approuvés** (`is_enrolled()`) et au SuperAdmin — jamais public, jamais aux inscrits en attente.
- `email_logs`, `admin_logs` : SuperAdmin uniquement, aucun accès client. Écriture normalement faite par les Edge Functions via `service_role` (Phase 9), qui contourne RLS.

Le rôle `superadmin` est déterminé par `public.is_superadmin()`, qui vérifie
`profiles.role_id` — pas de logique de rôle côté React. Pour promouvoir un
premier compte SuperAdmin après inscription :

```sql
update public.profiles
set role_id = (select id from public.roles where key = 'superadmin')
where email = 'email-du-superadmin@exemple.com';
```

## Storage

5 buckets créés par `20260825140600_storage.sql` :

| Bucket | Public | Écriture |
|---|---|---|
| `site-assets` | oui | SuperAdmin |
| `formation-assets` | oui | SuperAdmin |
| `avatars` | oui | propriétaire (`avatars/{user_id}/...`) ou SuperAdmin |
| `course-materials` | non | lecture : inscrits approuvés / écriture : SuperAdmin |
| `documents` | non | upload libre (pièces jointes du formulaire public), lecture : propriétaire ou SuperAdmin |

## Auth : URL Configuration (à faire une fois dans le dashboard)

Le code (`authService.signUp`) fixe explicitement `emailRedirectTo` vers
`{origine}/connexion?confirmed=1` pour le lien "Confirmer l'adresse email".
Supabase **ignore silencieusement** ce paramètre s'il ne figure pas dans la
liste d'autorisation du projet — dans ce cas le lien retombe sur la "Site
URL" par défaut, qui produit une page blanche si elle ne pointe pas vers une
app en cours d'exécution. À vérifier dans **Authentication → URL
Configuration** :

- **Site URL** : `http://localhost:5173` (à remplacer par le domaine de
  production une fois déployé, Phase 14).
- **Redirect URLs** : ajouter `http://localhost:5173/**` (et l'équivalent en
  production plus tard) pour autoriser tous les retours de redirection de
  l'app, pas seulement `/connexion`.

## À vérifier après exécution

- Dans **Table Editor** : les 7 domaines et 7 prestations (dont "Transformation digitale") sont bien seedés, avec `domain_id` renseigné sur chaque prestation.
- Dans **Authentication → Policies** : chaque table liste ses policies (pas de table "Unrestricted").
- Dans **Storage** : les 5 buckets existent avec le bon statut public/privé.
- Créer un compte via l'app (Phase 4), puis exécuter la requête de promotion SuperAdmin ci-dessus pour le premier compte admin.
