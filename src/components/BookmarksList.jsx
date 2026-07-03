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
      {savedBooks.map((book) => (
        <article
          className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
          key={book.id}
        >
          <div className="relative aspect-[2/3] w-full overflow-hidden bg-slate-100">
            {book.coverUrl ? (
              <Image
                alt={`Sampul ${book.title}`}
                className="object-cover object-top"
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                src={book.coverUrl}
              />
            ) : (
              <div className="grid h-full w-full place-items-center bg-emerald-50 text-emerald-900">
                <BookOpen className="h-10 w-10 sm:h-12 sm:w-12" />
              </div>
            )}
          </div>
          <div className="p-4">
            <h3 className="line-clamp-2 text-lg font-bold leading-6 text-slate-950">
              {book.title}
            </h3>
            <p className="mt-2 text-sm font-semibold text-slate-600">
              {[book.author, book.year].filter(Boolean).join(" - ")}
            </p>
            <Link
              className="mt-4 inline-flex rounded-lg bg-slate-950 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-900"
              href={`/koleksi/${book.readerId || book.slug || book.id}`}
            >
              Baca Buku
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}
