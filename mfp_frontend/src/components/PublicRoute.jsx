import { Navigate } from "react-router-dom";

function PublicRoute({ children }) {
  const accessToken = localStorage.getItem("accessToken");
  const orgId = localStorage.getItem("orgId");

  if (accessToken) {
    if (!orgId) {
      return <Navigate to="/onboarding" replace />;
    }

    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default PublicRoute;