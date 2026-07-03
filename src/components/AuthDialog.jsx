"use client";

import { useState } from "react";
import { useAuth } from "./AuthProvider";

export function AuthDialog() {
  const {
    authOpen,
    closeAuth,
    loginWithEmail,
    signUpWithEmail,
  } = useAuth();

  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    email: "",
    name: "",
    password: "",
  });
  const [message, setMessage] = useState("");

  if (!authOpen) return null;

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
    setMessage("");
  }

  function submitEmail(event) {
    event.preventDefault();

    const result =
      mode === "login" ? loginWithEmail(form) : signUpWithEmail(form);

    if (!result.ok) {
      setMessage(result.message);
      return;
    }

    setMessage("");
  }

  function switchMode() {
    setMode((current) => (current === "login" ? "signup" : "login"));
    setMessage("");
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 px-4 py-6 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-700">
              Akun Pembaca
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-950">
              {mode === "login" ? "Login untuk bookmark" : "Buat akun baru"}
            </h2>
          </div>

          <button
            aria-label="Tutup login"
            className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-lg font-bold text-slate-600 hover:bg-slate-50"
            onClick={closeAuth}
            type="button"
          >
            x
          </button>
        </div>

        <form className="mt-5 grid gap-3" onSubmit={submitEmail}>
          {mode === "signup" ? (
            <label className="grid gap-1 text-sm font-semibold text-slate-700">
              Nama
              <input
                className="rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-emerald-700"
                onChange={(event) => updateField("name", event.target.value)}
                placeholder="Nama lengkap"
                type="text"
                value={form.name}
              />
            </label>
          ) : null}

          <label className="grid gap-1 text-sm font-semibold text-slate-700">
            Email
            <input
              className="rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-emerald-700"
              onChange={(event) => updateField("email", event.target.value)}
              placeholder="nama@email.com"
              type="email"
              value={form.email}
            />
          </label>

          <label className="grid gap-1 text-sm font-semibold text-slate-700">
            Password
            <input
              className="rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-emerald-700"
              onChange={(event) => updateField("password", event.target.value)}
              placeholder="Minimal 6 karakter"
              type="password"
              value={form.password}
            />
          </label>

          {message ? (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
              {message}
            </p>
          ) : null}

          <button
            className="mt-1 rounded-lg bg-emerald-800 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-900"
            type="submit"
          >
            {mode === "login" ? "Login" : "Sign Up"}
          </button>
        </form>

        <button
          className="mt-4 text-sm font-semibold text-emerald-800 hover:text-emerald-950"
          onClick={switchMode}
          type="button"
        >
          {mode === "login"
            ? "Belum punya akun? Sign up"
            : "Sudah punya akun? Login"}
        </button>
      </div>
    </div>
  );
}
