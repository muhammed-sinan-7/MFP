import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const access = localStorage.getItem("accessToken");
    const orgId = localStorage.getItem("orgId");

    if (access) {
      setUser({
        isAuthenticated: true,
        orgId,
      });
    }

    setLoading(false);
  }, []);

  const login = ({ access, refresh, org }) => {
    localStorage.setItem("accessToken", access);
    localStorage.setItem("refreshToken", refresh);

    if (org) {
      localStorage.setItem("orgId", org.id);
      localStorage.setItem("orgName", org.name);
      localStorage.setItem("role", org.role);
    }

    setUser({ isAuthenticated: true });
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// hook
export const useAuth = () => useContext(AuthContext);
