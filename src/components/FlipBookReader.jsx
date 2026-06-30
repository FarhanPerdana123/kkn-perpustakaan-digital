"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ReaderToolbar } from "./ReaderToolbar";

const pdfJsUrl = "/pdfjs/pdf.mjs";
const pdfWorkerUrl = "/pdfjs/pdf.worker.min.mjs";

function useReaderSize() {
  const [reader, setReader] = useState({
    width: 420,
    height: 596,
    isMobile: false,
  });

  useEffect(() => {
    let frameId = null;

    function updateSize() {
      if (frameId) {
        cancelAnimationFrame(frameId);
      }

      frameId = requestAnimationFrame(() => {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const isMobile = viewportWidth < 768;

        const pageWidth = isMobile
          ? Math.max(280, Math.min(viewportWidth - 36, 390))
          : Math.max(340, Math.min(Math.floor((viewportWidth - 260) / 2), 430));

        const pageHeight = Math.min(
          Math.round(pageWidth * 1.42),
          isMobile ? viewportHeight - 220 : 640,
        );

        setReader({
          width: pageWidth,
          height: pageHeight,
          isMobile,
        });
      });
    }

    updateSize();
    window.addEventListener("resize", updateSize);

    return () => {
      if (frameId) {
        cancelAnimationFrame(frameId);
      }

      window.removeEventListener("resize", updateSize);
    };
  }, []);

  return reader;
}

function BookPage({ pageNumber, imageUrl, title, width, height, isCover }) {
  return (
    <div
      className={[
        "relative flex shrink-0 flex-col justify-between overflow-hidden bg-[#fffdf7]",
        "border border-slate-300 shadow-2xl",
        isCover ? "rounded-r-md" : "rounded-sm",
      ].join(" ")}
      style={{ width, height }}
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-black/10 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-black/10 to-transparent" />

      <div className="flex min-h-0 flex-1 items-center justify-center bg-[#fffdf7] p-3">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt={`${title} halaman ${pageNumber}`}
            className="max-h-full max-w-full select-none object-contain"
            draggable={false}
            src={imageUrl}
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-center text-sm font-semibold text-slate-500">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-500" />
            <span>Memuat halaman {pageNumber}</span>
          </div>
        )}
      </div>

      <div className="border-t border-slate-200 bg-[#fffdf7] px-4 py-2 text-center text-xs font-semibold text-slate-500">
        Halaman {pageNumber}
      </div>
    </div>
  );
}

