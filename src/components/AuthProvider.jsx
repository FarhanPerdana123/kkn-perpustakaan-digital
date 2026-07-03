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
const usersKey = "podosoko_library_users";

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

function normalizeText(value) {
  return String(value || "").trim();
}

function isDemoProviderUser(value) {
  return (
    value &&
    typeof value.id === "string" &&
    value.id.endsWith(":demo-user")
  );
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const savedUser = readJson(sessionKey, null);

      if (isDemoProviderUser(savedUser)) {
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

  const signUpWithEmail = useCallback(
    ({ email, name, password }) => {
      const cleanEmail = normalizeEmail(email);
      const cleanName = normalizeText(name);
      const cleanPassword = String(password || "");

      if (!cleanName) {
        return {
          ok: false,
          message: "Nama wajib diisi.",
        };
      }

      if (!cleanEmail) {
        return {
          ok: false,
          message: "Email wajib diisi.",
        };
      }

      if (cleanPassword.length < 6) {
        return {
          ok: false,
          message: "Password minimal 6 karakter.",
        };
      }

      const users = readJson(usersKey, []);
      const exists = users.some((item) => item.email === cleanEmail);

      if (exists) {
        return {
          ok: false,
          message: "Email sudah terdaftar. Silakan login.",
        };
      }

      const nextUser = {
        id: `email:${cleanEmail}`,
        email: cleanEmail,
        name: cleanName,
        password: cleanPassword,
        provider: "Email",
      };

      writeJson(usersKey, [...users, nextUser]);

      saveSession({
        id: nextUser.id,
        email: nextUser.email,
        name: nextUser.name,
        provider: nextUser.provider,
      });

      return { ok: true };
    },
    [saveSession],
  );

  const loginWithEmail = useCallback(
    ({ email, password }) => {
      const cleanEmail = normalizeEmail(email);
      const cleanPassword = String(password || "");

      if (!cleanEmail || !cleanPassword) {
        return {
          ok: false,
          message: "Email dan password wajib diisi.",
        };
      }

      const users = readJson(usersKey, []);
      const found = users.find(
        (item) =>
          item.email === cleanEmail && item.password === cleanPassword,
      );

      if (!found) {
        return {
          ok: false,
          message:
            "Email atau password belum sesuai. Jika belum punya akun, silakan sign up.",
        };
      }

      saveSession({
        id: found.id,
        email: found.email,
        name: found.name,
        provider: found.provider,
      });

      return { ok: true };
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
      loginWithEmail,
      logout,
      openAuth: () => setAuthOpen(true),
      ready,
      signUpWithEmail,
      user,
    }),
    [
      authOpen,
      loginWithEmail,
      logout,
      ready,
      signUpWithEmail,
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
