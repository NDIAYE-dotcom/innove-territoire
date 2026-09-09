import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import AdminSidebar from '../dashboard/AdminSidebar'
import './AdminLayout.css'

function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="admin-layout">
      {!isSidebarOpen && (
        <button
          type="button"
          className="admin-layout-toggle"
          onClick={() => setIsSidebarOpen(true)}
          aria-expanded={isSidebarOpen}
          aria-label="Ouvrir le menu SuperAdmin"
        >
          <span />
          <span />
          <span />
        </button>
      )}

      <div className={`admin-layout-sidebar ${isSidebarOpen ? 'is-open' : ''}`}>
        <AdminSidebar onNavigate={() => setIsSidebarOpen(false)} onClose={() => setIsSidebarOpen(false)} />
      </div>

      {isSidebarOpen && (
        <div className="admin-layout-overlay" onClick={() => setIsSidebarOpen(false)} aria-hidden="true" />
      )}

      <main className="admin-layout-content">
        <Outlet />
      </main>
    </div>
  )
}

export default AdminLayout