function FlipOverlay({
  animation,
  title,
  width,
  height,
  isMobile,
  visiblePagesLength,
}) {
  if (!animation) return null;

  const isNext = animation.direction === "next";

  const overlayLeft = isMobile
    ? 0
    : isNext
      ? visiblePagesLength === 2
        ? width
        : 0
      : 0;

  const transformOrigin = isNext ? "left center" : "right center";
  const animationName = isNext ? "bookFlipNext" : "bookFlipPrev";

  return (
    <div
      className="pointer-events-none absolute top-0 z-50"
      style={{
        left: overlayLeft,
        width,
        height,
        perspective: "1800px",
      }}
    >
      <div
        className="relative h-full w-full"
        style={{
          transformOrigin,
          transformStyle: "preserve-3d",
          animation: `${animationName} 620ms cubic-bezier(0.22, 0.72, 0.22, 1) forwards`,
          willChange: "transform",
        }}
      >
        <div
          className="absolute inset-0 overflow-hidden rounded-sm border border-slate-300 bg-[#fffdf7] shadow-2xl"
          style={{
            backfaceVisibility: "hidden",
          }}
        >
          <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-black/25 to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-black/25 to-transparent" />

          <div className="flex h-[calc(100%-33px)] items-center justify-center bg-[#fffdf7] p-3">
            {animation.frontImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                alt={`${title} halaman ${animation.frontPageNumber}`}
                className="max-h-full max-w-full select-none object-contain"
                draggable={false}
                src={animation.frontImageUrl}
              />
            ) : (
              <div className="text-sm font-semibold text-slate-500">
                Halaman {animation.frontPageNumber}
              </div>
            )}
          </div>

          <div className="border-t border-slate-200 bg-[#fffdf7] px-4 py-2 text-center text-xs font-semibold text-slate-500">
            Halaman {animation.frontPageNumber}
          </div>
        </div>

        <div
          className="absolute inset-0 overflow-hidden rounded-sm border border-slate-300 bg-[#fffdf7] shadow-2xl"
          style={{
            transform: "rotateY(180deg)",
            backfaceVisibility: "hidden",
          }}
        >
          <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-black/25 to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-black/25 to-transparent" />

          <div className="flex h-[calc(100%-33px)] items-center justify-center bg-[#fffdf7] p-3">
            {animation.backImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                alt={`${title} halaman ${animation.backPageNumber}`}
                className="max-h-full max-w-full select-none object-contain"
                draggable={false}
                src={animation.backImageUrl}
              />
            ) : (
              <div className="text-sm font-semibold text-slate-500">
                Halaman {animation.backPageNumber}
              </div>
            )}
          </div>

          <div className="border-t border-slate-200 bg-[#fffdf7] px-4 py-2 text-center text-xs font-semibold text-slate-500">
            Halaman {animation.backPageNumber}
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes bookFlipNext {
          0% {
            transform: rotateY(0deg);
            filter: brightness(1);
          }
          45% {
            filter: brightness(0.92);
          }
          100% {
            transform: rotateY(-180deg);
            filter: brightness(1);
          }
        }

        @keyframes bookFlipPrev {
          0% {
            transform: rotateY(0deg);
            filter: brightness(1);
          }
          45% {
            filter: brightness(0.92);
          }
          100% {
            transform: rotateY(180deg);
            filter: brightness(1);
          }
        }
      `}</style>
    </div>
  );
}

export function FlipBookReader({ pdfUrl, title }) {
  const readerRef = useRef(null);
  const pdfDocumentRef = useRef(null);
  const pageCacheRef = useRef(new Map());
  const pendingPagesRef = useRef(new Set());
  const renderTokenRef = useRef(0);

  const { width, height, isMobile } = useReaderSize();

  const [totalPages, setTotalPages] = useState(0);
  const [pageImages, setPageImages] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(Boolean(pdfUrl));
  const [error, setError] = useState("");
  const [zoom, setZoom] = useState(1);
  const [turning, setTurning] = useState("");
  const [flipAnimation, setFlipAnimation] = useState(null);

  const canRead = totalPages > 0 && !loading && !error;

  const cleanupCache = useCallback(() => {
    pageCacheRef.current.forEach((item) => {
      if (item.objectUrl) {
        URL.revokeObjectURL(item.imageUrl);
      }
    });

    pageCacheRef.current.clear();
    pendingPagesRef.current.clear();
    setPageImages({});
  }, []);

  const renderPage = useCallback(
    async (pageNumber, token) => {
      const pdf = pdfDocumentRef.current;

      if (!pdf) return;
      if (pageNumber < 1 || pageNumber > pdf.numPages) return;
      if (pageCacheRef.current.has(pageNumber)) return;
      if (pendingPagesRef.current.has(pageNumber)) return;

      pendingPagesRef.current.add(pageNumber);

      try {
        const page = await pdf.getPage(pageNumber);

        if (renderTokenRef.current !== token) return;

        const baseViewport = page.getViewport({ scale: 1 });
        const dpr =
          typeof window !== "undefined"
            ? Math.min(window.devicePixelRatio || 1, 1.25)
            : 1;

        const targetPixelWidth = width * dpr;

        let scale = Math.min(
          isMobile ? 1.05 : 1.2,
          Math.max(0.75, targetPixelWidth / baseViewport.width),
        );

        let viewport = page.getViewport({ scale });

        const maxCanvasHeight = isMobile ? 1300 : 1600;

        if (viewport.height > maxCanvasHeight) {
          scale *= maxCanvasHeight / viewport.height;
          viewport = page.getViewport({ scale });
        }

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d", { alpha: false });

        if (!context) {
          throw new Error("Canvas tidak didukung browser.");
        }

        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);

        context.fillStyle = "#fffdf7";
        context.fillRect(0, 0, canvas.width, canvas.height);

        await page.render({
          canvasContext: context,
          viewport,
        }).promise;

        if (renderTokenRef.current !== token) return;

        const blob = await new Promise((resolve) => {
          canvas.toBlob(resolve, "image/jpeg", 0.78);
        });

        const imageUrl = blob
          ? URL.createObjectURL(blob)
          : canvas.toDataURL("image/jpeg", 0.78);

        pageCacheRef.current.set(pageNumber, {
          imageUrl,
          objectUrl: Boolean(blob),
        });

        setPageImages((previous) => ({
          ...previous,
          [pageNumber]: imageUrl,
        }));
      } catch (err) {
        console.error(`Gagal merender halaman ${pageNumber}:`, err);
      } finally {
        pendingPagesRef.current.delete(pageNumber);
      }
    },
    [isMobile, width],
  );

  const getPreloadPages = useCallback(
    (anchorPage) => {
      if (!totalPages) return [];

      const pages = new Set();

      if (isMobile) {
        for (
          let pageNumber = anchorPage - 1;
          pageNumber <= anchorPage + 2;
          pageNumber += 1
        ) {
          if (pageNumber >= 1 && pageNumber <= totalPages) {
            pages.add(pageNumber);
          }
        }
      } else {
        const visiblePages =
          anchorPage === 1 ? [1] : [anchorPage, anchorPage + 1];

        visiblePages.forEach((pageNumber) => {
          if (pageNumber >= 1 && pageNumber <= totalPages) {
            pages.add(pageNumber);
          }
        });

        for (
          let pageNumber = anchorPage - 2;
          pageNumber <= anchorPage + 4;
          pageNumber += 1
        ) {
          if (pageNumber >= 1 && pageNumber <= totalPages) {
            pages.add(pageNumber);
          }
        }
      }

      return Array.from(pages).sort((a, b) => a - b);
    },
    [isMobile, totalPages],
  );

  const pruneCache = useCallback((keepPages) => {
    const keepSet = new Set(keepPages);

    pageCacheRef.current.forEach((item, pageNumber) => {
      if (!keepSet.has(pageNumber)) {
        if (item.objectUrl) {
          URL.revokeObjectURL(item.imageUrl);
        }

        pageCacheRef.current.delete(pageNumber);
      }
    });

    setPageImages((previous) => {
      const next = {};

      Object.entries(previous).forEach(([pageNumber, imageUrl]) => {
        if (keepSet.has(Number(pageNumber))) {
          next[pageNumber] = imageUrl;
        }
      });

      return next;
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    let loadingTask = null;

    async function loadPdf() {
      if (!pdfUrl) {
        setError("File buku belum tersedia atau gagal dimuat.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");
      setTotalPages(0);
      setCurrentPage(1);
      cleanupCache();

      renderTokenRef.current += 1;
      const token = renderTokenRef.current;

      try {
        const pdfjsLib = await Function(
          "url",
          "return import(url)",
        )(pdfJsUrl);

        pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
          pdfWorkerUrl,
          window.location.origin,
        ).toString();

        loadingTask = pdfjsLib.getDocument({
          url: pdfUrl,
          withCredentials: false,
          disableStream: false,
          disableRange: false,
          disableAutoFetch: false,
          rangeChunkSize: 65536,
        });

        const pdf = await loadingTask.promise;

        if (cancelled || renderTokenRef.current !== token) return;

        pdfDocumentRef.current = pdf;
        setTotalPages(pdf.numPages);
        setCurrentPage(1);
      } catch (err) {
        console.error(err);

        if (!cancelled) {
          setError("File buku belum tersedia atau gagal dimuat.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadPdf();

    return () => {
      cancelled = true;
      renderTokenRef.current += 1;
      pdfDocumentRef.current = null;
      pendingPagesRef.current.clear();

      if (loadingTask) {
        loadingTask.destroy();
      }

      cleanupCache();
    };
  }, [pdfUrl, cleanupCache]);

  useEffect(() => {
    if (!canRead) return;

    const token = renderTokenRef.current;
    const preloadPages = getPreloadPages(currentPage);

    preloadPages.forEach((pageNumber, index) => {
      window.setTimeout(() => {
        renderPage(pageNumber, token);
      }, index * 30);
    });

    const keepPages = new Set();

    for (
      let pageNumber = currentPage - 4;
      pageNumber <= currentPage + 6;
      pageNumber += 1
    ) {
      if (pageNumber >= 1 && pageNumber <= totalPages) {
        keepPages.add(pageNumber);
      }
    }

    preloadPages.forEach((pageNumber) => keepPages.add(pageNumber));
    pruneCache(Array.from(keepPages));
  }, [
    canRead,
    currentPage,
    getPreloadPages,
    pruneCache,
    renderPage,
    totalPages,
  ]);

  const visiblePages = useMemo(() => {
    if (!totalPages) return [];

    if (isMobile) {
      return [currentPage];
    }

    if (currentPage === 1) {
      return [1];
    }

    return [currentPage, currentPage + 1].filter(
      (pageNumber) => pageNumber <= totalPages,
    );
  }, [currentPage, isMobile, totalPages]);

  function getNextPage() {
    if (!totalPages) return currentPage;

    const nextPage = isMobile
      ? currentPage + 1
      : currentPage === 1
        ? 2
        : currentPage + 2;

    return Math.min(nextPage, totalPages);
  }

  function getPrevPage() {
    if (!totalPages) return currentPage;

    const previousPage = isMobile
      ? currentPage - 1
      : currentPage <= 2
        ? 1
        : currentPage - 2;

    return Math.max(previousPage, 1);
  }

  function goToPage(pageNumber, direction) {
    if (!canRead) return;
    if (pageNumber === currentPage) return;

    const token = renderTokenRef.current;
    const preloadPages = getPreloadPages(pageNumber);

    preloadPages.forEach((item, index) => {
      window.setTimeout(() => {
        renderPage(item, token);
      }, index * 10);
    });

    const activeVisiblePages = isMobile
      ? [currentPage]
      : currentPage === 1
        ? [1]
        : [currentPage, currentPage + 1].filter((item) => item <= totalPages);

    const targetVisiblePages = isMobile
      ? [pageNumber]
      : pageNumber === 1
        ? [1]
        : [pageNumber, pageNumber + 1].filter((item) => item <= totalPages);

    const frontPageNumber =
      direction === "next"
        ? activeVisiblePages[activeVisiblePages.length - 1]
        : activeVisiblePages[0];

    const backPageNumber =
      direction === "next"
        ? targetVisiblePages[0]
        : targetVisiblePages[targetVisiblePages.length - 1];

    setTurning(direction);

    setFlipAnimation({
      direction,
      frontPageNumber,
      frontImageUrl: pageImages[frontPageNumber],
      backPageNumber,
      backImageUrl: pageImages[backPageNumber],
    });

    window.setTimeout(() => {
      setCurrentPage(pageNumber);
    }, 520);

    window.setTimeout(() => {
      setTurning("");
      setFlipAnimation(null);
    }, 650);
  }

  function goPrev() {
    goToPage(getPrevPage(), "prev");
  }

  function goNext() {
    goToPage(getNextPage(), "next");
  }

  function goBack() {
    window.location.href = "/koleksi";
  }

  async function enterFullscreen() {
    if (!document.fullscreenElement && readerRef.current) {
      await readerRef.current.requestFullscreen();
    } else if (document.fullscreenElement) {
      await document.exitFullscreen();
    }
  }

  const spreadStyle = useMemo(
    () => ({
      transform: `scale(${zoom})`,
      transformOrigin: "center center",
      transition: "transform 160ms ease",
      willChange: "transform",
    }),
    [zoom],
  );

  const atStart = currentPage <= 1;
  const atEnd = currentPage >= totalPages;

  return (
    <section
      className="bg-slate-950 px-3 py-8 text-white sm:px-6 lg:px-8"
      ref={readerRef}
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">
            Reader Buku Digital
          </p>
          <h2 className="mt-2 text-2xl font-bold text-white">{title}</h2>
        </div>

        <div className="relative mx-auto flex min-h-[560px] items-center justify-center overflow-hidden rounded-2xl border border-slate-700 bg-[radial-gradient(circle_at_center,#334155_0%,#0f172a_70%)] p-4 shadow-inner sm:min-h-[720px]">
          {loading ? (
            <div className="rounded-lg border border-white/10 bg-slate-950/70 px-6 py-5 text-center text-sm font-semibold text-slate-200">
              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-emerald-400" />
              <p>Menyiapkan dokumen buku...</p>
              <p className="mt-2 text-xs text-slate-400">
                Reader akan tampil setelah struktur PDF terbaca.
              </p>
            </div>
          ) : error ? (
            <div className="max-w-md rounded-lg border border-red-400/30 bg-red-950/30 p-6 text-center">
              <h3 className="text-lg font-bold text-white">
                File buku belum tersedia
              </h3>
              <p className="mt-2 text-sm leading-6 text-red-100">{error}</p>

              <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
                <Link
                  className="rounded-md bg-white px-4 py-2 text-sm font-bold text-slate-950"
                  href="/koleksi"
                >
                  Kembali ke Koleksi
                </Link>

                {pdfUrl ? (
                  <a
                    className="rounded-md border border-white/20 px-4 py-2 text-sm font-bold text-white hover:bg-white/10"
                    href={pdfUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    Buka PDF Asli
                  </a>
                ) : null}
              </div>
            </div>
          ) : (
            <>
              <button
                aria-label="Halaman sebelumnya"
                className="absolute left-3 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-slate-950/80 text-white shadow-lg hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-40 md:grid"
                disabled={atStart}
                onClick={goPrev}
                type="button"
              >
                <ChevronLeft className="h-7 w-7" />
              </button>

              <div
                className="relative flex max-w-full items-center justify-center overflow-visible"
                style={{ perspective: "1800px" }}
              >
                {!isMobile && visiblePages.length === 2 ? (
                  <div className="pointer-events-none absolute left-1/2 top-4 z-30 h-[calc(100%-2rem)] w-[2px] -translate-x-1/2 bg-gradient-to-b from-transparent via-black/30 to-transparent" />
                ) : null}

                <div className="relative">
                  <div
                    className={[
                      "flex items-center justify-center",
                      visiblePages.length === 2 ? "gap-0" : "",
                    ].join(" ")}
                    style={spreadStyle}
                  >
                    {visiblePages.map((pageNumber, index) => (
                      <BookPage
                        key={pageNumber}
                        pageNumber={pageNumber}
                        imageUrl={pageImages[pageNumber]}
                        title={title}
                        width={width}
                        height={height}
                        isCover={pageNumber === 1 || index === 0}
                      />
                    ))}
                  </div>

                  <FlipOverlay
                    animation={flipAnimation}
                    title={title}
                    width={width}
                    height={height}
                    isMobile={isMobile}
                    visiblePagesLength={visiblePages.length}
                  />
                </div>
              </div>

              <button
                aria-label="Halaman berikutnya"
                className="absolute right-3 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-slate-950/80 text-white shadow-lg hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-40 md:grid"
                disabled={atEnd}
                onClick={goNext}
                type="button"
              >
                <ChevronRight className="h-7 w-7" />
              </button>
            </>
          )}
        </div>

        <div className="mx-auto mt-5 max-w-4xl">
          <ReaderToolbar
            currentPage={canRead ? currentPage : 1}
            onBack={goBack}
            onFullscreen={enterFullscreen}
            onNext={goNext}
            onPrev={goPrev}
            onResetZoom={() => setZoom(1)}
            onZoomIn={() => setZoom((value) => Math.min(value + 0.1, 1.15))}
            onZoomOut={() => setZoom((value) => Math.max(value - 0.1, 0.75))}
            totalPages={canRead ? totalPages : 1}
            zoom={zoom}
          />
        </div>
      </div>
    </section>
  );
}