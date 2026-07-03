import "./globals.css";
import { AuthDialog } from "@/components/AuthDialog";
import { AuthProvider } from "@/components/AuthProvider";

export const metadata = {
  title: "Perpustakaan Digital Desa Podosoko",
  description:
    "Perpustakaan digital desa untuk membaca buku pelajaran, modul, cerita, dan referensi warga secara online.",
};

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
