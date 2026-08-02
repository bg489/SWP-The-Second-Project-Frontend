/**
 * @fileoverview Khai báo bản đồ điều hướng, phân quyền truy cập và component tương ứng cho từng đường dẫn.
 *
 * Luồng chính: Dữ liệu đầu vào -> xử lý theo trách nhiệm của module -> xuất kết quả cho lớp gọi.
 * Các chú thích bên dưới mô tả trách nhiệm của từng hàm và khối cấu hình quan trọng.
 */
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import { useMockAuth } from "../context/MockAuthContext";

/**
 * Thực hiện nghiệp vụ `RoleProtectedRoute` (role protected route). Hàm đóng gói một bước xử lý để các phần khác có thể tái sử dụng nhất quán.
 *
 * @function RoleProtectedRoute
 * @param {*} options - Giá trị `options` được hàm sử dụng trong quá trình xử lý.
 * @returns {JSX.Element} Cấu trúc giao diện React của component.
 */
const RoleProtectedRoute = ({ allowedRoles = [] }) => {
  const { isAuthenticated: contextAuthenticated, role: contextRole } = useMockAuth();
  const {
    isAuthenticated: storeAuthenticated,
    frontendRole,
    requiresBuildingSelection,
  /* Callback nội bộ của lời gọi `useSelector`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  } = useSelector((state) => state.auth);
  const isAuthenticated = contextAuthenticated && storeAuthenticated;
  const role = frontendRole || contextRole;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiresBuildingSelection) {
    return <Navigate to="/choose-building" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default RoleProtectedRoute;
