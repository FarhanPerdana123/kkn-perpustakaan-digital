import "./globals.css";
import { AuthDialog } from "@/components/AuthDialog";
import { AuthProvider } from "@/components/AuthProvider";
import { getHeader } from "@/lib/libraryStore";

export async function generateMetadata() {
  const header = await getHeader();
  const description =
    "Perpustakaan digital desa untuk membaca buku pelajaran, modul, cerita, dan referensi warga secara online.";

  return {
    title: header.title || "Perpustakaan Digital Desa Podosoko",
    description,
    icons: header.faviconUrl
      ? {
          icon: [{ url: header.faviconUrl }],
          shortcut: [header.faviconUrl],
          apple: [{ url: header.faviconUrl }],
        }
      : undefined,
  };
}

export default function RootLayout({ children }) {
  return (
    <html lang="id" className="h-full scroll-smooth">
      <body className="min-h-full font-sans antialiased">
        <AuthProvider>
          {children}
          <AuthDialog />
        </AuthProvider>
      </body>
    </html>
  );
}
