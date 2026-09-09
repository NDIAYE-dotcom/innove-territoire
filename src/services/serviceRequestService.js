import { supabase } from './supabase'

// Passe par une fonction RPC (voir 20260826090000_service_request_notifications.sql) :
// un visiteur anonyme peut créer une demande mais ne peut jamais relire la table
// service_requests (RLS), donc un simple .insert().select() échouerait pour lui.
export async function createServiceRequest(payload) {
  const { data, error } = await supabase.rpc('submit_service_request', {
    p_first_name: payload.first_name,
    p_last_name: payload.last_name,
    p_email: payload.email,
    p_phone: payload.phone || null,
    p_organization: payload.organization || null,
    p_function_title: payload.function_title || null,
    p_service_id: payload.service_id || null,
    p_domain_id: payload.domain_id || null,
    p_subject: payload.subject,
    p_description: payload.description,
    p_budget_indicative: payload.budget_indicative || null,
    p_attachment_url: payload.attachment_url || null,
    p_consent: payload.consent,
  })

  return { data: data?.[0] ?? null, error }
}

export function fetchMyServiceRequests(userId) {
  return supabase
    .from('service_requests')
    .select('id, request_number, subject, status, created_at, updated_at, services(title)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
}

export function fetchServiceRequestMessages(requestId) {
  return supabase
    .from('service_request_messages')
    .select('id, sender_role, message, created_at')
    .eq('service_request_id', requestId)
    .order('created_at', { ascending: true })
}

export function fetchAllMyMessages(userId) {
  return supabase
    .from('service_request_messages')
    .select('id, sender_role, message, created_at, service_requests!inner(user_id, request_number, subject)')
    .eq('service_requests.user_id', userId)
    .order('created_at', { ascending: false })
}

// --- SuperAdmin ---

export function fetchAllServiceRequests() {
  return supabase
    .from('service_requests')
    .select(
      'id, request_number, first_name, last_name, email, phone, organization, function_title, subject, description, budget_indicative, attachment_url, status, created_at, services(title), domains(title)'
    )
    .order('created_at', { ascending: false })
}

export function updateServiceRequestStatus(id, status) {
  return supabase.from('service_requests').update({ status }).eq('id', id).select().single()
}

export function sendAdminMessage(requestId, adminId, message) {
  return supabase
    .from('service_request_messages')
    .insert({ service_request_id: requestId, sender_role: 'admin', sender_id: adminId, message })
    .select()
    .single()
}
