import StudioClient from "./StudioClient";
import { isSanityConfigured } from "@/sanity/env";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Sanity Studio | Perpustakaan Digital Desa",
  robots: {
    index: false,
    follow: false,
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function StudioPage() {
  if (!isSanityConfigured) {
    return (
      <main className="min-h-screen bg-[#0f1018] px-6 py-12 text-slate-100">
        <div className="mx-auto max-w-2xl rounded-lg border border-slate-800 bg-[#151620] p-6 shadow-xl">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-indigo-300">
            Setup Sanity
          </p>
          <h1 className="mt-3 text-3xl font-black text-white">
            Konfigurasi Sanity belum diisi.
          </h1>
          <p className="mt-4 text-sm leading-6 text-slate-300">
            Buat file <code className="text-indigo-200">.env.local</code> dari
            contoh <code className="text-indigo-200">.env.example</code>, lalu
            isi project id dan dataset Sanity.
          </p>
          <pre className="mt-5 overflow-x-auto rounded-md border border-slate-800 bg-slate-950 p-4 text-sm text-slate-200">
{`NEXT_PUBLIC_SANITY_PROJECT_ID=project_id_kamu
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2026-06-29`}
          </pre>
          <p className="mt-5 text-sm leading-6 text-slate-300">
            Setelah itu restart dev server dengan{" "}
            <code className="text-indigo-200">npm run dev</code>. Jika masih
            muncul CorsOriginError, tambahkan origin{" "}
            <code className="text-indigo-200">http://localhost:3000</code> di
            pengaturan CORS project Sanity.
          </p>
        </div>
      </main>
    );
  }

  return <StudioClient />;
}
