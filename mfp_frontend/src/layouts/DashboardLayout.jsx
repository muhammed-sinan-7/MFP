import { Outlet } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";

function DashboardLayout() {
  return (
    <div className="h-[100dvh] flex bg-gray-50 text-gray-900 overflow-hidden">

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Topbar */}
        <Topbar />

        {/* Page Area */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="h-full w-full max-w-[1400px] mx-auto px-6 py-6">
            <Outlet />
          </div>
        </div>

      </div>
    </div>
  );
}

export default DashboardLayout;