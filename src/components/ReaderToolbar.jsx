"use client";

import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  RotateCcw,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

export function ReaderToolbar({
  currentPage,
  onBack,
  onFullscreen,
  onNext,
  onPrev,
  onResetZoom,
  onZoomIn,
  onZoomOut,
  totalPages,
  zoom,
}) {
  return (
    <div className="flex w-full flex-wrap items-center justify-center gap-2 rounded-lg border border-white/10 bg-slate-950/80 p-3 text-white shadow-xl backdrop-blur">
      <button
        className="inline-flex h-10 items-center gap-2 rounded-md border border-white/10 px-3 text-sm font-semibold text-slate-100 hover:bg-white/10"
        onClick={onBack}
        type="button"
      >
        <ArrowLeft className="h-4 w-4" />
        Koleksi
      </button>
      <button
        aria-label="Halaman sebelumnya"
        className="grid h-10 w-10 place-items-center rounded-md border border-white/10 text-slate-100 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
        disabled={currentPage <= 1}
        onClick={onPrev}
        type="button"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <span className="min-w-36 rounded-md bg-white/10 px-3 py-2 text-center text-sm font-semibold text-slate-100">
        Halaman {currentPage} dari {totalPages || 1}
      </span>
      <button
        aria-label="Halaman berikutnya"
        className="grid h-10 w-10 place-items-center rounded-md border border-white/10 text-slate-100 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
        disabled={currentPage >= totalPages}
        onClick={onNext}
        type="button"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
      <div className="mx-1 hidden h-8 w-px bg-white/10 sm:block" />
      <button
        aria-label="Perkecil"
        className="grid h-10 w-10 place-items-center rounded-md border border-white/10 text-slate-100 hover:bg-white/10"
        onClick={onZoomOut}
        type="button"
      >
        <ZoomOut className="h-5 w-5" />
      </button>
      <span className="w-16 text-center text-xs font-bold text-slate-300">
        {Math.round(zoom * 100)}%
      </span>
      <button
        aria-label="Perbesar"
        className="grid h-10 w-10 place-items-center rounded-md border border-white/10 text-slate-100 hover:bg-white/10"
        onClick={onZoomIn}
        type="button"
      >
        <ZoomIn className="h-5 w-5" />
      </button>
      <button
        aria-label="Reset zoom"
        className="grid h-10 w-10 place-items-center rounded-md border border-white/10 text-slate-100 hover:bg-white/10"
        onClick={onResetZoom}
        type="button"
      >
        <RotateCcw className="h-5 w-5" />
      </button>
      <button
        aria-label="Fullscreen"
        className="grid h-10 w-10 place-items-center rounded-md border border-white/10 text-slate-100 hover:bg-white/10"
        onClick={onFullscreen}
        type="button"
      >
        <Maximize2 className="h-5 w-5" />
      </button>
    </div>
  );
}
