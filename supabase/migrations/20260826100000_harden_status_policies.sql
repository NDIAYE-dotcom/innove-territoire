-- Durcit deux policies INSERT découvertes en préparant la Phase 7 : RLS ne
-- restreint que les LIGNES, jamais les valeurs de colonnes — sans ce correctif,
-- un client pouvait insérer sa propre demande/inscription avec n'importe quel
-- statut (ex. directement 'approved' ou 'completed'), court-circuitant la
-- validation SuperAdmin que ces statuts sont censés représenter.

drop policy if exists "enrollments_insert_own" on public.enrollments;
create policy "enrollments_insert_own"
on public.enrollments for insert
with check (user_id = auth.uid() and status = 'pending');

drop policy if exists "service_requests_insert_any" on public.service_requests;
create policy "service_requests_insert_any"
on public.service_requests for insert
with check (status = 'new');
