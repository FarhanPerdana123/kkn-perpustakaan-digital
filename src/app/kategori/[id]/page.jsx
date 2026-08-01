import Link from "next/link";
import { notFound } from "next/navigation";
import { FeaturedCollections } from "@/components/FeaturedCollections";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import {
  getBooksByCategoryId,
  getCategoryById,
  getFooter,
  getHeader,
} from "@/lib/libraryStore";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const category = await getCategoryById(id);

  if (!category) {
    return {
      title: "Genre Tidak Ditemukan",
    };
  }

  return {
    title: `${category.name} | Perpustakaan Digital Desa`,
    description: category.description,
  };
}

export default async function CategoryPage({ params }) {
  const { id } = await params;
  const [category, books, header, footer] = await Promise.all([
    getCategoryById(id),
    getBooksByCategoryId(id),
    getHeader(),
    getFooter(),
  ]);

  if (!category) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-stone-50 text-slate-950">
      <Header header={header} />
      <main>
        <section className="border-b border-slate-200 bg-white py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Link
              className="text-sm font-semibold text-emerald-800 hover:text-emerald-950"
              href="/#kategori"
            >
              Kembali ke genre
            </Link>
            <p className="mt-6 text-sm font-bold uppercase tracking-[0.18em] text-emerald-700">
              Genre Buku
            </p>
            <h1 className="mt-3 text-4xl font-bold text-slate-950">
              {category.name}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              {category.description}
            </p>
          </div>
        </section>

        <FeaturedCollections
          books={books}
          emptyDescription="Buku dapat ditambahkan melalui Sanity Studio dengan memilih genre ini."
          emptyTitle={`Belum ada buku untuk genre ${category.name}.`}
          eyebrow="Daftar Buku"
          showAction={false}
          title={`Buku genre ${category.name}`}
        />
      </main>
      <Footer footer={footer} />
    </div>
  );
}
