"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "./AuthProvider";

const googleScriptId = "google-identity-services";
const googleScriptSrc = "https://accounts.google.com/gsi/client";

function loadGoogleScript() {
  if (typeof window === "undefined") return Promise.reject();

  if (window.google?.accounts?.id) {
    return Promise.resolve();
  }

  const existingScript = document.getElementById(googleScriptId);

  if (existingScript) {
    return new Promise((resolve, reject) => {
      existingScript.addEventListener("load", resolve, { once: true });
      existingScript.addEventListener("error", reject, { once: true });
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.async = true;
    script.defer = true;
    script.id = googleScriptId;
    script.src = googleScriptSrc;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export function AuthDialog() {
  const { authOpen, closeAuth, loginWithGoogleCredential } = useAuth();
  const googleButtonRef = useRef(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const configMessage = clientId
    ? ""
    : "Google Sign-In belum dikonfigurasi. Tambahkan NEXT_PUBLIC_GOOGLE_CLIENT_ID di .env.local.";

  useEffect(() => {
    if (!authOpen) return;

    let cancelled = false;
    if (!clientId) {
      return;
    }

    loadGoogleScript()
      .then(() => {
        if (cancelled || !googleButtonRef.current) return;

        window.google.accounts.id.initialize({
          callback: async (response) => {
            setLoading(true);
            setMessage("");

            const result = await loginWithGoogleCredential(response.credential);

            setLoading(false);

            if (!result.ok) {
              setMessage(result.message);
            }
          },
          client_id: clientId,
        });

        googleButtonRef.current.innerHTML = "";
        const btnWidth = googleButtonRef.current.clientWidth;
        window.google.accounts.id.renderButton(googleButtonRef.current, {
          logo_alignment: "left",
          shape: "rectangular",
          size: "large",
          text: "continue_with",
          theme: "outline",
          width: btnWidth > 0 ? btnWidth : undefined,
        });
      })
      .catch(() => {
        if (!cancelled) {
          setMessage("Script Google Sign-In gagal dimuat. Periksa koneksi.");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [authOpen, clientId, loginWithGoogleCredential]);

  if (!authOpen) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 px-4 py-6 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-md overflow-hidden rounded-lg border border-slate-200 bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-700 truncate">
              Akun Pembaca
            </p>
            <h2 className="mt-2 text-xl sm:text-2xl font-bold text-slate-950 break-words">
              Login dengan Google
            </h2>
          </div>

          <button
            aria-label="Tutup login"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-slate-200 text-lg font-bold text-slate-600 hover:bg-slate-50"
            onClick={closeAuth}
            type="button"
          >
            x
          </button>
        </div>

        <div className="mt-5 grid gap-4">
          <div
            aria-busy={loading}
            className="min-h-11 w-full"
            ref={googleButtonRef}
          />

          {loading ? (
            <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800">
              Memverifikasi akun Google...
            </p>
          ) : null}

          {configMessage || message ? (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
              {configMessage || message}
            </p>
          ) : null}

          <p className="text-sm leading-6 text-slate-600">
            Sign up dan login hanya menerima akun Google dengan email yang sudah
            terverifikasi.
          </p>
        </div>
      </div>
    </div>
  );
}
