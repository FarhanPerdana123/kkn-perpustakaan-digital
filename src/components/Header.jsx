import Link from "next/link";
import Image from "next/image";
import { AuthMenu } from "./AuthMenu";
import { Icon } from "./icons";

const navItems = ["Beranda", "Koleksi Buku", "Genre", "Bookmark"];

function getHref(item) {
  const links = {
    Beranda: "/",
    "Koleksi Buku": "/koleksi",
    Genre: "/#kategori",
    Bookmark: "/bookmark",
    "Tentang Kami": "/#tentang-kami",
  };

  return links[item];
}

const defaultHeader = {
  logoUrl: "",
  logoText: "DD",
  title: "Perpustakaan Digital Desa Podosoko",
  subtitle: "Katalog buku digital untuk warga",
  languageLabel: "ID",
  mobileLanguageLabel: "Bahasa Indonesia",
};

export function Header({ header = defaultHeader }) {
  const logoFrameClass = header.logoUrl
    ? "grid h-11 w-11 shrink-0 place-items-center bg-transparent"
    : "grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-emerald-800 text-sm font-bold text-white shadow-sm";

  return (
    <header className="sticky top-0 z-30 border-b border-emerald-900/10 bg-stone-50/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <span className={logoFrameClass}>
            {header.logoUrl ? (
              <Image
                alt={`Logo ${header.title}`}
                className="h-full w-full object-contain"
                height={44}
                src={header.logoUrl}
                width={44}
              />
            ) : (
              header.logoText
            )}
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold leading-5 text-slate-950 sm:text-base">
              {header.title}
            </span>
            <span className="hidden text-xs text-slate-600 sm:block">
              {header.subtitle}
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-1 text-sm font-medium text-slate-700 shadow-sm lg:flex">
          {navItems.map((item) => (
            <Link
              className="rounded-full px-4 py-2 hover:bg-emerald-50 hover:text-emerald-900"
              href={getHref(item)}
              key={item}
            >
              {item}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center lg:flex">
          <AuthMenu />
        </div>

        <details className="relative lg:hidden">
          <summary className="grid h-10 w-10 cursor-pointer place-items-center rounded-lg border border-slate-200 bg-white text-slate-800">
            <Icon name="Menu" />
            <span className="sr-only">Buka menu</span>
          </summary>
          <div className="absolute right-0 mt-3 w-72 rounded-lg border border-slate-200 bg-white p-3 shadow-xl">
            <nav className="grid gap-1 text-sm font-medium text-slate-700">
              {navItems.map((item) => (
                <Link
                  className="rounded-md px-3 py-2 hover:bg-emerald-50 hover:text-emerald-900"
                  href={getHref(item)}
                  key={item}
                >
                  {item}
                </Link>
              ))}
            </nav>
            <div className="mt-3 border-t border-slate-100 pt-3">
              <AuthMenu compact />
            </div>
          </div>
        </details>
      </div>
    </header>
  );
}
