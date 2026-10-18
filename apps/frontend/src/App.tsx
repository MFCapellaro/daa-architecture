import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { DirectoryPage } from './pages/admin/DirectoryPage';
import { AdminDirectoryPage } from './pages/admin/AdminDirectoryPage';
import { AdminParticipantsPage } from './pages/admin/AdminParticipantsPage';
import { AdminActivitiesPage } from './pages/admin/AdminActivitiesPage';
import { LoginPage } from './pages/admin/LoginPage';
import { MapPage } from './pages/admin/MapPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Header } from './components/Header';
import { useAuth } from './context/AuthContext';
import { PublicPage } from './pages/PublicPage';
import { UserDashboard } from './pages/UserDashboard';
import { AdminBackoffice } from './pages/AdminBackoffice';
import { UserPortalPage } from './pages/portal/UserPortalPage';
import { PasswordRecoveryPage } from './pages/PasswordRecoveryPage';
import { ActivitiesPage } from './pages/ActivitiesPage';
import { ActivitySubmissionPage } from './pages/portal/ActivitySubmissionPage';

export const AppRoutes = () => {
  const { user, isAuthenticated } = useAuth();

  // 1. VISTA PÚBLICA (Sin Autenticar)
  if (!isAuthenticated) {
    return <PublicPage />;
  }

  // 2. VISTA DE ADMINISTRADOR (Backoffice)
  if (user?.role === 'admin') {
    return <AdminBackoffice />;
  }

  // 3. VISTA DE PARTICIPANTE / DEALER
  return <UserDashboard user={user} />;
};

export function App() {
  const { user } = useAuth();

  return (
    <div className="platform-layout">
      <Header />
      <main className="main-content">
        <Routes>
          {/* ========================================== */}
          {/* 1. RUTAS PÚBLICAS (Lectura / Mapa / Login) */}
          {/* ========================================== */}
          <Route path="/" element={<Navigate to="/map" replace />} />
          <Route path="/directory" element={<DirectoryPage />} />
          <Route path="/activities" element={<ActivitiesPage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/mapa" element={<MapPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin/login" element={<LoginPage />} />
          <Route path="/register" element={<LoginPage />} />
          <Route path="/forgot-password" element={<PasswordRecoveryPage />} />
          <Route path="/reset-password" element={<PasswordRecoveryPage />} />

          {/* ========================================== */}
          {/* 2. RUTA PARTICIPANTE / DEALER              */}
          {/* ========================================== */}
          <Route
            path="/portal/actividades"
            element={
              <ProtectedRoute allowedRoles={['participante', 'dealer']}>
                <ActivitySubmissionPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/portal/*"
            element={
              <ProtectedRoute allowedRoles={['participante', 'dealer', 'admin']}>
                <UserPortalPage />
              </ProtectedRoute>
            }
          />

          {/* ========================================== */}
          {/* 3. RUTAS DE BACKOFFICE (ADMINISTRADOR)     */}
          {/* ========================================== */}
          <Route
            path="/admin/directory"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDirectoryPage/>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/participants"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminParticipantsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/activities"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminActivitiesPage />
              </ProtectedRoute>
            }
          />

          {/* Redirección por defecto según rol */}
          <Route
            path="*"
            element={
              <Navigate
                to={user?.role === 'admin' ? '/admin/directory' : '/map'}
                replace
              />
            }
          />
        </Routes>
      </main>
    </div>
  );
}