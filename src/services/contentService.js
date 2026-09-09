import { supabase } from './supabase'

export function fetchDomains() {
  return supabase.from('domains').select('id, slug, title').eq('is_active', true).order('order_index')
}

export function fetchServices() {
  return supabase.from('services').select('id, slug, title, domain_id').eq('is_active', true).order('order_index')
}
