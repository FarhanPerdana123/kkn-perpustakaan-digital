import "./globals.css";

export const metadata = {
  title: "Perpustakaan Digital Desa Sukamaju",
  description:
    "Perpustakaan digital desa untuk membaca buku pelajaran, modul, cerita, dan referensi warga secara online.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className="h-full scroll-smooth">
      <body className="min-h-full font-sans antialiased">{children}</body>
    </html>
  );
}
