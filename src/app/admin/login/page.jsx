import Link from "next/link";
import { isUsingDefaultAdminPassword } from "@/lib/adminAuth";

export const metadata = {
  title: "Login Admin | Perpustakaan Digital Desa Sukamaju",
  description: "Login admin untuk mengelola upload buku perpustakaan digital.",
};

export default async function AdminLoginPage({ searchParams }) {
  const params = await searchParams;
  const hasError = params?.error === "1";

  return (
    <main className="grid min-h-screen place-items-center bg-stone-50 px-4 py-12 text-slate-950">
      <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <Link
          className="text-sm font-semibold text-emerald-800 hover:text-emerald-950"
          href="/"
        >
          Kembali ke Beranda
        </Link>

        <div className="mt-6">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-700">
            Area Admin
          </p>
          <h1 className="mt-3 text-3xl font-bold text-slate-950">
            Login Admin
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Masuk untuk mengakses halaman upload buku dan pengelolaan kategori.
          </p>
        </div>

        {hasError ? (
          <div className="mt-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            Password admin salah. Coba lagi.
          </div>
        ) : null}

        {isUsingDefaultAdminPassword() ? (
          <div className="mt-5 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800">
            Mode lokal masih memakai password default. Sebelum dipakai online,
            set <span className="font-bold">ADMIN_PASSWORD</span> di file
            environment.
          </div>
        ) : null}

        <form className="mt-6 grid gap-4" action="/api/admin/login" method="post">
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Password Admin
            <input
              autoComplete="current-password"
              className="h-12 rounded-md border border-slate-200 px-4 text-base font-normal outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
              name="password"
              placeholder="Masukkan password admin"
              required
              type="password"
            />
          </label>

          <button
            className="rounded-lg bg-emerald-800 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-900"
            type="submit"
          >
            Masuk Admin
          </button>
        </form>
      </section>
    </main>
  );
}
