import { createContext, useContext, useEffect, useState } from "react";
import {
  clearAuthStorage,
  refreshAccessToken,
  setAccessToken,
} from "../services/api";
import { getCurrentUser } from "../services/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const publicPaths = [
    "/",
    "/login",
    "/register",
    "/verify-otp",
    "/forgot-password",
    "/reset-password",
    "/terms",
    "/privacy",
  ];

  const syncCurrentUser = async () => {
    const { data } = await getCurrentUser();
    const nextUser = {
      isAuthenticated: true,
      id: data.id,
      email: data.email,
      orgId: data.org_id,
      orgName: data.org_name,
      role: data.role,
    };
    setUser(nextUser);
    return nextUser;
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const pathname = window.location.pathname;
      const isPublicPath = publicPaths.some(
        (path) => pathname === path || pathname.startsWith(`${path}/`),
      );

      if (isPublicPath) {
        setLoading(false);
        return;
      }

      try {
        const refreshedAccessToken = await refreshAccessToken();
        if (!refreshedAccessToken) {
          setUser(null);
          return;
        }

        await syncCurrentUser();
      } catch (error) {
        clearAuthStorage();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const handleAuthEvent = (event) => {
      if (event.detail?.type === "logout") {
        clearAuthStorage();
        setUser(null);
      }
    };

    const handleStorage = (event) => {
      if (!event.key || event.key !== "auth:event" || !event.newValue) {
        return;
      }

      try {
        const payload = JSON.parse(event.newValue);
        if (payload.type === "logout") {
          clearAuthStorage();
          setUser(null);
        }
      } catch (error) {
      }
    };

    window.addEventListener("auth:event", handleAuthEvent);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("auth:event", handleAuthEvent);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  useEffect(() => {
    if (!user) {
      return undefined;
    }

    const intervalId = window.setInterval(async () => {
      try {
        const refreshedAccessToken = await refreshAccessToken();
        if (!refreshedAccessToken) {
          clearAuthStorage();
          setUser(null);
          return;
        }

        await syncCurrentUser();
      } catch (error) {
        clearAuthStorage();
        setUser(null);
      }
    }, 10 * 60 * 1000);

    return () => window.clearInterval(intervalId);
  }, [user]);

  const login = ({ access, id, email, org }) => {
    setAccessToken(access);

    setUser({
      isAuthenticated: true,
      id: id ?? null,
      email: email ?? null,
      orgId: org?.id ?? null,
      orgName: org?.name ?? null,
      role: org?.role ?? null,
    });
  };

  const setOrganization = (org) => {
    setUser((prev) => ({
      ...(prev ?? { isAuthenticated: true }),
      orgId: org.id,
      orgName: org.name ?? null,
      role: org.role ?? null,
    }));
  };

  const logout = () => {
    clearAuthStorage();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, setOrganization }}>
      {children}
    </AuthContext.Provider>
  );
};

// hook
export const useAuth = () => useContext(AuthContext);
