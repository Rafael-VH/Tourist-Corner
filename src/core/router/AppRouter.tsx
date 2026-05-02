import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/presentation/providers/useAuthStore';
import { Layout } from '@/presentation/widgets/Layout';
import { LoginPage } from '@/presentation/pages/LoginPage';
import { HomePage } from '@/presentation/pages/HomePage';
import { HotelDetailPage } from '@/presentation/pages/HotelDetailPage';
import { RoomDetailPage } from '@/presentation/pages/RoomDetailPage';
import { ManagerDashboardPage } from '@/presentation/pages/ManagerDashboardPage';
import { HotelManagementPage } from '@/presentation/pages/HotelManagementPage';
import { RoomManagementPage } from '@/presentation/pages/RoomManagementPage';

function ProtectedRoute({ children, requireManager = false }: { children: React.ReactNode; requireManager?: boolean }) {
  const { isAuthenticated, user } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (requireManager && user?.role !== 'manager') {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/hotel/:id" element={<HotelDetailPage />} />
          <Route path="/room/:id" element={<RoomDetailPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requireManager>
                <ManagerDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/hotel/:id"
            element={
              <ProtectedRoute requireManager>
                <HotelManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/room/:id"
            element={
              <ProtectedRoute requireManager>
                <RoomManagementPage />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
