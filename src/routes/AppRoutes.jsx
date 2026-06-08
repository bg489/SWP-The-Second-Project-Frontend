import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "../components/Layout/MainLayout";
import RoleProtectedRoute from "./RoleProtectedRoute";

// Public Pages
import Login from "../features/pages/Login";
import Unauthorized from "../features/pages/Unauthorized";
import PlaceholderPage from "../features/pages/PlaceholderPage";

// Dashboards
import UserDashboard from "../features/dashboard/UserDashboard";
import StaffDashboard from "../features/dashboard/StaffDashboard";
import ManagerDashboard from "../features/dashboard/ManagerDashboard";
import AdminDashboard from "../features/dashboard/AdminDashboard";

// Thịnh's Pages
import MyQRPassPage from "../features/pages/MyQRPassPage";
import CheckOutQRPage from "../features/pages/CheckOutQRPage";
import MotorbikeFloorStatusPage from "../features/pages/MotorbikeFloorStatusPage";
import CarSlotMapPage from "../features/pages/CarSlotMapPage";
import BuildingManagementPage from "../features/pages/BuildingManagementPage";
import FloorManagementPage from "../features/pages/FloorManagementPage";
import ReportsPage from "../features/pages/ReportsPage";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Main Layout Nested Routes */}
      <Route element={<MainLayout />}>
        {/* Redirect root to Login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* 1. USER / CUSTOMER ROUTES */}
        <Route element={<RoleProtectedRoute allowedRoles={["User"]} />}>
          <Route path="/user/dashboard" element={<UserDashboard />} />
          <Route path="/user/qr-pass" element={<MyQRPassPage />} />
          <Route
            path="/user/profile"
            element={
              <PlaceholderPage
                title="Hồ sơ cá nhân"
                description="Trang cập nhật thông tin cá nhân của người dùng."
              />
            }
          />
        </Route>

        {/* 2. OPERATIONAL STAFF ROUTES */}
        <Route element={<RoleProtectedRoute allowedRoles={["Staff"]} />}>
          <Route
            path="/staff/dashboard"
            element={
              <PlaceholderPage
                title="Staff Dashboard"
                description="Trang tổng quan vận hành của nhân sự."
              />
            }
          />
          <Route
            path="/staff/check-in"
            element={
              <PlaceholderPage
                title="Quét QR Xe vào"
                description="Trang check-in xe vào bến bằng mã QR."
              />
            }
          />
          <Route path="/staff/check-out" element={<CheckOutQRPage />} />
          <Route path="/staff/motorbike-status" element={<MotorbikeFloorStatusPage />} />
          <Route path="/staff/car-slots" element={<CarSlotMapPage />} />
        </Route>

        {/* 3. DEPARTMENT MANAGER ROUTES */}
        <Route element={<RoleProtectedRoute allowedRoles={["Manager"]} />}>
          <Route
            path="/manager/dashboard"
            element={
              <PlaceholderPage
                title="Manager Dashboard (Chờ tích hợp)"
                description="Trang tổng hợp chung tình hình bãi xe."
              />
            }
          />
          <Route path="/manager/building" element={<BuildingManagementPage />} />
          <Route path="/manager/floors" element={<FloorManagementPage />} />
          <Route path="/manager/reports" element={<ReportsPage />} />
        </Route>

        {/* 4. SYSTEM ADMINISTRATOR ROUTES */}
        <Route element={<RoleProtectedRoute allowedRoles={["Admin"]} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route
            path="/admin/settings"
            element={
              <PlaceholderPage
                title="Cấu hình hệ thống (Admin)"
                description="Thiết lập các tham số toàn cục của bãi gửi xe thông minh."
              />
            }
          />
        </Route>
      </Route>

      {/* Fallback to Login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
