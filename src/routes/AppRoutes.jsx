import { Navigate, Route, Routes } from "react-router-dom";
import { useSelector } from "react-redux";
import MainLayout from "../components/Layout/MainLayout";
import RoleProtectedRoute from "./RoleProtectedRoute";
import { useMockAuth } from "../context/MockAuthContext";
import { roleHomePaths } from "../services/mockParkingData";

import Login from "../features/backend/pages/Login";
import Unauthorized from "../features/pages/Unauthorized";

import UserDashboard from "../features/dashboard/UserDashboard";
import StaffDashboard from "../features/dashboard/StaffDashboard";
import ManagerDashboard from "../features/dashboard/ManagerDashboard";
import AdminDashboard from "../features/dashboard/AdminDashboard";

import MyQRPassPage from "../features/pages/MyQRPassPage";
import CheckInQRPage from "../features/pages/CheckInQRPage";
import CheckOutQRPage from "../features/pages/CheckOutQRPage";
import MotorbikeFloorStatusPage from "../features/pages/MotorbikeFloorStatusPage";
import CarSlotMapPage from "../features/pages/CarSlotMapPage";
import BuildingManagementPage from "../features/pages/BuildingManagementPage";
import FloorManagementPage from "../features/pages/FloorManagementPage";
import ReportsPage from "../features/pages/ReportsPage";
import UserProfilePage from "../features/pages/UserProfilePage";
import ManagerPricingPackagesPage from "../features/pages/ManagerPricingPackagesPage";
import ManagerMonthlyPassesPage from "../features/pages/ManagerMonthlyPassesPage";
import ManagerStaffAssignmentPage from "../features/pages/ManagerStaffAssignmentPage";
import TempQrCardsPage from "../features/pages/TempQrCardsPage";
import StaffViolationsPage from "../features/pages/StaffViolationsPage";
import AdminVehicleApprovalPage from "../features/pages/AdminVehicleApprovalPage";
import AdminUserApprovalPage from "../features/backend/pages/AdminUserApprovalPage";
import UserBuildingChangeRequestPage from "../features/backend/pages/UserBuildingChangeRequestPage";
import AdminBuildingChangeRequestsPage from "../features/backend/pages/AdminBuildingChangeRequestsPage";
import ManagerViolationTypesPage from "../features/pages/ManagerViolationTypesPage";

const DefaultRedirect = () => {
  const { isAuthenticated: contextAuthenticated, role: contextRole } = useMockAuth();
  const { isAuthenticated: storeAuthenticated, frontendRole } = useSelector((state) => state.auth);
  const isAuthenticated = contextAuthenticated && storeAuthenticated;
  const role = frontendRole || contextRole;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={roleHomePaths[role] || "/login"} replace />;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      <Route element={<MainLayout />}>
        <Route path="/" element={<DefaultRedirect />} />

        <Route element={<RoleProtectedRoute allowedRoles={["ADMIN", "PARKING_MANAGER", "PARKING_STAFF", "USER"]} />}>
          <Route path="/profile" element={<UserProfilePage />} />
        </Route>

        <Route element={<RoleProtectedRoute allowedRoles={["USER"]} />}>
          <Route path="/user/dashboard" element={<UserDashboard />} />
          <Route path="/user/qr-pass" element={<MyQRPassPage />} />
          <Route path="/user/profile" element={<UserProfilePage />} />
          <Route path="/user/building-change" element={<UserBuildingChangeRequestPage />} />
        </Route>

        <Route element={<RoleProtectedRoute allowedRoles={["PARKING_STAFF"]} />}>
          <Route path="/staff/dashboard" element={<StaffDashboard />} />
          <Route path="/staff/check-in" element={<CheckInQRPage />} />
          <Route path="/staff/check-out" element={<CheckOutQRPage />} />
          <Route path="/staff/temp-qr-cards" element={<TempQrCardsPage />} />
          <Route path="/staff/violations" element={<StaffViolationsPage />} />
          <Route path="/staff/motorbike-status" element={<MotorbikeFloorStatusPage />} />
          <Route path="/staff/car-slots" element={<CarSlotMapPage />} />
          <Route path="/staff/building-change" element={<UserBuildingChangeRequestPage />} />
        </Route>

        <Route element={<RoleProtectedRoute allowedRoles={["PARKING_MANAGER"]} />}>
          <Route path="/manager/dashboard" element={<ManagerDashboard />} />
          <Route path="/manager/building" element={<BuildingManagementPage />} />
          <Route path="/manager/floors" element={<FloorManagementPage />} />
          <Route path="/manager/pricing-packages" element={<ManagerPricingPackagesPage />} />
          <Route path="/manager/monthly-passes" element={<ManagerMonthlyPassesPage />} />
          <Route path="/manager/temp-qr-cards" element={<TempQrCardsPage />} />
          <Route path="/manager/staff" element={<ManagerStaffAssignmentPage />} />
          <Route path="/manager/reports" element={<ReportsPage />} />
          <Route path="/manager/violation-types" element={<ManagerViolationTypesPage />} />

        </Route>

        <Route element={<RoleProtectedRoute allowedRoles={["ADMIN"]} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUserApprovalPage />} />
          <Route path="/admin/vehicles" element={<AdminVehicleApprovalPage />} />
          <Route
            path="/admin/building-change-requests"
            element={<AdminBuildingChangeRequestsPage />}
          />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes >
  );
};

export default AppRoutes;
