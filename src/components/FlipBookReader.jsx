"use client";

import HTMLFlipBook from "react-pageflip";
import Link from "next/link";
import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ReaderToolbar } from "./ReaderToolbar";

const pdfJsUrl = "/pdfjs-dist/build/pdf.mjs";
const pdfWorkerUrl = "/pdfjs-dist/build/pdf.worker.min.mjs";

function useReaderSize(isFullscreen = false) {
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

        const maxPageWidth = isFullscreen
          ? Math.floor((viewportWidth - (isMobile ? 36 : 150)) / (isMobile ? 1 : 2))
          : isMobile
            ? viewportWidth - 36
            : Math.floor((viewportWidth - 260) / 2);
        const maxPageWidthByHeight = Math.floor(
          (viewportHeight - (isFullscreen ? 32 : isMobile ? 220 : 120)) / 1.42,
        );

        const pageWidth = isMobile
          ? Math.max(
              280,
              Math.min(maxPageWidth, maxPageWidthByHeight, isFullscreen ? 2000 : 390),
            )
          : Math.max(
              340,
              Math.min(maxPageWidth, maxPageWidthByHeight, isFullscreen ? 2000 : 430),
            );

        const pageHeight = Math.min(
          Math.round(pageWidth * 1.42),
          isFullscreen ? viewportHeight - 32 : isMobile ? viewportHeight - 220 : 640,
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
  }, [isFullscreen]);

  return reader;
}

const BookPage = forwardRef(function BookPage(
  { pageNumber, imageUrl, title, isCover },
  ref,
) {
  return (
    <div
      ref={ref}
      className="relative h-full w-full overflow-hidden bg-[#fffdf7]"
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-black/12 via-black/5 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-black/10 via-black/4 to-transparent" />

      {isCover ? (
        <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-br from-white/10 via-transparent to-black/10" />
      ) : null}

      <div className="flex h-[calc(100%-30px)] w-full items-center justify-center bg-[#fffdf7] p-2">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt={`${title} halaman ${pageNumber}`}
            className="h-full w-full select-none object-contain"
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

      <div className="h-[30px] border-t border-slate-200 bg-[#fffdf7] px-4 py-2 text-center text-xs font-semibold text-slate-500">
        Halaman {pageNumber}
      </div>
    </div>
  );
});

function ScrollPage({
  pageNumber,
  imageUrl,
  title,
  zoom,
  onNeedRender,
  onVisible,
}) {
  const pageRef = useRef(null);

  useEffect(() => {
    const element = pageRef.current;

    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];

        if (entry.isIntersecting) {
          onNeedRender(pageNumber);

          if (entry.intersectionRatio >= 0.35) {
            onVisible(pageNumber);
          }
        }
      },
      {
        root: null,
        rootMargin: "700px 0px",
        threshold: [0.15, 0.35, 0.6],
      },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [onNeedRender, onVisible, pageNumber]);

  return (
    <div
      ref={pageRef}
      className="mx-auto mb-6 flex w-full max-w-4xl flex-col items-center"
      data-page-number={pageNumber}
    >
      <div
        className="w-full overflow-hidden rounded-lg bg-[#fffdf7] shadow-[0_18px_45px_rgba(0,0,0,0.25)]"
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: "top center",
        }}
      >
        <div className="flex min-h-[420px] items-center justify-center bg-[#fffdf7] p-3">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt={`${title} halaman ${pageNumber}`}
              className="h-auto w-full select-none object-contain"
              draggable={false}
              src={imageUrl}
            />
          ) : (
            <div className="flex min-h-[420px] w-full flex-col items-center justify-center gap-3 text-center text-sm font-semibold text-slate-500">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-500" />
              <span>Memuat halaman {pageNumber}</span>
            </div>
          )}
        </div>

        <div className="border-t border-slate-200 bg-[#fffdf7] px-4 py-2 text-center text-xs font-semibold text-slate-500">
          Halaman {pageNumber}
        </div>
      </div>
    </div>
  );
}

