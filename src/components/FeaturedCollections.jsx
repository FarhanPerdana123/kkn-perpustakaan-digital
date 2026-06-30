import Image from "next/image";
import Link from "next/link";
import { Icon } from "./icons";

export function FeaturedCollections({
  books,
  eyebrow = "Koleksi Buku Pilihan",
  title = "Buku digital yang sering dibaca warga.",
  emptyTitle = "Belum ada buku yang di-upload.",
  emptyDescription = "Buku yang ditambahkan lewat Sanity Studio akan otomatis tampil di bagian ini.",
  actionHref = "/koleksi",
  actionLabel = "Lihat semua koleksi",
  showAction = true,
}) {
  return (
    <section className="bg-white py-16" id="koleksi">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-700">
              {eyebrow}
            </p>
            <h2 className="mt-3 text-3xl font-bold text-slate-950">
              {title}
            </h2>
          </div>
          {showAction ? (
            <Link
              className="inline-flex w-fit items-center rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              href={actionHref}
            >
              {actionLabel}
            </Link>
          ) : null}
        </div>

        {books.length > 0 ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {books.map((item) => (
            <article
              className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
              key={item.id}
            >
              <div className="flex aspect-[16/10] items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-100 to-lime-50">
                {item.coverUrl ? (
                  <div className="relative h-full w-full">
                    <Image
                    alt={`Sampul ${item.title}`}
                    className="h-full w-full object-cover"
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    src={item.coverUrl}
                  />
                  </div>
                ) : (
                  <div className="grid h-20 w-20 place-items-center rounded-lg bg-white/80 text-emerald-900 shadow-sm">
                    <Icon name="BookOpen" className="h-10 w-10" />
                  </div>
                )}
              </div>
              <div className="p-5">
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-emerald-800">
                  {item.category || "Buku"}
                </span>
                <h3 className="mt-4 text-lg font-bold leading-6 text-slate-950">
                  {item.title}
                </h3>
                <p className="mt-2 min-h-12 text-sm leading-6 text-slate-600">
                  {item.description}
                </p>
                {item.pdfUrl ? (
                  <Link
                    className="mt-5 inline-flex rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-900"
                    href={`/koleksi/${item.readerId || item.slug || item.id}`}
                  >
                    Baca Buku
                  </Link>
                ) : (
                  <span className="mt-5 inline-flex cursor-not-allowed rounded-lg bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-500">
                    File belum tersedia
                  </span>
                )}
              </div>
            </article>
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
            <h3 className="text-lg font-bold text-slate-950">
              {emptyTitle}
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {emptyDescription}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
