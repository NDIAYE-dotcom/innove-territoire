import { Routes, Route } from 'react-router-dom'
import Home from '../pages/public/Home'
import About from '../pages/public/About'
import Domains from '../pages/public/Domains'
import Services from '../pages/public/Services'
import Formations from '../pages/public/Formations'
import FormationDetail from '../pages/public/FormationDetail'
import Contact from '../pages/public/Contact'
import Login from '../pages/public/Login'
import Register from '../pages/public/Register'
import ForgotPassword from '../pages/public/ForgotPassword'
import ResetPassword from '../pages/public/ResetPassword'
import LegalNotice from '../pages/public/LegalNotice'
import PrivacyPolicy from '../pages/public/PrivacyPolicy'
import NotFound from '../pages/public/NotFound'
import ClientDashboard from '../pages/client/ClientDashboard'
import MyFormations from '../pages/client/MyFormations'
import MyProgress from '../pages/client/MyProgress'
import MyServiceRequests from '../pages/client/MyServiceRequests'
import MyMessages from '../pages/client/MyMessages'
import Profile from '../pages/client/Profile'
import Settings from '../pages/client/Settings'
import AdminDashboard from '../pages/admin/AdminDashboard'
import AdminUsers from '../pages/admin/AdminUsers'
import AdminServiceRequests from '../pages/admin/AdminServiceRequests'
import AdminFormations from '../pages/admin/AdminFormations'
import AdminFormationEditor from '../pages/admin/AdminFormationEditor'
import AdminEnrollments from '../pages/admin/AdminEnrollments'
import AdminContent from '../pages/admin/AdminContent'
import AdminMedia from '../pages/admin/AdminMedia'
import AdminSettings from '../pages/admin/AdminSettings'
import Classroom from '../pages/client/Classroom'
import ClientLayout from '../components/layout/ClientLayout'
import AdminLayout from '../components/layout/AdminLayout'
import ClientRoute from './ClientRoute'
import AdminRoute from './AdminRoute'
import EnrollmentGuard from './EnrollmentGuard'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/a-propos" element={<About />} />
      <Route path="/domaines" element={<Domains />} />
      <Route path="/prestations" element={<Services />} />
      <Route path="/formations" element={<Formations />} />
      <Route path="/formations/:slug" element={<FormationDetail />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/connexion" element={<Login />} />
      <Route path="/inscription" element={<Register />} />
      <Route path="/mot-de-passe-oublie" element={<ForgotPassword />} />
      <Route path="/reinitialiser-mot-de-passe" element={<ResetPassword />} />
      <Route path="/mentions-legales" element={<LegalNotice />} />
      <Route path="/politique-confidentialite" element={<PrivacyPolicy />} />
      <Route
        path="/client"
        element={
          <ClientRoute>
            <ClientLayout />
          </ClientRoute>
        }
      >
        <Route index element={<ClientDashboard />} />
        <Route path="formations" element={<MyFormations />} />
        <Route path="progression" element={<MyProgress />} />
        <Route path="demandes" element={<MyServiceRequests />} />
        <Route path="messages" element={<MyMessages />} />
        <Route path="profil" element={<Profile />} />
        <Route path="parametres" element={<Settings />} />
      </Route>
      <Route
        path="/classe/:slug"
        element={
          <ClientRoute>
            <EnrollmentGuard>
              <Classroom />
            </EnrollmentGuard>
          </ClientRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="utilisateurs" element={<AdminUsers />} />
        <Route path="demandes" element={<AdminServiceRequests />} />
        <Route path="formations" element={<AdminFormations />} />
        <Route path="formations/:id" element={<AdminFormationEditor />} />
        <Route path="inscriptions" element={<AdminEnrollments />} />
        <Route path="contenus" element={<AdminContent />} />
        <Route path="medias" element={<AdminMedia />} />
        <Route path="parametres" element={<AdminSettings />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default AppRoutes
