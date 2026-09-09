-- Phase 6 : notifie automatiquement le client (s'il est connecté) quand sa
-- demande de service est enregistrée. Passe par un trigger SECURITY DEFINER
-- plutôt qu'un insert client-side dans `notifications`, dont la policy
-- n'autorise que le SuperAdmin à écrire — les notifications système restent
-- ainsi générées côté base, jamais par le client lui-même.

create or replace function public.notify_service_request_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.user_id is not null then
    insert into public.notifications (user_id, type, title, message, link)
    values (
      new.user_id,
      'service_request_created',
      'Demande envoyée',
      'Votre demande ' || new.request_number || ' a bien été enregistrée.',
      '/client/demandes'
    );
  end if;

  return new;
end;
$$;

create trigger on_service_request_created
after insert on public.service_requests
for each row execute function public.notify_service_request_created();

-- Un visiteur anonyme peut créer une demande (policy service_requests_insert_any),
-- mais ne peut jamais la relire ensuite (policy service_requests_select_own_or_superadmin
-- exige user_id = auth.uid(), qui n'existe pas côté anonyme). Or `INSERT ... RETURNING`
-- exige que la ligne insérée passe la policy SELECT pour pouvoir être renvoyée : un
-- insert anonyme avec `.select()` échouerait donc silencieusement. Cette fonction
-- SECURITY DEFINER contourne ce problème en renvoyant explicitement le numéro de
-- demande généré, sans jamais accorder de droit de lecture général sur la table.
create or replace function public.submit_service_request(
  p_first_name text,
  p_last_name text,
  p_email text,
  p_phone text,
  p_organization text,
  p_function_title text,
  p_service_id uuid,
  p_domain_id uuid,
  p_subject text,
  p_description text,
  p_budget_indicative text,
  p_attachment_url text,
  p_consent boolean
)
returns table (id uuid, request_number text)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  insert into public.service_requests (
    user_id, first_name, last_name, email, phone, organization, function_title,
    service_id, domain_id, subject, description, budget_indicative, attachment_url, consent
  )
  values (
    auth.uid(), p_first_name, p_last_name, p_email, p_phone, p_organization, p_function_title,
    p_service_id, p_domain_id, p_subject, p_description, p_budget_indicative, p_attachment_url, p_consent
  )
  returning service_requests.id, service_requests.request_number;
end;
$$;

grant execute on function public.submit_service_request to anon, authenticated;
