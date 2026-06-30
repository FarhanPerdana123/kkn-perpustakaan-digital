import Link from "next/link";
import { FeaturedCollections } from "@/components/FeaturedCollections";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { getBooks, getFooter, getHeader } from "@/lib/libraryStore";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Semua Koleksi Buku | Perpustakaan Digital Desa",
  description:
    "Daftar seluruh buku digital yang tersedia di Perpustakaan Digital Desa.",
};

export default async function CollectionPage() {
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
              href="/"
            >
              Kembali ke beranda
            </Link>
            <p className="mt-6 text-sm font-bold uppercase tracking-[0.18em] text-emerald-700">
              Semua Koleksi
            </p>
            <h1 className="mt-3 text-4xl font-bold text-slate-950">
              Seluruh buku digital perpustakaan.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              Semua buku yang ditambahkan melalui Sanity Studio akan tampil di
              halaman ini.
            </p>
          </div>
        </section>

        <FeaturedCollections
          books={books}
          emptyDescription="Tambahkan buku melalui Sanity Studio agar koleksi dapat dibaca warga."
          emptyTitle="Belum ada koleksi buku."
          eyebrow="Daftar Buku"
          showAction={false}
          title="Pilih buku yang ingin dibaca."
        />
      </main>
      <Footer footer={footer} />
    </div>
  );
}
