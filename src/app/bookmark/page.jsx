import Link from "next/link";
import { BookmarksList } from "@/components/BookmarksList";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { getBooks, getFooter, getHeader } from "@/lib/libraryStore";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Bookmark Buku | Perpustakaan Digital Desa",
  description: "Daftar buku digital yang disimpan oleh pembaca.",
};

export default async function BookmarkPage() {
  const [books, header, footer] = await Promise.all([
    getBooks(),
    getHeader(),
    getFooter(),
  ]);

  return (
    <div className="min-h-screen bg-stone-50 text-slate-950">
      <Header header={header} />
      <main>
        <section className="border-b border-slate-200 bg-white py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Link
              className="text-sm font-semibold text-emerald-800 hover:text-emerald-950"
              href="/koleksi"
            >
              Kembali ke koleksi
            </Link>
            <p className="mt-6 text-sm font-bold uppercase tracking-[0.18em] text-emerald-700">
              Bookmark
            </p>
            <h1 className="mt-3 text-4xl font-bold text-slate-950">
              Buku yang kamu simpan.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              Daftar ini hanya tampil setelah login dan tersimpan untuk akun
              pembaca yang sedang aktif di perangkat ini.
            </p>
          </div>
        </section>

        <section className="bg-stone-50 py-10 sm:py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <BookmarksList books={books} />
          </div>
        </section>
      </main>
      <Footer footer={footer} />
    </div>
  );
}
