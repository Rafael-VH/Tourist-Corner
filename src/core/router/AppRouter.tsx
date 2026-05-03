import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "@/presentation/providers/useAuthStore";
import { Layout } from "@/presentation/widgets/Layout";
import { LoginPage } from "@/presentation/pages/LoginPage";
import { HomePage } from "@/presentation/pages/HomePage";
import { HotelDetailPage } from "@/presentation/pages/HotelDetailPage";
import { RoomDetailPage } from "@/presentation/pages/RoomDetailPage";
import { ManagerDashboardPage } from "@/presentation/pages/ManagerDashboardPage";
import { AdminDashboardPage } from "@/presentation/pages/AdminDashboardPage";
import { HotelManagementPage } from "@/presentation/pages/HotelManagementPage";
import { RoomManagementPage } from "@/presentation/pages/RoomManagementPage";
import { NewHotelPage } from "@/presentation/pages/NewHotelPage";
import { NewRoomPage } from "@/presentation/pages/NewRoomPage";
import { NewRoomTypePage } from "@/presentation/pages/NewRoomTypePage";
import { NewServicePage } from "@/presentation/pages/NewServicePage";

function ProtectedRoute({
  children,
  requireManager = false,
  requireAdmin = false,
}: {
  children: React.ReactNode;
  requireManager?: boolean;
  requireAdmin?: boolean;
}) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireManager && user?.role !== "owner") {
    return <Navigate to="/" replace />;
  }

  if (requireAdmin && user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function AdminRedirect({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuthStore();
  if (isAuthenticated && user?.role === "admin") {
    return <Navigate to="/admin" replace />;
  }
  return <>{children}</>;
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<Layout />}>
          <Route path="/" element={
            <AdminRedirect>
              <HomePage />
            </AdminRedirect>
          } />
          <Route path="/hotel/:id" element={<HotelDetailPage />} />
          <Route path="/room/:id" element={<RoomDetailPage />} />

          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requireManager>
                <ManagerDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/hotel/new"
            element={
              <ProtectedRoute requireManager>
                <NewHotelPage />
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
            path="/dashboard/room/new"
            element={
              <ProtectedRoute requireManager>
                <NewRoomPage />
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
          <Route
            path="/dashboard/room-type/new"
            element={
              <ProtectedRoute requireManager>
                <NewRoomTypePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/service/new"
            element={
              <ProtectedRoute requireManager>
                <NewServicePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/reports"
            element={
              <ProtectedRoute requireManager>
                <div className="min-h-screen bg-[#FDF8F3] dark:bg-[#0F1419] p-8">
                  <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl font-bold text-[#2D1F14] dark:text-[#E2E8F0]">Reportes</h1>
                    <p className="text-[#96785A] dark:text-[#64748B] mt-2">Esta pagina esta en construccion</p>
                  </div>
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/settings"
            element={
              <ProtectedRoute requireManager>
                <div className="min-h-screen bg-[#FDF8F3] dark:bg-[#0F1419] p-8">
                  <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl font-bold text-[#2D1F14] dark:text-[#E2E8F0]">Configuracion</h1>
                    <p className="text-[#96785A] dark:text-[#64748B] mt-2">Esta pagina esta en construccion</p>
                  </div>
                </div>
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
