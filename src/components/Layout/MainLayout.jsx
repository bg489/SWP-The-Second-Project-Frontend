import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import "./Layout.css";

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [sidebarHidden, setSidebarHidden] = useState(() => {
    return localStorage.getItem("sidebar_hidden") === "true";
  });

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const toggleSidebarHidden = () => {
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