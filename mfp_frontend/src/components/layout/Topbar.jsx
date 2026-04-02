
import { useEffect, useState } from "react";
import { Bars3Icon } from "@heroicons/react/24/outline";
import { useAuth } from "../../context/AuthContext";
import { getOrgSettings } from "../../services/settingsService";

function Topbar({ onMenuToggle }) {
  const [form, setForm] = useState({});
  const { user } = useAuth();
  const orgName = user?.orgName;

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await getOrgSettings();
      const data = res.data;
      setForm({
        name: data.name || "",
        tagline: data.tagline || "",
        industry: data.industry_name || "",
        logo: data.logo,
      });

    } catch (err) {
      console.error("Failed to fetch settings", err);
    }
  };

  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-3 sm:px-4 lg:px-6">
      <div className="flex items-center gap-2 min-w-0">
        <button
          type="button"
          onClick={onMenuToggle}
          className="inline-flex lg:hidden items-center justify-center rounded-lg p-2 text-gray-600 hover:bg-gray-100"
          aria-label="Open menu"
        >
          <Bars3Icon className="h-5 w-5" />
        </button>
        <div className="text-sm font-medium text-gray-700 truncate">
        {form.name || "Workspace"}
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        <div className="text-right max-w-[130px] sm:max-w-[220px]">
          <div className="text-xs sm:text-sm font-medium text-gray-800 truncate">{orgName}</div>
          {/* <div className="text-xs text-gray-500">{form.role || "Admin"}</div> */}
        </div>

        <div className="w-8 h-8 sm:w-9 sm:h-9 bg-blue-600 rounded-full flex justify-center items-center text-white overflow-hidden">
          <img src={form.logo} alt="" className="h-full w-full object-cover" />
        </div>
      </div>
    </div>
  );
}

export default Topbar;
