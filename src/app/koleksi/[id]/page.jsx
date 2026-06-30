import Image from "next/image";
import Link from "next/link";
import { FlipBookReader } from "@/components/FlipBookReader";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { getBookByReaderId, getFooter, getHeader } from "@/lib/libraryStore";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const book = await getBookByReaderId(id);

  if (!book) {
    return {
      title: "Buku Tidak Ditemukan",
    };
  }

  return {
    title: `${book.title} | Reader Perpustakaan Digital Desa`,
    description: book.description,
  };
}

export default async function BookReaderPage({ params }) {
  const { id } = await params;
  const [book, header, footer] = await Promise.all([
    getBookByReaderId(id),
    getHeader(),
    getFooter(),
  ]);

  if (!book) {
    return (
      <div className="min-h-screen bg-stone-50 text-slate-950">
        <Header header={header} />
        <main className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-700">
            Reader Buku
          </p>
          <h1 className="mt-3 text-4xl font-bold text-slate-950">
            Buku tidak ditemukan
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Buku yang kamu buka tidak tersedia atau sudah dipindahkan.
          </p>
          <Link
            className="mt-8 inline-flex rounded-lg bg-emerald-800 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-900"
            href="/koleksi"
          >
            Kembali ke Koleksi
          </Link>
        </main>
        <Footer footer={footer} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 text-slate-950">
      <Header header={header} />
      <main>
        <section className="border-b border-slate-200 bg-white py-14">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[220px_1fr] lg:px-8">
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-gradient-to-br from-emerald-100 to-lime-50 shadow-sm">
              {book.coverUrl ? (
                <div className="relative aspect-[3/4]">
                  <Image
                    alt={`Sampul ${book.title}`}
                    className="object-cover"
                    fill
                    sizes="220px"
                    src={book.coverUrl}
                  />
                </div>
              ) : (
                <div className="grid aspect-[3/4] place-items-center px-6 text-center text-sm font-bold text-emerald-900">
                  Sampul buku belum tersedia
                </div>
              )}
            </div>

            <div>
              <Link
                className="text-sm font-semibold text-emerald-800 hover:text-emerald-950"
                href="/koleksi"
              >
                Kembali ke koleksi
              </Link>
              <p className="mt-6 text-sm font-bold uppercase tracking-[0.18em] text-emerald-700">
                Reader Buku
              </p>
              <h1 className="mt-3 text-4xl font-bold text-slate-950">
                {book.title}
              </h1>
              <div className="mt-4 flex flex-wrap gap-2 text-sm font-semibold text-slate-600">
                {book.categories?.map((category) => (
                  <span
                    className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-800"
                    key={category.id || category.name}
                  >
                    {category.name}
                  </span>
                ))}
                {book.year ? (
                  <span className="rounded-full bg-slate-100 px-3 py-1">
                    {book.year}
                  </span>
                ) : null}
                {book.author ? (
                  <span className="rounded-full bg-slate-100 px-3 py-1">
                    {book.author}
                  </span>
                ) : null}
              </div>
              {book.description ? (
                <p className="mt-5 max-w-3xl text-base leading-7 text-slate-600">
                  {book.description}
                </p>
              ) : null}
            </div>
          </div>
        </section>

        <FlipBookReader pdfUrl={book.pdfUrl} title={book.title} />
      </main>
      <Footer footer={footer} />
    </div>
  );
}
