import { supabase } from './supabase'

export function updateProfile(userId, fields) {
  return supabase.from('profiles').update(fields).eq('id', userId).select().single()
}

export function fetchMyNotifications(userId) {
  return supabase
    .from('notifications')
    .select('id, type, title, message, link, is_read, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(5)
}

// --- SuperAdmin ---

export function fetchRoles() {
  return supabase.from('roles').select('id, key, label')
}

export function fetchAllProfiles() {
  return supabase
    .from('profiles')
    .select('id, email, first_name, last_name, phone, organization, is_active, created_at, roles(id, key, label)')
    .order('created_at', { ascending: false })
}

export function updateUserRole(userId, roleId) {
  return supabase.from('profiles').update({ role_id: roleId }).eq('id', userId).select().single()
}

export function updateUserActive(userId, isActive) {
  return supabase.from('profiles').update({ is_active: isActive }).eq('id', userId).select().single()
}
