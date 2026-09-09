-- Extensions et fonctions utilitaires partagées par toutes les migrations suivantes.
--
-- NOTE : is_superadmin() n'est PAS définie ici. Une fonction LANGUAGE SQL est
-- analysée (et ses tables référencées vérifiées) dès sa création, contrairement
-- à PL/pgSQL — elle doit donc être créée après `profiles`/`roles`, à la fin de
-- 20260825140100_identity.sql.

create extension if not exists pgcrypto;

-- Met à jour automatiquement la colonne updated_at à chaque UPDATE.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
