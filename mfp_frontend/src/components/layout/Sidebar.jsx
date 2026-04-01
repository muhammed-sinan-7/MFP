import { NavLink } from "react-router-dom";
import { useState } from "react";
import {
  HomeIcon,
  CalendarIcon,
  ChartBarIcon,
  UsersIcon,
  Cog6ToothIcon,
  LinkIcon,
  NewspaperIcon,
  ClipboardDocumentListIcon,
  TrashIcon
} from "@heroicons/react/24/outline";

import { BarChart3 } from "lucide-react";
import { BRAND_LOGO, BRAND_NAME } from "../../config/brand";
import { logoutUser } from "../../services/api";
function Sidebar() {
  const [loggingOut, setLoggingOut] = useState(false);

  const navItems = [
    { name: "Dashboard", icon: HomeIcon, path: "/overview" },
    { name: "Connected Accounts", icon: LinkIcon, path: "/accounts" },
    {
      name: "Post Management",
      icon: ClipboardDocumentListIcon,
      path: "/posts",
    },
    { name: "Schedule", icon: CalendarIcon, path: "/schedule" },
    // { name: "Team Members", icon: UsersIcon, path: "/team" },
    { name: "Analytics", icon: BarChart3, path: "/analytics" },
    { name: "Feeds", icon: NewspaperIcon, path: "/feeds" },
    { name: "Audit Logs", icon: ChartBarIcon, path: "/audit" },
    { name: "Recycle Bin", icon: TrashIcon, path: "/recycle-bin" },
    { name: "Settings", icon: Cog6ToothIcon, path: "/settings" },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col justify-between">
      <div>
        <div className="px-6 py-5">
          <div className="flex items-center gap-3">
            <img src={BRAND_LOGO} alt={BRAND_NAME} className="h-14 w-11 rounded-xl" />
            <div>
              <p className="text-lg font-semibold text-blue-700 leading-none">{BRAND_NAME}</p>
              <p className="text-[11px] text-gray-500 mt-1">One Place, All Platforms</p>
            </div>
          </div>
        </div>

        <nav className="px-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600 hover:bg-gray-100"
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={async () => {
            if (loggingOut) return;
            setLoggingOut(true);
            await logoutUser();
          }}
          disabled={loggingOut}
          className="text-sm text-gray-500 hover:text-gray-800 transition"
        >
          {loggingOut ? "Logging out..." : "Logout"}
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
