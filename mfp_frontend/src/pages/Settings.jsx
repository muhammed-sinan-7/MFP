import { useEffect, useState } from "react";
import { getOrgSettings, updateOrgSettings, getIndustries } from "../services/settingsService";
import { Edit2, Save, X, Upload, ChevronDown } from "lucide-react";
import { toast } from "sonner";

export default function Settings() {
  const [form, setForm] = useState({
    name: "",
    tagline: "",
    industry: "", // Stores the ID for the backend
    logo: null,
  });

  const [industries, setIndustries] = useState([]);
  const [displayIndustryName, setDisplayIndustryName] = useState(""); // Stores the name for the view
  const [preview, setPreview] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSettings();
    fetchIndustries();
  }, []);

  const fetchIndustries = async () => {
    try {
      const res = await getIndustries();
      setIndustries(res.data);
    } catch (err) {
      console.error("Error loading industries", err);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await getOrgSettings();
      const data = res.data;
      setForm({
        name: data.name || "",
        tagline: data.tagline || "",
        industry: data.industry || "", // This is the ID
        logo: null,
      });
      // Set the display name from the serializer's 'industry_name' field
      setDisplayIndustryName(data.industry_name || "Not specified");
      setPreview(data.logo || null);
    } catch (err) {
      console.error("Failed to fetch settings", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setForm((prev) => ({ ...prev, logo: file }));
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    setLoading(true);
    const data = new FormData();
    data.append("name", form.name);
    data.append("tagline", form.tagline);
    data.append("industry", form.industry); // Sending the ID back to Django

    if (form.logo instanceof File) {
      data.append("logo", form.logo);
    }

    try {
      const res = await updateOrgSettings(data);
      // Refresh local display data
      setPreview(res.data.logo || preview);
      setDisplayIndustryName(res.data.industry_name);
      toast.success("Settings updated successfully!");
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      toast.error("Error updating settings");
    } finally {
      setLoading(false);
    }
  };

  const inputStyles = `w-full px-4 py-2 rounded-lg border transition-all duration-200 outline-none appearance-none
    ${isEditing ? "border-blue-300 focus:ring-2 focus:ring-blue-100 bg-white" : "border-transparent bg-gray-50 cursor-not-allowed text-gray-700"}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your organization profile and branding details.</p>
      </div>
      <div className="max-w-3xl bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Organization Settings</h2>
            <p className="text-sm text-gray-500">Manage your company profile and branding</p>
          </div>

          <button
            onClick={() => isEditing ? setIsEditing(false) : setIsEditing(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
              isEditing ? "text-gray-600 hover:bg-gray-100" : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {isEditing ? <><X size={18} /> Cancel</> : <><Edit2 size={18} /> Edit Profile</>}
          </button>
        </div>

        <div className="p-8 space-y-6">
          {/* Logo Section */}
          <div className="flex flex-col sm:flex-row gap-6 items-center border-b border-gray-50 pb-6">
            <div className="relative group">
              {preview ? (
                <img src={preview} className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md" alt="Logo" />
              ) : (
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 border-2 border-dashed">
                  No Logo
                </div>
              )}
              {isEditing && (
                <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full cursor-pointer opacity-100 transition-opacity">
                  <Upload className="text-white" size={20} />
                  <input type="file" className="hidden" onChange={handleLogoChange} />
                </label>
              )}
            </div>
            <div className="text-center sm:text-left">
              <h4 className="font-medium text-gray-700">Company Logo</h4>
              <p className="text-xs text-gray-400 mt-1">PNG, JPG or SVG up to 2MB</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">Organization Name</label>
              <input
                name="name"
                value={form.name}
                disabled={!isEditing}
                onChange={handleChange}
                className={inputStyles}
              />
            </div>

            {/* Industry Dropdown Logic */}
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">Industry</label>
              <div className="relative">
                {isEditing ? (
                  <>
                    <select
                      name="industry"
                      value={form.industry}
                      onChange={handleChange}
                      className={inputStyles}
                    >
                      <option value="">Select Industry</option>
                      {industries.map((ind) => (
                        <option key={ind.id} value={ind.id}>
                          {ind.name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                      <ChevronDown size={16} className="text-gray-400" />
                    </div>
                  </>
                ) : (
                  <input
                    readOnly
                    value={displayIndustryName}
                    className={inputStyles}
                  />
                )}
              </div>
            </div>

            {/* Tagline */}
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">Tagline</label>
              <input
                name="tagline"
                value={form.tagline}
                disabled={!isEditing}
                onChange={handleChange}
                className={inputStyles}
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        {isEditing && (
          <div className="px-8 py-4 bg-gray-50 flex justify-end gap-3 border-t border-gray-100">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:opacity-70"
            >
              <Save size={18} />
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
