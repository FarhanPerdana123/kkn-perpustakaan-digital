"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const AuthContext = createContext(null);

const sessionKey = "podosoko_library_session";

function readJson(key, fallback) {
  if (typeof window === "undefined") return fallback;

  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // localStorage gagal, abaikan agar aplikasi tidak crash
  }
}

function removeItem(key) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(key);
  } catch {
    // abaikan
  }
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function isVerifiedGoogleUser(value) {
  return (
    value &&
    typeof value.id === "string" &&
    value.id.startsWith("google:") &&
    value.provider === "Google" &&
    value.emailVerified === true
  );
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const savedUser = readJson(sessionKey, null);

      if (savedUser && !isVerifiedGoogleUser(savedUser)) {
        removeItem(sessionKey);
        setUser(null);
      } else {
        setUser(savedUser);
      }

      setReady(true);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const saveSession = useCallback((nextUser) => {
    setUser(nextUser);
    writeJson(sessionKey, nextUser);
    setAuthOpen(false);
  }, []);

  const loginWithGoogleCredential = useCallback(
    async (credential) => {
      if (!credential) {
        return {
          ok: false,
          message: "Token Google tidak ditemukan. Silakan coba lagi.",
        };
      }

      try {
        const response = await fetch("/api/auth/google", {
          body: JSON.stringify({ credential }),
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
        });

        const payload = await response.json().catch(() => ({}));

        if (!response.ok || !payload.user) {
          return {
            ok: false,
            message:
              payload.message ||
              "Akun Google belum bisa diverifikasi. Silakan coba lagi.",
          };
        }

        const nextUser = {
          id: `google:${payload.user.googleId}`,
          email: normalizeEmail(payload.user.email),
          emailVerified: true,
          image: payload.user.image || "",
          name: payload.user.name || payload.user.email,
          provider: "Google",
        };

        saveSession(nextUser);

        return { ok: true };
      } catch {
        return {
          ok: false,
          message: "Verifikasi Google gagal terhubung. Silakan coba lagi.",
        };
      }
    },
    [saveSession],
  );

  const logout = useCallback(() => {
    setUser(null);
    removeItem(sessionKey);
  }, []);

  const value = useMemo(
    () => ({
      authOpen,
      closeAuth: () => setAuthOpen(false),
      loginWithGoogleCredential,
      logout,
      openAuth: () => setAuthOpen(true),
      ready,
      user,
    }),
    [
      authOpen,
      loginWithGoogleCredential,
      logout,
      ready,
      user,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth harus dipakai di dalam AuthProvider.");
  }

  return context;
}
