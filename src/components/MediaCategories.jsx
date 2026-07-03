"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Icon } from "./icons";

const itemsPerPage = 8;

export function MediaCategories({ categories }) {
  const [page, setPage] = useState(0);
  const totalPages = Math.max(1, Math.ceil(categories.length / itemsPerPage));
  const visibleCategories = useMemo(() => {
    const start = page * itemsPerPage;
    return categories.slice(start, start + itemsPerPage);
  }, [categories, page]);

  function goToPage(nextPage) {
    setPage(Math.min(Math.max(nextPage, 0), totalPages - 1));
  }

  return (
    <section
      className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8"
      id="kategori"
    >
      <div className="max-w-2xl">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-700">
          Kategori Buku
        </p>
        <h2 className="mt-3 text-3xl font-bold text-slate-950 sm:text-4xl">
          Temukan bacaan berdasarkan kebutuhan.
        </h2>
      </div>

      <div className="relative mt-6 sm:mt-8">
        <button
          aria-label="Kategori sebelumnya"
          className="absolute left-0 top-1/2 z-10 hidden h-12 w-10 -translate-x-1/2 -translate-y-1/2 rounded-r-md border border-slate-200 bg-white text-2xl font-bold text-slate-600 shadow-sm hover:bg-emerald-50 hover:text-emerald-800 disabled:cursor-not-allowed disabled:opacity-40 md:block"
          disabled={page === 0}
          onClick={() => goToPage(page - 1)}
          type="button"
        >
          &lsaquo;
        </button>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {visibleCategories.map((category) => (
            <Link
              className="group rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md sm:min-h-64 sm:p-6"
              href={`/kategori/${category.id}`}
              key={category.id}
            >
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-50 text-emerald-800 group-hover:bg-emerald-800 group-hover:text-white sm:h-14 sm:w-14">
                <Icon name="BookOpen" className="h-5 w-5 sm:h-7 sm:w-7" />
              </span>
              <h3 className="mt-3 text-sm font-bold leading-snug text-slate-950 sm:mt-5 sm:text-lg">
                {category.name}
              </h3>
              <p className="mt-2 hidden text-sm leading-6 text-slate-600 sm:line-clamp-3 sm:block">
                {category.description}
              </p>
            </Link>
          ))}
        </div>

        <button
          aria-label="Kategori berikutnya"
          className="absolute right-0 top-1/2 z-10 hidden h-12 w-10 -translate-y-1/2 translate-x-1/2 rounded-l-md border border-slate-200 bg-white text-2xl font-bold text-slate-600 shadow-sm hover:bg-emerald-50 hover:text-emerald-800 disabled:cursor-not-allowed disabled:opacity-40 md:block"
          disabled={page >= totalPages - 1}
          onClick={() => goToPage(page + 1)}
          type="button"
        >
          &rsaquo;
        </button>
      </div>

      {totalPages > 1 ? (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 sm:mt-8">
          <button
            aria-label="Halaman kategori sebelumnya"
            className="grid h-10 w-10 place-items-center rounded-md border border-slate-200 bg-white text-lg font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            disabled={page === 0}
            onClick={() => goToPage(page - 1)}
            type="button"
          >
            &larr;
          </button>
          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              aria-label={`Halaman kategori ${index + 1}`}
              className={`grid h-10 min-w-10 place-items-center rounded-md border px-3 text-sm font-bold ${
                page === index
                  ? "border-emerald-800 bg-emerald-800 text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
              key={index}
              onClick={() => goToPage(index)}
              type="button"
            >
              {index + 1}
            </button>
          ))}
          <button
            aria-label="Halaman kategori berikutnya"
            className="grid h-10 w-10 place-items-center rounded-md border border-slate-200 bg-white text-lg font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            disabled={page >= totalPages - 1}
            onClick={() => goToPage(page + 1)}
            type="button"
          >
            &rarr;
          </button>
        </div>
      ) : null}
    </section>
  );
}
