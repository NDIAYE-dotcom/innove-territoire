export const SERVICE_REQUEST_STATUS = {
  new: { label: 'Nouvelle', tone: 'info' },
  in_progress: { label: 'En cours', tone: 'warning' },
  waiting: { label: 'En attente', tone: 'muted' },
  answered: { label: 'Répondu', tone: 'success' },
  completed: { label: 'Terminée', tone: 'success' },
  cancelled: { label: 'Annulée', tone: 'muted' },
}

export const FORMATION_STATUS = {
  draft: { label: 'Brouillon', tone: 'muted' },
  published: { label: 'Ouverte', tone: 'success' },
  archived: { label: 'Archivée', tone: 'muted' },
}

export const ENROLLMENT_STATUS = {
  pending: { label: 'En attente de validation', tone: 'warning' },
  approved: { label: 'Approuvée', tone: 'success' },
  rejected: { label: 'Refusée', tone: 'error' },
  cancelled: { label: 'Annulée', tone: 'muted' },
  completed: { label: 'Terminée', tone: 'success' },
}

export function getStatusMeta(map, status) {
  return map[status] ?? { label: status, tone: 'muted' }
}