export function FlipBookReader({ pdfUrl, title }) {
  const readerRef = useRef(null);
  const bookRef = useRef(null);
  const pdfDocumentRef = useRef(null);
  const pageCacheRef = useRef(new Map());
  const pendingPagesRef = useRef(new Set());
  const renderTokenRef = useRef(0);

  const [totalPages, setTotalPages] = useState(0);
  const [pageImages, setPageImages] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(Boolean(pdfUrl));
  const [error, setError] = useState("");
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewMode, setViewMode] = useState(() =>
    typeof window !== "undefined" && window.innerWidth < 768
      ? "scroll"
      : "flip",
  );

  const { width, height, isMobile } = useReaderSize(isFullscreen);

  useEffect(() => {
    if (isMobile) {
      queueMicrotask(() => {
        setViewMode("scroll");
      });
    }
  }, [isMobile]);

  useEffect(() => {
    function syncFullscreenState() {
      setIsFullscreen(document.fullscreenElement === readerRef.current);
    }

    syncFullscreenState();
    document.addEventListener("fullscreenchange", syncFullscreenState);

    return () => {
      document.removeEventListener("fullscreenchange", syncFullscreenState);
    };
  }, []);

  const canRead = totalPages > 0 && !loading && !error;
  const atStart = currentPage <= 1;
  const atEnd = currentPage >= totalPages;

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
          let pageNumber = anchorPage - 1;
          pageNumber <= anchorPage + 3;
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
    const pendingPages = pendingPagesRef.current;

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
        const pdfjsLib = await Function("url", "return import(url)")(
          pdfJsUrl,
        );

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
          cMapUrl: "/pdfjs-dist/cmaps/",
          cMapPacked: true,
          standardFontDataUrl: "/pdfjs-dist/standard_fonts/",
          wasmUrl: "/pdfjs-dist/wasm/",
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
      pendingPages.clear();

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
    const keepPages = new Set();
    const timeoutIds = [];

    preloadPages.forEach((pageNumber, index) => {
      const timeoutId = window.setTimeout(() => {
        renderPage(pageNumber, token);
      }, index * 30);

      timeoutIds.push(timeoutId);
    });

    for (
      let pageNumber = currentPage - 2;
      pageNumber <= currentPage + 4;
      pageNumber += 1
    ) {
      if (pageNumber >= 1 && pageNumber <= totalPages) {
        keepPages.add(pageNumber);
      }
    }

    preloadPages.forEach((pageNumber) => keepPages.add(pageNumber));

    const pruneTimeoutId = window.setTimeout(() => {
      pruneCache(Array.from(keepPages));
    }, 120);

    timeoutIds.push(pruneTimeoutId);

    return () => {
      timeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId));
    };
  }, [
    canRead,
    currentPage,
    getPreloadPages,
    pruneCache,
    renderPage,
    totalPages,
  ]);

  function isPageReady(pageNumber) {
    return Boolean(pageImages[pageNumber]);
  }

  function getNextTargetPage() {
    return Math.min(currentPage + (isMobile ? 1 : 2), totalPages);
  }

  function getPrevTargetPage() {
    return Math.max(currentPage - (isMobile ? 1 : 2), 1);
  }

  function scrollToPage(pageNumber) {
    const target = document.querySelector(`[data-page-number="${pageNumber}"]`);

    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }

  const handleScrollPageRender = useCallback(
    (pageNumber) => {
      const token = renderTokenRef.current;
      renderPage(pageNumber, token);
    },
    [renderPage],
  );

  const handleScrollPageVisible = useCallback((pageNumber) => {
    setCurrentPage(pageNumber);
  }, []);

  function goPrev() {
    if (viewMode === "scroll") {
      const targetPage = Math.max(currentPage - 1, 1);
      handleScrollPageRender(targetPage);
      scrollToPage(targetPage);
      return;
    }

    const targetPage = getPrevTargetPage();

    if (!isPageReady(targetPage)) {
      const token = renderTokenRef.current;
      renderPage(targetPage, token);
      return;
    }

    bookRef.current?.pageFlip()?.flipPrev();
  }

  function goNext() {
    if (viewMode === "scroll") {
      const targetPage = Math.min(currentPage + 1, totalPages);
      handleScrollPageRender(targetPage);
      scrollToPage(targetPage);
      return;
    }

    const targetPage = getNextTargetPage();

    if (!isPageReady(targetPage)) {
      const token = renderTokenRef.current;
      renderPage(targetPage, token);
      return;
    }

    bookRef.current?.pageFlip()?.flipNext();
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
  const goPrevRef = useRef(goPrev);
  const goNextRef = useRef(goNext);

  useEffect(() => {
    goPrevRef.current = goPrev;
    goNextRef.current = goNext;
  });

  useEffect(() => {
    function handleKeyDown(e) {
      if (!isFullscreen || isMobile) return;

      if (e.key === "ArrowLeft") {
        goPrevRef.current();
      } else if (e.key === "ArrowRight") {
        goNextRef.current();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen, isMobile]);

  const isFrontCoverView = !isMobile && currentPage === 1;

  return (
    <section
      className={`flipbook-reader bg-slate-950 text-white ${
        isFullscreen ? "h-screen overflow-hidden p-0" : "px-3 py-8 sm:px-6 lg:px-8"
      }`}
      ref={readerRef}
    >
      <div className={isFullscreen ? "h-full w-full" : "mx-auto max-w-7xl"}>
        <div className={isFullscreen ? "hidden" : "mb-6 text-center"}>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">
            Ruang Baca Digital
          </p>
          <h2 className="mt-2 text-2xl font-bold text-white">{title}</h2>
          <div className="mt-5 flex justify-center">
            <div className="inline-flex rounded-xl border border-slate-700 bg-slate-900 p-1">
              <button
                className={`rounded-lg px-4 py-2 text-sm font-bold transition ${
                  viewMode === "flip"
                    ? "bg-emerald-500 text-slate-950"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
                onClick={() => setViewMode("flip")}
                type="button"
              >
                Flipbook
              </button>

              <button
                className={`rounded-lg px-4 py-2 text-sm font-bold transition ${
                  viewMode === "scroll"
                    ? "bg-emerald-500 text-slate-950"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
                onClick={() => setViewMode("scroll")}
                type="button"
              >
                Scroll PDF
              </button>
            </div>
          </div>
        </div>

        <div
          className={`relative mx-auto flex items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_center,#334155_0%,#0f172a_70%)] [scrollbar-width:none] ${
            isFullscreen
              ? "h-screen w-screen rounded-none border-0 p-0 shadow-none"
              : "min-h-[560px] rounded-2xl border border-slate-700 p-4 shadow-inner sm:min-h-[720px]"
          }`}
        >
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
              {viewMode === "flip" ? (
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
                    className="relative flex max-w-full items-center justify-center overflow-hidden"
                    style={{ perspective: "1800px" }}
                  >
                    {!isMobile && !isFrontCoverView ? (
                      <div className="pointer-events-none absolute left-1/2 top-4 z-30 h-[calc(100%-2rem)] w-[2px] -translate-x-1/2 bg-gradient-to-b from-transparent via-black/30 to-transparent" />
                    ) : null}

                    <div
                      className="transition-transform duration-200 ease-out"
                      style={spreadStyle}
                    >
                      <HTMLFlipBook
                        key={`flipbook-${isFullscreen ? "full" : "normal"}`}
                        ref={bookRef}
                        width={width}
                        height={height}
                        size="fixed"
                        minWidth={280}
                        maxWidth={isFullscreen ? 2000 : 520}
                        minHeight={390}
                        maxHeight={isFullscreen ? 2840 : 740}
                        autoSize={false}
                        className={`mx-auto overflow-hidden rounded-sm shadow-[0_18px_45px_rgba(0,0,0,0.28)] ${
                          isFrontCoverView
                            ? "bg-transparent"
                            : "bg-[#fffdf7]"
                        }`}
                        drawShadow
                        flippingTime={1350}
                        maxShadowOpacity={0.22}
                        mobileScrollSupport={false}
                        showCover={!isMobile}
                        showPageCorners
                        useMouseEvents
                        clickEventForward
                        usePortrait={isMobile}
                        startPage={currentPage > 1 ? currentPage - 1 : 0}
                        startZIndex={30}
                        onFlip={(event) => {
                          setCurrentPage(event.data + 1);
                        }}
                      >
                        {Array.from({ length: totalPages }, (_, index) => {
                          const pageNumber = index + 1;

                          return (
                            <BookPage
                              key={pageNumber}
                              pageNumber={pageNumber}
                              imageUrl={pageImages[pageNumber]}
                              title={title}
                              isCover={pageNumber === 1}
                            />
                          );
                        })}
                      </HTMLFlipBook>
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
              ) : (
                <div
                  className={`w-full overflow-y-auto overflow-x-hidden bg-slate-950/50 [scrollbar-width:thin] ${
                    isFullscreen
                      ? "h-screen rounded-none px-0 py-0"
                      : "h-[72vh] rounded-xl px-3 py-6 md:px-6"
                  }`}
                >
                  {Array.from({ length: totalPages }, (_, index) => {
                    const pageNumber = index + 1;

                    return (
                      <ScrollPage
                        key={pageNumber}
                        pageNumber={pageNumber}
                        imageUrl={pageImages[pageNumber]}
                        title={title}
                        zoom={zoom}
                        onNeedRender={handleScrollPageRender}
                        onVisible={handleScrollPageVisible}
                      />
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        <div className={isFullscreen ? "hidden" : "mx-auto mt-5 max-w-4xl"}>
          <ReaderToolbar
            currentPage={canRead ? currentPage : 1}
            isFullscreen={isFullscreen}
            onBack={goBack}
            onFullscreen={enterFullscreen}
            onNext={goNext}
            onPrev={goPrev}
            onResetZoom={() => setZoom(1)}
            onZoomIn={() => setZoom((value) => Math.min(value + 0.1, 1.35))}
            onZoomOut={() => setZoom((value) => Math.max(value - 0.1, 0.75))}
            totalPages={canRead ? totalPages : 1}
            zoom={zoom}
          />
        </div>
      </div>

      <style jsx global>{`
        .flipbook-reader,
        .flipbook-reader * {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .flipbook-reader::-webkit-scrollbar,
        .flipbook-reader *::-webkit-scrollbar {
          display: none;
          width: 0;
          height: 0;
        }

        .flipbook-reader .stf__wrapper,
        .flipbook-reader .stf__parent,
        .flipbook-reader .stf__block,
        .flipbook-reader .stf__item {
          scrollbar-width: none !important;
          -ms-overflow-style: none !important;
        }

        .flipbook-reader .stf__wrapper::-webkit-scrollbar,
        .flipbook-reader .stf__parent::-webkit-scrollbar,
        .flipbook-reader .stf__block::-webkit-scrollbar,
        .flipbook-reader .stf__item::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }

        body {
          overflow-x: hidden;
        }
      `}</style>
    </section>
  );
}
