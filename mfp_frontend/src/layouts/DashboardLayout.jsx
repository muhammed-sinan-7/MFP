import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";

function DashboardLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="h-[100dvh] flex bg-gray-50 text-gray-900 overflow-hidden">

      {/* Desktop Sidebar */}
      <Sidebar className="hidden lg:flex" />

      {/* Mobile Sidebar Drawer */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-[1px] lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}
      <Sidebar
        className={`fixed left-0 top-0 z-50 h-[100dvh] transform transition-transform duration-300 lg:hidden ${
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        onNavigate={() => setMobileSidebarOpen(false)}
        onClose={() => setMobileSidebarOpen(false)}
        showCloseButton
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Topbar */}
        <Topbar onMenuToggle={() => setMobileSidebarOpen(true)} />

        {/* Page Area */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="h-full w-full max-w-[1400px] mx-auto px-3 py-4 sm:px-4 sm:py-5 lg:px-6 lg:py-6">
            <Outlet />
          </div>
        </div>

      </div>
    </div>
  );
}

export default DashboardLayout;
