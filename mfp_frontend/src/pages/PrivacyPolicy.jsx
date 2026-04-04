import { Link } from "react-router-dom";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-2xl p-8">
        <h1 className="text-2xl font-semibold text-slate-900">Privacy Policy</h1>
        <p className="text-sm text-slate-500 mt-2">Last updated: March 29, 2026</p>

        <div className="mt-6 space-y-4 text-sm text-slate-700">
          <p>We collect account, authentication, and connected platform metadata required to deliver scheduling and analytics features.</p>
          <p>Access tokens are stored securely and used only for authorized API operations.</p>
          <p>Analytics data and app activity logs are retained for operational monitoring and performance reporting.</p>
          <p>Deleted content in recycle bin is automatically purged based on retention settings.</p>
          <p>
            You can request account disconnection or data cleanup through the{" "}
            <Link to="/support" className="text-blue-600 hover:underline">
              support center
            </Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
