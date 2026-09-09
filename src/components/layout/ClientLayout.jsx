import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import ClientSidebar from '../dashboard/ClientSidebar'
import './ClientLayout.css'

function ClientLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="client-layout">
      {!isSidebarOpen && (
        <button
          type="button"
          className="client-layout-toggle"
          onClick={() => setIsSidebarOpen(true)}
          aria-expanded={isSidebarOpen}
          aria-label="Ouvrir le menu de l'espace client"
        >
          <span />
          <span />
          <span />
        </button>
      )}

      <div className={`client-layout-sidebar ${isSidebarOpen ? 'is-open' : ''}`}>
        <ClientSidebar onNavigate={() => setIsSidebarOpen(false)} onClose={() => setIsSidebarOpen(false)} />
      </div>

      {isSidebarOpen && (
        <div className="client-layout-overlay" onClick={() => setIsSidebarOpen(false)} aria-hidden="true" />
      )}

      <main className="client-layout-content">
        <Outlet />
      </main>
    </div>
  )
}

export default ClientLayout
