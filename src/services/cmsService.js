import { supabase } from './supabase'

// Ces tables sont administrables dès la Phase 8 mais pas encore lues par le
// site public (branchement prévu en Phase 10 — voir docs/ROADMAP.md).

export function fetchAllSiteSections() {
  return supabase.from('site_sections').select('*').order('key', { ascending: true })
}

export function createSiteSection(payload) {
  return supabase.from('site_sections').insert(payload).select().single()
}

export function updateSiteSection(id, payload) {
  return supabase.from('site_sections').update(payload).eq('id', id).select().single()
}

export function deleteSiteSection(id) {
  return supabase.from('site_sections').delete().eq('id', id)
}

export function fetchAllSiteCards() {
  return supabase.from('site_cards').select('*').order('section_key', { ascending: true }).order('order_index', { ascending: true })
}

export function createSiteCard(payload) {
  return supabase.from('site_cards').insert(payload).select().single()
}

export function updateSiteCard(id, payload) {
  return supabase.from('site_cards').update(payload).eq('id', id).select().single()
}

export function deleteSiteCard(id) {
  return supabase.from('site_cards').delete().eq('id', id)
}

export function fetchAllSiteSettings() {
  return supabase.from('site_settings').select('*').order('key', { ascending: true })
}

export function upsertSiteSetting(key, value) {
  return supabase.from('site_settings').upsert({ key, value }, { onConflict: 'key' }).select().single()
}
