import Image from "next/image";

export function HeroSearch({ hero }) {
  return (
    <section className="relative min-h-[620px] overflow-hidden bg-slate-950 text-white">
      <Image
        alt="Balai desa dan perpustakaan desa"
        className="object-cover"
        fill
        priority
        sizes="100vw"
        src={hero.imageUrl}
      />
      <div className="absolute inset-0 bg-slate-950/68" />
      <div className="relative mx-auto flex min-h-[620px] max-w-7xl items-center px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-4xl text-center">
          <p className="mb-4 inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-emerald-50 backdrop-blur">
            {hero.badge}
          </p>
          <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
            {hero.title}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-100 sm:text-lg">
            {hero.description}
          </p>

          <a
            className="mt-9 inline-flex rounded-lg bg-emerald-800 px-6 py-3 text-base font-bold text-white shadow-lg shadow-black/20 hover:bg-emerald-900"
            href="#koleksi"
          >
            Lihat Koleksi Buku
          </a>
        </div>
      </div>
    </section>
  );
}
