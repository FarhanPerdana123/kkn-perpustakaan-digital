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

const pdfJsUrl = "/pdfjs/pdf.mjs";
const pdfWorkerUrl = "/pdfjs/pdf.worker.min.mjs";

function useReaderSize() {
  const [reader, setReader] = useState({
    width: 420,
    height: 596,
    isMobile: false,
  });

  useEffect(() => {
    function updateSize() {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const isMobile = viewportWidth < 768;

      const pageWidth = isMobile
        ? Math.max(280, Math.min(viewportWidth - 36, 390))
        : Math.max(360, Math.min(Math.floor((viewportWidth - 220) / 2), 460));

      const pageHeight = Math.min(
        Math.round(pageWidth * 1.42),
        isMobile ? viewportHeight - 220 : 660,
      );

      setReader({
        width: pageWidth,
        height: pageHeight,
        isMobile,
      });
    }

    updateSize();
    window.addEventListener("resize", updateSize);

    return () => window.removeEventListener("resize", updateSize);
  }, []);

  return reader;
}

const BookPage = forwardRef(function BookPage({ page, title, isCover }, ref) {
  return (
    <div
      ref={ref}
      className={[
        "relative flex h-full w-full flex-col justify-between overflow-hidden bg-[#fffdf7]",
        "border border-slate-300 shadow-2xl",
        isCover ? "rounded-r-md" : "rounded-sm",
      ].join(" ")}
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-black/10 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-black/10 to-transparent" />

      <div className="flex min-h-0 flex-1 items-center justify-center bg-[#fffdf7] p-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt={`${title} halaman ${page.pageNumber}`}
          className="max-h-full max-w-full select-none object-contain"
          draggable={false}
          src={page.imageUrl}
        />
      </div>

      <div className="border-t border-slate-200 bg-[#fffdf7] px-4 py-2 text-center text-xs font-semibold text-slate-500">
        Halaman {page.pageNumber}
      </div>
    </div>
  );
});

export function FlipBookReader({ pdfUrl, title }) {
  const bookRef = useRef(null);
  const readerRef = useRef(null);
  const objectUrlsRef = useRef([]);

  const { width, height, isMobile } = useReaderSize();

  const [pages, setPages] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(Boolean(pdfUrl));
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [zoom, setZoom] = useState(1);

  const totalPages = pages.length;
  const canFlip = totalPages > 0;

  const cleanupObjectUrls = useCallback(() => {
    objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    objectUrlsRef.current = [];
  }, []);

  useEffect(() => {
    let cancelled = false;
    let loadingTask = null;

    async function renderPdf() {
      if (!pdfUrl) {
        setError("File buku belum tersedia atau gagal dimuat.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");
      setPages([]);
      setCurrentPage(1);
      setProgress(0);
      cleanupObjectUrls();

      try {
        const pdfjsLib = await import(/* webpackIgnore: true */ pdfJsUrl);
        pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

        loadingTask = pdfjsLib.getDocument({
          url: pdfUrl,
          withCredentials: false,
        });

        const pdf = await loadingTask.promise;
        const renderedPages = [];

        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
          if (cancelled) return;

          const page = await pdf.getPage(pageNumber);
          const viewport = page.getViewport({
            scale: isMobile ? 1.45 : 1.75,
          });

          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");

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

          const blob = await new Promise((resolve) => {
            canvas.toBlob(resolve, "image/jpeg", 0.92);
          });

          const imageUrl = blob
            ? URL.createObjectURL(blob)
            : canvas.toDataURL("image/png");

          if (blob) {
            objectUrlsRef.current.push(imageUrl);
          }

          renderedPages.push({
            imageUrl,
            pageNumber,
          });

          setProgress(Math.round((pageNumber / pdf.numPages) * 100));
        }

        if (!cancelled) {
          setPages(renderedPages);
          setCurrentPage(1);
        }
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

    renderPdf();

    return () => {
      cancelled = true;

      if (loadingTask) {
        loadingTask.destroy();
      }

      cleanupObjectUrls();
    };
  }, [pdfUrl, isMobile, cleanupObjectUrls]);

  const flipBook = useCallback(() => bookRef.current?.pageFlip(), []);

  function goPrev() {
    flipBook()?.flipPrev();
  }

  function goNext() {
    flipBook()?.flipNext();
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

  const scaledStyle = useMemo(
    () => ({
      transform: `scale(${zoom})`,
      transformOrigin: "center center",
    }),
    [zoom],
  );

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

        <div className="relative mx-auto flex min-h-[560px] items-center justify-center overflow-auto rounded-2xl border border-slate-700 bg-[radial-gradient(circle_at_center,#334155_0%,#0f172a_70%)] p-4 shadow-inner sm:min-h-[720px]">
          {loading ? (
            <div className="rounded-lg border border-white/10 bg-slate-950/70 px-6 py-5 text-center text-sm font-semibold text-slate-200">
              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-emerald-400" />
              <p>Memuat dan menyiapkan halaman buku...</p>
              <p className="mt-2 text-xs text-slate-400">
                Memproses PDF {progress}%
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
                disabled={currentPage <= 1}
                onClick={goPrev}
                type="button"
              >
                <ChevronLeft className="h-7 w-7" />
              </button>

              <div className="relative">
                {!isMobile ? (
                  <div className="pointer-events-none absolute left-1/2 top-4 z-30 h-[calc(100%-2rem)] w-[2px] -translate-x-1/2 bg-gradient-to-b from-transparent via-black/30 to-transparent" />
                ) : null}

                <div
                  className="transition-transform duration-200 ease-out"
                  style={scaledStyle}
                >
                  <HTMLFlipBook
                    ref={bookRef}
                    width={width}
                    height={height}
                    size="fixed"
                    minWidth={280}
                    maxWidth={520}
                    minHeight={390}
                    maxHeight={740}
                    autoSize={false}
                    className="mx-auto"
                    drawShadow
                    flippingTime={900}
                    maxShadowOpacity={0.45}
                    mobileScrollSupport
                    showCover={!isMobile}
                    usePortrait={isMobile}
                    startPage={0}
                    startZIndex={10}
                    onFlip={(event) => setCurrentPage(event.data + 1)}
                  >
                    {pages.map((page, index) => (
                      <BookPage
                        key={page.pageNumber}
                        page={page}
                        title={title}
                        isCover={index === 0}
                      />
                    ))}
                  </HTMLFlipBook>
                </div>
              </div>

              <button
                aria-label="Halaman berikutnya"
                className="absolute right-3 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-slate-950/80 text-white shadow-lg hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-40 md:grid"
                disabled={currentPage >= totalPages}
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
            currentPage={canFlip ? currentPage : 1}
            onBack={goBack}
            onFullscreen={enterFullscreen}
            onNext={goNext}
            onPrev={goPrev}
            onResetZoom={() => setZoom(1)}
            onZoomIn={() => setZoom((value) => Math.min(value + 0.1, 1.4))}
            onZoomOut={() => setZoom((value) => Math.max(value - 0.1, 0.75))}
            totalPages={canFlip ? totalPages : 1}
            zoom={zoom}
          />
        </div>
      </div>
    </section>
  );
}