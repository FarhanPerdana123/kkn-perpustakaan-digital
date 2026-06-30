import Link from "next/link";

const defaultFooter = {
  title: "Perpustakaan Digital Desa Podosoko",
  address: "Kantor Desa Podosoko",
  phone: "Telepon: (021) 555-0198",
  email: "Email: perpus@podosoko.desa.id",
  helpTitle: "Bantuan",
  helpLinks: [
    { label: "Kebijakan Privasi" },
    { label: "Syarat Penggunaan" },
    { label: "Panduan Membaca" },
  ],
  socialTitle: "Media Sosial Desa",
  socialLinks: [
    { label: "Facebook", href: "https://facebook.com/desapodosoko" },
    { label: "Instagram", href: "https://instagram.com/desapodosoko" },
    { label: "YouTube", href: "https://youtube.com/@desapodosoko" },
  ],
  copyright: "Copyright 2026 Desa Podosoko.",
};

function createSlug(value) {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/&/g, "dan")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function Footer({ footer = defaultFooter }) {
  const footerData = {
    ...defaultFooter,
    ...footer,
    helpLinks: footer?.helpLinks?.length
      ? footer.helpLinks
      : defaultFooter.helpLinks,
    socialLinks: footer?.socialLinks?.length
      ? footer.socialLinks
      : defaultFooter.socialLinks,
  };

  return (
    <footer
      className="border-t border-slate-200 bg-slate-950 text-slate-100"
      id="tentang-kami"
    >
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <h2 className="text-lg font-bold">{footerData.title}</h2>
          <address className="mt-4 space-y-2 text-sm not-italic leading-6 text-slate-300">
            <p>{footerData.address}</p>
            <p>{footerData.phone}</p>
            <p>{footerData.email}</p>
          </address>
        </div>
        <div>
          <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-slate-400">
            {footerData.helpTitle}
          </h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-300">
            {footerData.helpLinks.map((link) => (
              <li key={link.slug || link.label}>
                <Link
                  className="hover:text-white"
                  href={`/bantuan/${link.slug || createSlug(link.label)}`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-slate-400">
            {footerData.socialTitle}
          </h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-300">
            {footerData.socialLinks.map((link) => (
              <li key={`${link.label}-${link.href}`}>
                <a
                  className="hover:text-white"
                  href={link.href}
                  rel="noreferrer"
                  target="_blank"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-5 text-center text-xs text-slate-400">
        {footerData.copyright}
      </div>
    </footer>
  );
}
