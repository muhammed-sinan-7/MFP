import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./pages/Register";
import VerifyOtp from "./pages/VerifyOtp";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Onboarding from "./pages/Onboarding";
import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import Overview from "./features/Dashboard/Overview";
import "./App.css";
import LandingPage from "./pages/Landing";
import ConnectedAccounts from "./pages/ConnectedAccounts";
import AuditLogs from "./pages/AuditLogs";
import SchedulePage from "./pages/Schedule";
import { Navigate } from "react-router-dom";
import PostsPage from "./pages/PostManagement";
import RecycleBinPage from "./pages/RecycleBin";
import { Toaster } from "sonner";
import Analytics from "./pages/Analytics";
// import CreateSchedulePage from "./pages/CreateSchedulePage";
import News from "./pages/News";
import Settings from "./pages/Settings";
import TermsAndConditions from "./pages/TermsAndConditions";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import LegalConsentBanner from "./components/legal/LegalConsentBanner";

function App() {
  return (
    <>
      <Toaster
        richColors
        expand
        position="top-right"
        toastOptions={{
          style: {
            borderRadius: "12px",
            border: "1px solid #e5e7eb",
            fontSize: "14px",
          },
        }}
      />

      <Router>
        <LegalConsentBanner />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/terms" element={<TermsAndConditions />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />

          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <Onboarding />
              </ProtectedRoute>
            }
          />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/verify-otp"
            element={
              <PublicRoute>
                <VerifyOtp />
              </PublicRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <PublicRoute>
                <ForgotPassword />
              </PublicRoute>
            }
          />
          <Route
            path="/reset-password"
            element={
              <PublicRoute>
                <ResetPassword />
              </PublicRoute>
            }
          />
          <Route
            path="/dashboard"
            element={<Navigate to="/overview" replace />}
          />
          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/overview" element={<Overview />} />
            <Route path="/accounts" element={<ConnectedAccounts />} />
            <Route path="/posts" element={<PostsPage />} />
            <Route path="/schedule" element={<SchedulePage />} />
            {/* <Route path="/schedule/create" element={<CreateSchedulePage />} /> */}
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/team" element={<div>Team</div>} />
            <Route path="/audit" element={<AuditLogs />} />
            <Route path="/recycle-bin" element={<RecycleBinPage />} />
            <Route path="/settings" element={<Settings/>} />
            <Route path="/feeds" element={<News />} />
          </Route>
        </Routes>
      </Router>
    </>
  );
}

export default App;
