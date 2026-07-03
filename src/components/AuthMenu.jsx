"use client";

import { LogOut, UserRound } from "lucide-react";
import { useAuth } from "./AuthProvider";

export function AuthMenu({ compact = false }) {
  const { logout, openAuth, ready, user } = useAuth();

  if (!ready) {
    return (
      <span className="inline-flex h-10 w-full rounded-lg bg-slate-100 lg:w-24" />
    );
  }

  if (!user) {
    return (
      <button
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-800 px-3 py-2 text-sm font-bold text-white hover:bg-emerald-900 lg:w-auto"
        onClick={openAuth}
        type="button"
      >
        <UserRound className="h-4 w-4" />
        Login
      </button>
    );
  }

  if (compact) {
    return (
      <div className="grid gap-2">
        <div className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-950">
          {user.name}
        </div>
        <button
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
          onClick={logout}
          type="button"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="max-w-36 truncate rounded-lg bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-950">
        {user.name}
      </span>
      <button
        aria-label="Logout"
        className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
        onClick={logout}
        type="button"
      >
        <LogOut className="h-4 w-4" />
      </button>
    </div>
  );
}
