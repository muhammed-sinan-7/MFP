
import { useEffect, useState } from "react";
import { getOrgSettings } from "../../services/settingsService";

function Topbar(){
  const [form,setForm] = useState([])
  const orgName = localStorage.getItem("orgName");
  const role = localStorage.getItem("role");

  useEffect(()=>{
    fetchSettings()
  },[])

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
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div className="text-sm font-medium text-gray-700">
        {form.name || "Workspace"}
      </div>

      <div className="flex items-center gap-6">
        <div className="text-right">
          <div className="text-sm font-medium text-gray-800">{orgName}</div>
          {/* <div className="text-xs text-gray-500">{form.role || "Admin"}</div> */}
        </div>

        <div className="w-9 h-9 bg-blue-600 rounded-full flex justify-center items-center text-white">
          <img src={form.logo} alt="" />
        </div>
      </div>
    </div>
  );
}

export default Topbar;
