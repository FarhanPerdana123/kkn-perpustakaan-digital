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
