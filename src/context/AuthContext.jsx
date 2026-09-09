import { useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from '../services/supabase'
import * as authService from '../services/authService'
import { AuthContext } from './auth-context'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [deactivatedNotice, setDeactivatedNotice] = useState(false)
  const userIdRef = useRef(null)

  // Centralisé ici (plutôt que dans ClientRoute/AdminRoute) : un compte
  // désactivé par un SuperAdmin (profiles.is_active) ne doit jamais apparaître
  // comme "connecté" ailleurs dans l'app — un seul point de vérité évite les
  // effets de bord pendant le rendu (ex. appeler signOut() dans une route
  // guard déclenchait une boucle de redirections et une rafale d'erreurs 403).
  const loadProfile = useCallback(async (currentUser) => {
    if (!currentUser) {
      setProfile(null)
      return
    }

    const { data } = await authService.fetchProfile(currentUser.id)

    if (data && data.is_active === false) {
      setDeactivatedNotice(true)
      setProfile(null)
      setUser(null)
      userIdRef.current = null
      await authService.signOut()
      return
    }

    setProfile(data ?? null)
  }, [])

  // Référence stable (useCallback) : exposée à des composants qui la mettent
  // en dépendance d'effet (Login.jsx) — une fonction recréée à chaque rendu
  // aurait redéclenché ce cleanup en boucle et effacé le message aussitôt.
  const clearDeactivatedNotice = useCallback(() => setDeactivatedNotice(false), [])

  useEffect(() => {
    let isMounted = true

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!isMounted) return
      const initialUser = session?.user ?? null
      userIdRef.current = initialUser?.id ?? null
      setUser(initialUser)
      await loadProfile(initialUser)
      if (isMounted) setLoading(false)
    })

    const { data: subscription } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const nextUser = session?.user ?? null

      // TOKEN_REFRESHED / USER_UPDATED (ex. changement de mot de passe) concernent
      // le même utilisateur : inutile de re-charger le profil ni de repasser
      // loading à true, ce qui démonterait temporairement les pages protégées
      // (ClientRoute/AdminRoute affichent un loader plein écran tant que loading
      // est true) et effacerait leur état local (ex. message de succès affiché).
      if (userIdRef.current && nextUser?.id === userIdRef.current) {
        setUser(nextUser)
        return
      }

      // Changement d'identité réel (connexion, déconnexion, changement de compte) :
      // loading doit rester true tant que le profil (donc le rôle) n'est pas
      // chargé, sinon un composant qui redirige sur `role` (ex. Login) peut se
      // déclencher avec un rôle encore null et rediriger vers la mauvaise page.
      setLoading(true)
      userIdRef.current = nextUser?.id ?? null
      setUser(nextUser)
      await loadProfile(nextUser)
      setLoading(false)
    })

    return () => {
      isMounted = false
      subscription.subscription.unsubscribe()
    }
  }, [loadProfile])

  const value = {
    user,
    profile,
    role: profile?.roles?.key ?? null,
    loading,
    deactivatedNotice,
    clearDeactivatedNotice,
    signUp: authService.signUp,
    signIn: authService.signIn,
    signOut: authService.signOut,
    requestPasswordReset: authService.requestPasswordReset,
    updatePassword: authService.updatePassword,
    refreshProfile: () => loadProfile(user),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
