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
const AUTH_USER_STORAGE_MODE_KEY = "auth:user_mode";

const loadStoredUser = () => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const mode = window.localStorage.getItem(AUTH_USER_STORAGE_MODE_KEY) || "local";
    const storage = mode === "session" ? window.sessionStorage : window.localStorage;
    const raw = storage.getItem(AUTH_USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
};

const persistUser = (nextUser, options = {}) => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    if (nextUser) {
      const persist =
        typeof options.persist === "boolean"
          ? options.persist
          : (window.localStorage.getItem(AUTH_USER_STORAGE_MODE_KEY) || "session") ===
            "local";
      const targetStorage = persist ? window.localStorage : window.sessionStorage;
      const otherStorage = persist ? window.sessionStorage : window.localStorage;

      targetStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(nextUser));
      otherStorage.removeItem(AUTH_USER_STORAGE_KEY);
      window.localStorage.setItem(
        AUTH_USER_STORAGE_MODE_KEY,
        persist ? "local" : "session",
      );
      return;
    }

    window.localStorage.removeItem(AUTH_USER_STORAGE_KEY);
    window.sessionStorage.removeItem(AUTH_USER_STORAGE_KEY);
    window.localStorage.removeItem(AUTH_USER_STORAGE_MODE_KEY);
  } catch (error) {
  }
};

const buildUserFromAuthPayload = (payload) => {
  if (!payload) {
    return null;
  }

  return {
    isAuthenticated: true,
    id: payload.id ?? null,
    email: payload.email ?? null,
    orgId: payload.org_id ?? null,
    orgName: payload.org_name ?? null,
    role: payload.role ?? null,
    isStaff: Boolean(payload.is_staff),
    isSuperuser: Boolean(payload.is_superuser),
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => loadStoredUser());
  const [loading, setLoading] = useState(true);
  const AUTH_BOOTSTRAP_TIMEOUT_MS = 8000;
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
    const nextUser = buildUserFromAuthPayload(data);
    setUser(nextUser);
    persistUser(nextUser);
    return nextUser;
  };

  useEffect(() => {
    const initializeAuth = async () => {
      let finished = false;
      const timeoutId = window.setTimeout(() => {
        if (!finished) {
          setLoading(false);
        }
      }, AUTH_BOOTSTRAP_TIMEOUT_MS);

      const pathname = window.location.pathname;
      const isPublicPath = publicPaths.some(
        (path) => pathname === path || pathname.startsWith(`${path}/`),
      );
      const storedUser = loadStoredUser();
      const hasAccessToken = Boolean(getAccessToken());
      const hasStoredSession = Boolean(storedUser?.isAuthenticated);

      // On public routes, never trust stale stored user without an access token.
      // This prevents protected dashboard mounts (and 401 spam) on /login.
      if (isPublicPath && !hasAccessToken) {
        setUser(null);
        setLoading(false);
        return;
      }

      if (hasStoredSession) {
        setUser(storedUser);
      }

      if (hasAccessToken) {
        try {
          await syncCurrentUser();
          setLoading(false);
          return;
        } catch (error) {
          const status = error?.response?.status;
          if (status === 401) {
            clearAuthStorage();
            setUser(null);
            persistUser(null);
          } else if (hasStoredSession) {
            setLoading(false);
            return;
          }
        }
      }

      try {
        const refreshPayload = await refreshAccessToken();
        if (!refreshPayload?.access) {
          setUser(null);
          persistUser(null);
          return;
        }

        if (refreshPayload.id) {
          const nextUser = buildUserFromAuthPayload(refreshPayload);
          setUser(nextUser);
          persistUser(nextUser);
        } else {
          await syncCurrentUser();
        }
      } catch (error) {
        const status = error?.response?.status;
        if (status === 401) {
          clearAuthStorage();
          setUser(null);
          persistUser(null);
        }
      } finally {
        finished = true;
        window.clearTimeout(timeoutId);
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
        const refreshPayload = await refreshAccessToken();
        if (!refreshPayload?.access) {
          clearAuthStorage();
          setUser(null);
          persistUser(null);
          return;
        }

        if (refreshPayload.id) {
          const nextUser = buildUserFromAuthPayload(refreshPayload);
          setUser(nextUser);
          persistUser(nextUser);
        }
      } catch (error) {
        if (error?.response?.status === 401) {
          clearAuthStorage();
          setUser(null);
          persistUser(null);
        }
      }
    }, 10 * 60 * 1000);

    return () => window.clearInterval(intervalId);
  }, [user]);

  const login = ({
    access,
    id,
    email,
    org,
    rememberMe = false,
    isStaff = false,
    isSuperuser = false,
  }) => {
    setAccessToken(access, { persist: rememberMe });

    const nextUser = {
      isAuthenticated: true,
      id: id ?? null,
      email: email ?? null,
      orgId: org?.id ?? null,
      orgName: org?.name ?? null,
      role: org?.role ?? null,
      isStaff: Boolean(isStaff),
      isSuperuser: Boolean(isSuperuser),
    };

    setUser(nextUser);
    persistUser(nextUser, { persist: rememberMe });
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
