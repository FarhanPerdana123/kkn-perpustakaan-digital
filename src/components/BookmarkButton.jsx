"use client";

import { Bookmark, BookmarkCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthProvider";

function getBookmarkKey(userId) {
  return `podosoko_library_bookmarks:${userId}`;
}

function readBookmarks(userId) {
  if (typeof window === "undefined" || !userId) return [];

  try {
    const value = window.localStorage.getItem(getBookmarkKey(userId));
    return value ? JSON.parse(value) : [];
  } catch {
    return [];
  }
}

function writeBookmarks(userId, bookmarks) {
  window.localStorage.setItem(getBookmarkKey(userId), JSON.stringify(bookmarks));
}

export function BookmarkButton({ book }) {
  const { openAuth, ready, user } = useAuth();
  const [saved, setSaved] = useState(false);

  const bookmarkItem = useMemo(
    () => ({
      author: book.author || "",
      coverUrl: book.coverUrl || "",
      id: book.readerId || book.slug || book.id,
      title: book.title,
      year: book.year || "",
    }),
    [book],
  );

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      if (!ready || !user) {
        setSaved(false);
        return;
      }

      const bookmarks = readBookmarks(user.id);
      setSaved(bookmarks.some((item) => item.id === bookmarkItem.id));
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [bookmarkItem.id, ready, user]);

  function toggleBookmark() {
    if (!user) {
      openAuth();
      return;
    }

    const bookmarks = readBookmarks(user.id);
    const isSaved = bookmarks.some((item) => item.id === bookmarkItem.id);
    const nextBookmarks = isSaved
      ? bookmarks.filter((item) => item.id !== bookmarkItem.id)
      : [bookmarkItem, ...bookmarks];

    writeBookmarks(user.id, nextBookmarks);
    setSaved(!isSaved);
  }

  return (
    <button
      className={`inline-flex w-fit items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition ${
        saved
          ? "bg-emerald-800 text-white hover:bg-emerald-900"
          : "border border-slate-200 bg-white text-slate-800 hover:bg-emerald-50 hover:text-emerald-900"
      }`}
      onClick={toggleBookmark}
      type="button"
    >
      {saved ? (
        <BookmarkCheck className="h-4 w-4" />
      ) : (
        <Bookmark className="h-4 w-4" />
      )}
      {saved ? "Tersimpan" : "Bookmark"}
    </button>
  );
}

export { getBookmarkKey, readBookmarks };
