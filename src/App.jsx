/**
 * @fileoverview Khai báo chức năng frontend của module App.
 *
 * Luồng chính: Dữ liệu đầu vào -> xử lý theo trách nhiệm của module -> xuất kết quả cho lớp gọi.
 * Các chú thích bên dưới mô tả trách nhiệm của từng hàm và khối cấu hình quan trọng.
 */
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { refreshSessionRequest } from "./features/backend/auth/authSlice";
import { MockAuthProvider } from "./context/MockAuthContext";
import AppRoutes from "./routes/AppRoutes";
import "./App.css";

/**
 * Thực hiện nghiệp vụ `AuthBootstrap` (auth bootstrap). Hàm đóng gói một bước xử lý để các phần khác có thể tái sử dụng nhất quán.
 *
 * @function AuthBootstrap
 * @returns {JSX.Element} Cấu trúc giao diện React của component.
 */
const AuthBootstrap = () => {
  const dispatch = useDispatch();

  /* Callback nội bộ của lời gọi `useEffect`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  useEffect(() => {
    if (localStorage.getItem("access_token")) {
      dispatch(refreshSessionRequest());
    }
  }, [dispatch]);

  return null;
};

/**
 * Thực hiện nghiệp vụ `App` (app). Hàm đóng gói một bước xử lý để các phần khác có thể tái sử dụng nhất quán.
 *
 * @function App
 * @returns {JSX.Element} Cấu trúc giao diện React của component.
 */
function App() {
  return (
    <MockAuthProvider>
      <AuthBootstrap />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </MockAuthProvider>
  );
}

export default App;
