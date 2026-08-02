import { useState } from "react";
/**
 * @fileoverview Cung cấp component giao diện tái sử dụng MainLayout và hành vi hiển thị liên quan.
 *
 * Luồng chính: Props đầu vào -> xử lý trạng thái cục bộ khi cần -> trả về phần giao diện tái sử dụng.
 * Các chú thích bên dưới mô tả trách nhiệm của từng hàm và khối cấu hình quan trọng.
 */
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import "./Layout.css";

/**
 * Thực hiện nghiệp vụ `MainLayout` (main layout). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
 *
 * @function MainLayout
 * @returns {JSX.Element} Cấu trúc giao diện React của component.
 */
const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /* Callback nội bộ của lời gọi `useState`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  const [sidebarHidden, setSidebarHidden] = useState(() => {
    return localStorage.getItem("sidebar_hidden") === "true";
  });

  /**
   * Thực hiện nghiệp vụ `toggleSidebar` (toggle sidebar). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
   *
   * @function toggleSidebar
   * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
   */
  const toggleSidebar = () => {
    /* Callback nội bộ của lời gọi `setSidebarOpen`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    setSidebarOpen((prev) => !prev);
  };

  /**
   * Thực hiện nghiệp vụ `toggleSidebarHidden` (toggle sidebar hidden). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
   *
   * @function toggleSidebarHidden
   * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
   */
  const toggleSidebarHidden = () => {
    /* Callback nội bộ của lời gọi `setSidebarHidden`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    setSidebarHidden((prev) => {
      const nextValue = !prev;
      localStorage.setItem("sidebar_hidden", String(nextValue));
      return nextValue;
    });
  };

  return (
    <div className="layout-root">
      <Sidebar
        isOpen={sidebarOpen}
        isHidden={sidebarHidden}
        toggleSidebar={toggleSidebar}
      />

      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={toggleSidebar}></div>
      )}

      <div
        className={`layout-main-wrapper ${sidebarHidden ? "sidebar-hidden" : ""
          }`}
      >
        <Header
          toggleSidebar={toggleSidebar}
          sidebarHidden={sidebarHidden}
          toggleSidebarHidden={toggleSidebarHidden}
        />

        <main className="layout-content-area">
          <div className="content-container animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;