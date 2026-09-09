import { supabase } from './supabase'

// Sans emailRedirectTo explicite, Supabase retombe sur la "Site URL" par
// défaut configurée dans le dashboard — qui ne pointe pas forcément vers ce
// serveur de dev local. Résultat : le lien "Confirmer l'adresse email" reçu
// par email redirigeait vers une page vierge. On force donc explicitement le
// retour vers /connexion (l'utilisateur doit de toute façon se reconnecter
// manuellement après confirmation, cf. le message affiché après inscription).
export function signUp({ email, password, firstName, lastName }) {
  return supabase.auth.signUp({
    email,
    password,
    options: {
      data: { first_name: firstName, last_name: lastName },
      emailRedirectTo: `${window.location.origin}/connexion?confirmed=1`,
    },
  })
}

export function signIn({ email, password }) {
  return supabase.auth.signInWithPassword({ email, password })
}

export function signOut() {
  return supabase.auth.signOut()
}

export function requestPasswordReset(email) {
  return supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reinitialiser-mot-de-passe`,
  })
}

export function updatePassword(newPassword) {
  return supabase.auth.updateUser({ password: newPassword })
}

export async function fetchProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, first_name, last_name, phone, organization, function_title, avatar_url, is_active, roles(key, label)')
    .eq('id', userId)
    .single()

  return { data, error }
}
