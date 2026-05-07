import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "@/presentation/providers/useAuthStore";
import { Layout } from "@/presentation/widgets/Layout";
import { AdminLayout } from "@/presentation/widgets/AdminLayout";
import { ManagerLayout } from "@/presentation/widgets/ManagerLayout";
import { LoginPage } from "@/presentation/pages/auth/LoginPage";
import { HomePage } from "@/presentation/pages/client/HomePage";
import { HotelDetailPage } from "@/presentation/pages/client/HotelDetailPage";
import { RoomDetailPage } from "@/presentation/pages/client/RoomDetailPage";
import { ClientProfilePage } from "@/presentation/pages/client/ClientProfilePage";
import { ClientSecurityPage } from "@/presentation/pages/client/ClientSecurityPage";
import { ClientReservationsPage } from "@/presentation/pages/client/ClientReservationsPage";
import { ClientSupportPage } from "@/presentation/pages/client/ClientSupportPage";
import { ManagerDashboardPage } from "@/presentation/pages/manager/ManagerDashboardPage";
import { AdminDashboardPage } from "@/presentation/pages/admin/AdminDashboardPage";
import { AdminCodesPage } from "@/presentation/pages/admin/AdminCodesPage";
import { AdminHotelsPage } from "@/presentation/pages/admin/AdminHotelsPage";
import { AdminRoomsPage } from "@/presentation/pages/admin/AdminRoomsPage";
import { AdminUsersPage } from "@/presentation/pages/admin/AdminUsersPage";
import { HotelManagementPage } from "@/presentation/pages/manager/HotelManagementPage";
import { RoomManagementPage } from "@/presentation/pages/manager/RoomManagementPage";
import { NewHotelPage } from "@/presentation/pages/manager/NewHotelPage";
import { NewRoomPage } from "@/presentation/pages/manager/NewRoomPage";
import { NewRoomTypePage } from "@/presentation/pages/manager/NewRoomTypePage";
import { NewServicePage } from "@/presentation/pages/manager/NewServicePage";
import { CalendarPage } from "@/presentation/pages/manager/CalendarPage";
import { ReservationDetailPage } from "@/presentation/pages/manager/ReservationDetailPage";
import { DashboardHotelsPage } from "@/presentation/pages/manager/DashboardHotelsPage";
import { DashboardRoomsPage } from "@/presentation/pages/manager/DashboardRoomsPage";
import { CustomizePage } from "@/presentation/pages/manager/CustomizePage";

function ProtectedRoute({
  children,
  requireManager = false,
  requireAdmin = false,
  requireClient = false,
}: {
  children: React.ReactNode;
  requireManager?: boolean;
  requireAdmin?: boolean;
  requireClient?: boolean;
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

  if (requireClient && user?.role !== "client") {
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

function OwnerRedirect({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuthStore();
  if (isAuthenticated && user?.role === "owner") {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<Layout />}>
          <Route
            path="/"
            element={
              <AdminRedirect>
                <OwnerRedirect>
                  <HomePage />
                </OwnerRedirect>
              </AdminRedirect>
            }
          />
          <Route
            path="/hotel/:id"
            element={
              <OwnerRedirect>
                <HotelDetailPage />
              </OwnerRedirect>
            }
          />
          <Route path="/room/:id" element={<RoomDetailPage />} />

          <Route
            path="/profile"
            element={
              <ProtectedRoute requireClient>
                <ClientProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/security"
            element={
              <ProtectedRoute requireClient>
                <ClientSecurityPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reservations"
            element={
              <ProtectedRoute requireClient>
                <ClientReservationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/support"
            element={
              <ProtectedRoute requireClient>
                <ClientSupportPage />
              </ProtectedRoute>
            }
          />

          </Route>

        {/* Admin routes — standalone layout (no Navbar/Footer) */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboardPage />} />
          <Route path="codes" element={<AdminCodesPage />} />
          <Route path="hotels" element={<AdminHotelsPage />} />
          <Route path="rooms" element={<AdminRoomsPage />} />
          <Route path="users" element={<AdminUsersPage />} />
        </Route>

        {/* Manager routes — standalone layout (no Navbar/Footer) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute requireManager>
              <ManagerLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<ManagerDashboardPage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="hotels" element={<DashboardHotelsPage />} />
          <Route path="rooms" element={<DashboardRoomsPage />} />
          <Route path="customize" element={<CustomizePage />} />
          <Route path="hotel/new" element={<NewHotelPage />} />
          <Route path="hotel/:id" element={<HotelManagementPage />} />
          <Route path="room/new" element={<NewRoomPage />} />
          <Route path="room/:id" element={<RoomManagementPage />} />
          <Route path="room-type/new" element={<NewRoomTypePage />} />
          <Route path="service/new" element={<NewServicePage />} />
          <Route path="reservation/:id" element={<ReservationDetailPage />} />
          <Route
            path="reports"
            element={
              <div className="min-h-screen p-8">
                <div className="max-w-7xl mx-auto">
                  <h1 className="text-3xl font-bold text-[#2D1F14] dark:text-[#E2E8F0]">
                    Reportes
                  </h1>
                  <p className="text-[#96785A] dark:text-[#64748B] mt-2">
                    Esta pagina esta en construccion
                  </p>
                </div>
              </div>
            }
          />
          <Route
            path="settings"
            element={
              <div className="min-h-screen p-8">
                <div className="max-w-7xl mx-auto">
                  <h1 className="text-3xl font-bold text-[#2D1F14] dark:text-[#E2E8F0]">
                    Configuracion
                  </h1>
                  <p className="text-[#96785A] dark:text-[#64748B] mt-2">
                    Esta pagina esta en construccion
                  </p>
                </div>
              </div>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
