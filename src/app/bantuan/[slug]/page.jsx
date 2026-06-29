import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { getFooter, getHeader, getHelpItemBySlug } from "@/lib/libraryStore";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const helpItem = await getHelpItemBySlug(slug);

  if (!helpItem) {
    return {
      title: "Bantuan Tidak Ditemukan",
    };
  }

  return {
    title: `${helpItem.label} | Bantuan Perpustakaan Digital Desa`,
    description: helpItem.description,
  };
}

export default async function HelpDetailPage({ params }) {
  const { slug } = await params;
  const [helpItem, header, footer] = await Promise.all([
    getHelpItemBySlug(slug),
    getHeader(),
    getFooter(),
  ]);

  if (!helpItem) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-stone-50 text-slate-950">
      <Header header={header} />
      <main>
        <section className="border-b border-slate-200 bg-white py-14">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <Link
              className="text-sm font-semibold text-emerald-800 hover:text-emerald-950"
              href="/#tentang-kami"
            >
              Kembali ke bantuan
            </Link>
            <p className="mt-6 text-sm font-bold uppercase tracking-[0.18em] text-emerald-700">
              Bantuan
            </p>
            <h1 className="mt-3 text-4xl font-bold text-slate-950">
              {helpItem.label}
            </h1>
          </div>
        </section>

        <section className="bg-stone-50 py-14">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <article className="rounded-lg border border-slate-200 bg-white p-6 text-base leading-8 text-slate-700 shadow-sm">
              {helpItem.description.split(/\n+/).map((paragraph) => (
                <p className="mb-4 last:mb-0" key={paragraph}>
                  {paragraph}
                </p>
              ))}
            </article>
          </div>
        </section>
      </main>
      <Footer footer={footer} />
    </div>
  );
}
