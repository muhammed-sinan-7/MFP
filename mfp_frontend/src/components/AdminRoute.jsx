import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthLoadingScreen from "./AuthLoadingScreen";

export default function AdminRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <AuthLoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!user.isStaff && !user.isSuperuser) {
    return <Navigate to="/overview" replace />;
  }

  return children;
}
