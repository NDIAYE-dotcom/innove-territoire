import { supabase } from './supabase'

function sanitizeFileName(name) {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9.\-_]/g, '_')
}

export async function uploadFile(bucket, folder, file) {
  const path = `${folder}/${Date.now()}-${sanitizeFileName(file.name)}`

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  })

  return { path: error ? null : path, error }
}

export function getPublicUrl(bucket, path) {
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl
}

// --- SuperAdmin : médiathèque (bucket public "site-assets") ---

export async function listMediaFiles(folder = '') {
  const { data, error } = await supabase.storage.from('site-assets').list(folder, {
    sortBy: { column: 'created_at', order: 'desc' },
  })
  return { data: data ?? [], error }
}

export function deleteMediaFile(path) {
  return supabase.storage.from('site-assets').remove([path])
}
