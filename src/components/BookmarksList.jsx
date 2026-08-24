"use client";

import Image from "next/image";
import Link from "next/link";
import { Bookmark, BookOpen } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { readBookmarks } from "./BookmarkButton";
import { useAuth } from "./AuthProvider";

export function BookmarksList({ books }) {
  const { openAuth, ready, user } = useAuth();
  const [bookmarkIds, setBookmarkIds] = useState([]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      if (!ready || !user) {
        setBookmarkIds([]);
        return;
      }

      setBookmarkIds(readBookmarks(user.id).map((item) => item.id));
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [ready, user]);

  const savedBooks = useMemo(() => {
    const idSet = new Set(bookmarkIds);
    return books.filter((book) =>
      idSet.has(book.readerId || book.slug || book.id),
    );
  }, [bookmarkIds, books]);

  if (!ready) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-sm font-semibold text-slate-500">
        Memuat bookmark...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
        <Bookmark className="mx-auto h-10 w-10 text-emerald-800" />
        <h2 className="mt-4 text-xl font-bold text-slate-950">
          Login untuk melihat bookmark
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
          Bookmark disimpan berdasarkan akun pembaca, jadi kamu perlu login atau
          sign up dulu sebelum menyimpan buku.
        </p>
        <button
          className="mt-5 rounded-lg bg-emerald-800 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-900"
          onClick={openAuth}
          type="button"
        >
          Login / Sign Up
        </button>
      </div>
    );
  }

  if (!savedBooks.length) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
        <Bookmark className="mx-auto h-10 w-10 text-emerald-800" />
        <h2 className="mt-4 text-xl font-bold text-slate-950">
          Belum ada buku yang disimpan
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Buka detail buku lalu tekan tombol Bookmark untuk menyimpannya.
        </p>
        <Link
          className="mt-5 inline-flex rounded-lg bg-slate-950 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-900"
          href="/koleksi"
        >
          Jelajahi Koleksi
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {savedBooks.map((book) => {
        const bookHref = `/koleksi/${book.readerId || book.slug || book.id}`;

        return (
          <article
            className="group flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
            key={book.id}
          >
            <Link
              aria-label={`Baca buku ${book.title}`}
              className="group/cover relative aspect-[2/3] w-full overflow-hidden bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
              href={bookHref}
            >
              {book.coverUrl ? (
                <Image
                  alt={`Sampul ${book.title}`}
                  className="object-cover object-top transition-transform duration-300 group-hover/cover:scale-105"
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  src={book.coverUrl}
                />
              ) : (
                <div className="grid h-full w-full place-items-center bg-emerald-50 text-emerald-900 transition-colors group-hover/cover:bg-emerald-100">
                  <BookOpen className="h-10 w-10 sm:h-12 sm:w-12" />
                </div>
              )}
            </Link>
            <div className="flex flex-1 flex-col p-4">
              <h3 className="line-clamp-2 text-lg font-bold leading-6 text-slate-950">
                <Link
                  className="transition-colors hover:text-emerald-800"
                  href={bookHref}
                >
                  {book.title}
                </Link>
              </h3>
              <p className="mt-2 text-sm font-semibold text-slate-600">
                {[book.author, book.year].filter(Boolean).join(" - ")}
              </p>
              <div className="mt-auto pt-4">
                <Link
                  className="inline-flex rounded-lg bg-slate-950 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-900"
                  href={bookHref}
                >
                  Baca Buku
                </Link>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
