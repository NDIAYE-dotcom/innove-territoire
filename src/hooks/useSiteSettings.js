import { useEffect, useState } from 'react'
import { fetchAllSiteSettings } from '../services/cmsService'

// Phase 10 (CMS) : coordonnées/réseaux sociaux administrables depuis
// /admin/parametres (Phase 8). RLS "site_settings_select_all" autorise déjà
// la lecture publique (using (true)) — même requête que l'admin, pas besoin
// d'un endpoint séparé. Tant qu'une clé n'est pas renseignée, les pages
// publiques gardent leur repli existant plutôt que d'afficher un champ vide.
export default function useSiteSettings() {
  const [settings, setSettings] = useState({})

  useEffect(() => {
    let isMounted = true

    fetchAllSiteSettings().then(({ data, error }) => {
      if (!isMounted || error) return
      const map = {}
      for (const row of data ?? []) {
        if (typeof row.value === 'string' && row.value.trim()) {
          map[row.key] = row.value.trim()
        }
      }
      setSettings(map)
    })

    return () => {
      isMounted = false
    }
  }, [])

  return settings
}
