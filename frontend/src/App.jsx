import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminLayout from "./layout/AdminLayout";
import FireFighterLayout from "./layout/FireFighterLayout";
import PilotLayout from "./layout/PilotLayout";

///common

import LoginForm from "./components/common/login/LoginForm";
import ProtectedRoute from "./components/common/auth/ProtectedRoute";
import RedirectIfLoggedIn from "./components/common/auth/RedirectIfLoggedIn";
import NotAccessToYou from "./components/common/notaccesstoyou";
import RoleProtectedRoute from "./components/common/auth/RoleProtectedRoute";
import { ThemeProvider } from "./Context/ThemeContext";
import { Toaster } from "react-hot-toast";

// Admin Pages

import AdminDroneMonitoring from "./pages/admin/AdminDroneMonitoring";
import VehicleManagementPage from "./pages/admin/AdminVehicles";
import DroneDetailsPage from "./pages/admin/DroneDetails";
import SOPManagement from "./pages/admin/AdminSop";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserRoles from "./pages/admin/UserRole";
import AdminLog from "./pages/admin/AdminLog";
import StationContext from "./components/admin/admin-station/StationContext";

// Fire Fighter Pages
import ConfirmLocation from "./pages/fire-fighter/ConfirmLocation";
import VehicleDroneSelection from "./pages/fire-fighter/VehicleDroneSelection";
import FireFighterPage from "./pages/fire-fighter/FireFighterPage";
import MapTogglePage from "./pages/fire-fighter/MapToggle";
import LiveIncidentCommand from "./components/fire-fighter/live-incident-command/LiveIncidentCommandScreen";
import ConfirmFowardIncidence from "./components/fire-fighter/confirm-forward/ConfirmForward";

// DRIVER
import Vehicle from "./pages/vehicle-driver/vehicle";

// PILOT
import PilotDashboard from "./pages/pilot/PilotDashboard";
import ScheduleMaintenance from "./pages/pilot/SheduleMaintenance";
import PilotLiveIncidentCommand from "./pages/pilot/PilotLiveIncidentCommand";

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <Toaster position="top-center" reverseOrder={false} />
        <Routes>
          <Route
            path="/"
            element={
              <RedirectIfLoggedIn>
                <LoginForm />
              </RedirectIfLoggedIn>
            }
          />
          {/* Admin Side */}
          <Route
            element={
              <ProtectedRoute>
                <RoleProtectedRoute allowedRoles={["Admin"]}>
                  <AdminLayout />
                </RoleProtectedRoute>
              </ProtectedRoute>
            }
          >
            <Route path="/AdminDashboard" element={<AdminDashboard />} />
            <Route path="/live-monitoring" element={<AdminDroneMonitoring />} />
            <Route path="/vehicles" element={<VehicleManagementPage />} />
            <Route path="/drones" element={<DroneDetailsPage />} />
            <Route path="/stations" element={<StationContext />} />
            <Route path="/logs" element={<AdminLog />} />
            <Route path="/sops" element={<SOPManagement />} />
            <Route path="/user-roles" element={<UserRoles />} />
          </Route>

          {/* Firefighter UI */}
          <Route
            element={
              <ProtectedRoute>
                <RoleProtectedRoute
                  allowedRoles={[
                    "Fire Station Command Control"
                  ]}
                >
                  <FireFighterLayout />
                </RoleProtectedRoute>
              </ProtectedRoute>
            }
          >
            <Route path="/confirm-location/:id" element={<ConfirmLocation />} />
            <Route
              path="/vehicle-drone-selection/:id"
              element={<VehicleDroneSelection />}
            />
            <Route
              path="/fire-fighter-dashboard"
              element={<FireFighterPage />}
            />
            <Route
              path="/live-incident-command/:id/:droneId/:vehicleDeviceId"
              element={<LiveIncidentCommand />}
            />
            <Route
              path="/confirm-forward-incidence/:incidentId/:stationName"
              element={<ConfirmFowardIncidence />}
            />
            <Route path="/map-toggle" element={<MapTogglePage />} />
          </Route>

          {/* ---------------- VEHICLE DRIVER ONLY ---------------- */}
          <Route
            path="/vehicle-driver-dashboard"
            element={
              <ProtectedRoute>
                <RoleProtectedRoute allowedRoles={["Vehicle Driver"]}>
                  <Vehicle />
                </RoleProtectedRoute>
              </ProtectedRoute>
            }
          />

          {/* ---------------- PILOT ONLY ---------------- */}
          <Route
            element={
              <ProtectedRoute>
                <RoleProtectedRoute allowedRoles={["Pilot"]}>
                  <PilotLayout />
                </RoleProtectedRoute>
              </ProtectedRoute>
            }
          >

            {/* NO ACCESS */}
            <Route path="/pilot-dashboard" element={<PilotDashboard />} />
            <Route path="/schedule-maintenance" element={<ScheduleMaintenance />} />
            <Route path="/pilot-live-incident-command/:droneId" element={<PilotLiveIncidentCommand />} />

            {/* optional fallback without param */}
            <Route path="/pilot-live-incident-command" element={<PilotLiveIncidentCommand />} />
          </Route>
        </Routes>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
