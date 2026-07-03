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
const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
const googleScriptSrc = "https://accounts.google.com/gsi/client";
const googleUserInfoUrl = "https://www.googleapis.com/oauth2/v3/userinfo";

let googleScriptPromise = null;

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

function loadScript(src) {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Browser belum siap."));
  }

  if (document.querySelector(`script[src="${src}"]`)) {
    return Promise.resolve();
  }

  if (!googleScriptPromise) {
    googleScriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.async = true;
      script.defer = true;
      script.src = src;
      script.onload = resolve;
      script.onerror = () => reject(new Error("Google login gagal dimuat."));
      document.head.appendChild(script);
    });
  }

  return googleScriptPromise;
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function normalizeText(value) {
  return String(value || "").trim();
}

function createGuestUser() {
  return {
    id: "guest:local-reader",
    email: "tamu@akun-demo.local",
    name: "Pembaca Tamu",
    provider: "Guest",
  };
}

function isDemoProviderUser(value) {
  return (
    value &&
    typeof value.id === "string" &&
    value.id.endsWith(":demo-user")
  );
}

async function fetchGoogleUser(accessToken) {
  const response = await fetch(googleUserInfoUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Profil Google gagal dibaca.");
  }

  return response.json();
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

  const loginWithGoogle = useCallback(async () => {
    if (!googleClientId) {
      return {
        ok: false,
        message:
          "Google login belum dikonfigurasi. Tambahkan NEXT_PUBLIC_GOOGLE_CLIENT_ID di Vercel Environment Variables.",
      };
    }

    try {
      await loadScript(googleScriptSrc);

      if (!window.google?.accounts?.oauth2) {
        return {
          ok: false,
          message: "Google login belum tersedia di browser ini.",
        };
      }

      const tokenResponse = await new Promise((resolve, reject) => {
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: googleClientId,
          callback: (response) => {
            if (response?.access_token) {
              resolve(response);
              return;
            }

            reject(new Error("Login Google dibatalkan atau gagal."));
          },
          error_callback: () => {
            reject(new Error("Login Google dibatalkan atau gagal."));
          },
          prompt: "select_account",
          scope: "openid email profile",
        });

        tokenClient.requestAccessToken({ prompt: "select_account" });
      });

      const profile = await fetchGoogleUser(tokenResponse.access_token);

      if (!profile?.email) {
        return {
          ok: false,
          message: "Akun Google tidak mengirim email.",
        };
      }

      saveSession({
        id: `google:${profile.sub || profile.email}`,
        email: normalizeEmail(profile.email),
        name: normalizeText(profile.name) || normalizeEmail(profile.email),
        picture: profile.picture || "",
        provider: "Google",
      });

      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        message: error.message || "Login Google gagal.",
      };
    }
  }, [saveSession]);

  const loginAsGuest = useCallback(() => {
    const nextUser = createGuestUser();
    saveSession(nextUser);

    return { ok: true };
  }, [saveSession]);

  const logout = useCallback(() => {
    setUser(null);
    removeItem(sessionKey);
  }, []);

  const value = useMemo(
    () => ({
      authOpen,
      closeAuth: () => setAuthOpen(false),
      loginAsGuest,
      loginWithEmail,
      loginWithGoogle,
      logout,
      openAuth: () => setAuthOpen(true),
      ready,
      signUpWithEmail,
      user,
    }),
    [
      authOpen,
      loginAsGuest,
      loginWithEmail,
      loginWithGoogle,
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
