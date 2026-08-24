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
    <section className="bg-white py-10 sm:py-16" id="koleksi">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-700">
              {eyebrow}
            </p>
            <h2 className="mt-3 text-3xl font-bold text-slate-950 sm:text-4xl">
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
          <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-8 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
            {books.map((item) => {
              const bookHref = item.pdfUrl
                ? `/koleksi/${item.readerId || item.slug || item.id}`
                : null;

              return (
                <article
                  className="group flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
                  key={item.id}
                >
                  {bookHref ? (
                    <Link
                      aria-label={`Baca buku ${item.title}`}
                      className="group/cover relative aspect-[2/3] w-full overflow-hidden bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
                      href={bookHref}
                    >
                      {item.coverUrl ? (
                        <Image
                          alt={`Sampul ${item.title}`}
                          className="object-cover object-top transition-transform duration-300 group-hover/cover:scale-105"
                          fill
                          sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 50vw"
                          src={item.coverUrl}
                        />
                      ) : (
                        <div className="grid h-full w-full place-items-center bg-emerald-50 text-emerald-900 transition-colors group-hover/cover:bg-emerald-100">
                          <Icon
                            name="BookOpen"
                            className="h-10 w-10 sm:h-12 sm:w-12"
                          />
                        </div>
                      )}
                    </Link>
                  ) : (
                    <div className="relative aspect-[2/3] w-full overflow-hidden bg-slate-100">
                      {item.coverUrl ? (
                        <Image
                          alt={`Sampul ${item.title}`}
                          className="object-cover object-top"
                          fill
                          sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 50vw"
                          src={item.coverUrl}
                        />
                      ) : (
                        <div className="grid h-full w-full place-items-center bg-emerald-50 text-emerald-900">
                          <Icon
                            name="BookOpen"
                            className="h-10 w-10 sm:h-12 sm:w-12"
                          />
                        </div>
                      )}
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-3 sm:p-5">
                    <div className="flex max-h-14 flex-wrap gap-1 overflow-hidden sm:max-h-none sm:gap-2">
                      {item.categories?.length ? (
                        item.categories.map((category) => (
                          <span
                            className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold uppercase leading-none tracking-wide text-emerald-800 sm:px-3 sm:text-xs"
                            key={category.id || category.name}
                          >
                            {category.name}
                          </span>
                        ))
                      ) : (
                        <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold uppercase leading-none tracking-wide text-emerald-800 sm:px-3 sm:text-xs">
                          Buku
                        </span>
                      )}
                    </div>
                    <h3 className="mt-3 line-clamp-2 text-sm font-bold leading-snug text-slate-950 sm:mt-4 sm:text-lg sm:leading-6">
                      {bookHref ? (
                        <Link
                          className="transition-colors hover:text-emerald-800"
                          href={bookHref}
                        >
                          {item.title}
                        </Link>
                      ) : (
                        item.title
                      )}
                    </h3>
                    <p className="mt-2 hidden min-h-12 text-sm leading-6 text-slate-600 sm:line-clamp-3">
                      {item.description}
                    </p>
                    <div className="mt-auto pt-4 sm:pt-5">
                      {bookHref ? (
                        <Link
                          className="inline-flex rounded-lg bg-slate-950 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-900 sm:px-4 sm:text-sm"
                          href={bookHref}
                        >
                          Baca Buku
                        </Link>
                      ) : (
                        <span className="inline-flex cursor-not-allowed rounded-lg bg-slate-200 px-3 py-2 text-xs font-semibold text-slate-500 sm:px-4 sm:text-sm">
                          File belum tersedia
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
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
