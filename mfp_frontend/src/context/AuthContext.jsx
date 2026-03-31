import { createContext, useContext, useEffect, useState } from "react";
import {
  clearAuthStorage,
  getAccessToken,
  refreshAccessToken,
  setAccessToken,
} from "../services/api";
import { getCurrentUser } from "../services/authService";

const AuthContext = createContext();
const AUTH_USER_STORAGE_KEY = "auth:user";

const loadStoredUser = () => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(AUTH_USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
};

const persistUser = (nextUser) => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    if (nextUser) {
      window.localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(nextUser));
      return;
    }

    window.localStorage.removeItem(AUTH_USER_STORAGE_KEY);
  } catch (error) {
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => loadStoredUser());
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
    persistUser(nextUser);
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

      const storedUser = loadStoredUser();
      if (storedUser?.isAuthenticated) {
        setUser(storedUser);
        setLoading(false);
      }

      if (getAccessToken()) {
        try {
          await syncCurrentUser();
          setLoading(false);
          return;
        } catch (error) {
          clearAuthStorage();
          setUser(null);
          persistUser(null);
        }
      }

      try {
        const refreshedAccessToken = await refreshAccessToken();
        if (!refreshedAccessToken) {
          setUser(null);
          persistUser(null);
          return;
        }

        await syncCurrentUser();
      } catch (error) {
        clearAuthStorage();
        setUser(null);
        persistUser(null);
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
        persistUser(null);
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
          persistUser(null);
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
          persistUser(null);
          return;
        }

        await syncCurrentUser();
      } catch (error) {
        clearAuthStorage();
        setUser(null);
        persistUser(null);
      }
    }, 10 * 60 * 1000);

    return () => window.clearInterval(intervalId);
  }, [user]);

  const login = ({ access, id, email, org }) => {
    setAccessToken(access);

    const nextUser = {
      isAuthenticated: true,
      id: id ?? null,
      email: email ?? null,
      orgId: org?.id ?? null,
      orgName: org?.name ?? null,
      role: org?.role ?? null,
    };

    setUser(nextUser);
    persistUser(nextUser);
  };

  const setOrganization = (org) => {
    setUser((prev) => {
      const nextUser = {
        ...(prev ?? { isAuthenticated: true }),
        orgId: org.id,
        orgName: org.name ?? null,
        role: org.role ?? null,
      };

      persistUser(nextUser);
      return nextUser;
    });
  };

  const logout = () => {
    clearAuthStorage();
    setUser(null);
    persistUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, setOrganization }}>
      {children}
    </AuthContext.Provider>
  );
};

// hook
export const useAuth = () => useContext(AuthContext);
