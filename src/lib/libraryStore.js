import { bookCategoryOptions } from "@/data/library";
import { isSanityConfigured } from "@/sanity/env";
import { sanityClient } from "@/sanity/lib/client";

const defaultHero = {
  badge: "Perpustakaan digital untuk warga desa",
  title: "Baca Buku Perpustakaan Desa Secara Digital.",
  description:
    "Temukan buku pelajaran, modul pertanian, bacaan anak, cerita rakyat, buku kesehatan, dan referensi warga dalam satu tempat.",
  imageUrl: "/images/desa-library-hero.png",
};

const defaultHeader = {
  logoUrl: "",
  logoText: "DD",
  title: "Perpustakaan Digital Desa Podosoko",
  subtitle: "Katalog buku digital untuk warga",
  languageLabel: "ID",
  mobileLanguageLabel: "Bahasa Indonesia",
};

const defaultFooter = {
  title: "Perpustakaan Digital Desa Sukamaju",
  address: "Kantor Desa Sukamaju, Kecamatan Harapan",
  phone: "Telepon: (021) 555-0198",
  email: "Email: perpus@sukamaju.desa.id",
  helpTitle: "Bantuan",
  helpLinks: [
    {
      label: "Kebijakan Privasi",
      description:
        "Informasi mengenai cara perpustakaan digital desa mengelola data dan akses pengguna.",
    },
    {
      label: "Syarat Penggunaan",
      description:
        "Ketentuan umum untuk menggunakan layanan perpustakaan digital desa.",
    },
    {
      label: "Panduan Membaca",
      description:
        "Pilih buku yang tersedia, lalu klik tombol Baca Buku untuk membuka file digital.",
    },
  ],
  socialTitle: "Media Sosial Desa",
  socialLinks: [
    { label: "Facebook", href: "https://facebook.com/desasukamaju" },
    { label: "Instagram", href: "https://instagram.com/desasukamaju" },
    { label: "YouTube", href: "https://youtube.com/@desasukamaju" },
  ],
  copyright: "Copyright 2026 Desa Podosoko.",
};

export function createSlug(value) {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/&/g, "dan")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function fetchFromSanity(query, params = {}) {
  if (!isSanityConfigured) {
    return null;
  }

  try {
    return await sanityClient.fetch(query, params);
  } catch (error) {
    console.warn("Sanity fetch failed.", error);
    return null;
  }
}

function normalizeHelpLinks(links) {
  if (!Array.isArray(links)) {
    return [];
  }

  return links
    .map((link) => {
      const label = String(link.label || "").trim();
      const description = String(
        link.description || link.text || link.href || "",
      ).trim();

      return {
        ...link,
        label,
        description,
        slug: link.slug || createSlug(label),
      };
    })
    .filter((link) => link.label && link.description);
}

export async function getBooks() {
  const sanityBooks = await fetchFromSanity(`*[_type == "book"] | order(_createdAt desc) {
    "id": _id,
    "slug": slug.current,
    "title": coalesce(title, ""),
    "author": coalesce(author, ""),
    "category": coalesce(category->name, ""),
    "categoryId": category->slug.current,
    "year": coalesce(year, ""),
    "description": coalesce(description, ""),
    "pdfUrl": pdf.asset->url,
    "coverUrl": cover.asset->url,
    "createdAt": coalesce(_createdAt, _updatedAt)
  }`);

  if (!Array.isArray(sanityBooks)) {
    return [];
  }

  return sanityBooks.map((book) => ({
    ...book,
    readerId: book.slug || book.id,
  }));
}

export async function getBookByReaderId(readerId) {
  const cleanReaderId = decodeURIComponent(String(readerId || ""));

  const sanityBook = await fetchFromSanity(
    `*[_type == "book" && (_id == $readerId || slug.current == $readerId)][0] {
      "id": _id,
      "slug": slug.current,
      "title": coalesce(title, ""),
      "author": coalesce(author, ""),
      "category": coalesce(category->name, ""),
      "categoryId": category->slug.current,
      "year": coalesce(year, ""),
      "description": coalesce(description, ""),
      "pdfUrl": pdf.asset->url,
      "coverUrl": cover.asset->url,
      "createdAt": coalesce(_createdAt, _updatedAt)
    }`,
    { readerId: cleanReaderId },
  );

  if (!sanityBook) {
    return null;
  }

  return {
    ...sanityBook,
    readerId: sanityBook.slug || sanityBook.id,
  };
}

export async function getCategories() {
  const sanityCategories = await fetchFromSanity(`*[_type == "category" && defined(slug.current)] | order(_createdAt desc) {
    "id": slug.current,
    "name": coalesce(name, ""),
    "description": coalesce(description, "Kategori buku perpustakaan digital desa."),
    "featured": coalesce(featured, true),
    "createdAt": coalesce(_createdAt, _updatedAt)
  }`);

  if (Array.isArray(sanityCategories)) {
    return sanityCategories;
  }

  return bookCategoryOptions.map((name, index) => ({
    id: createSlug(name),
    name,
    description: "Kategori buku perpustakaan digital desa.",
    featured: true,
    createdAt: new Date(index).toISOString(),
  }));
}

export async function getCategoryById(categoryId) {
  const categories = await getCategories();
  return categories.find((category) => category.id === categoryId) || null;
}

export async function getBooksByCategoryId(categoryId) {
  const [books, category] = await Promise.all([
    getBooks(),
    getCategoryById(categoryId),
  ]);

  if (!category) {
    return [];
  }

  return books.filter(
    (book) => book.categoryId === category.id || book.category === category.name,
  );
}

export async function getHero() {
  const sanityHero = await fetchFromSanity(`*[_type == "siteHero"][0] {
    "badge": coalesce(badge, ""),
    "title": coalesce(title, ""),
    "description": coalesce(description, ""),
    "imageUrl": image.asset->url
  }`);

  if (!sanityHero) {
    return defaultHero;
  }

  return {
    ...defaultHero,
    ...sanityHero,
    imageUrl: sanityHero.imageUrl || defaultHero.imageUrl,
  };
}

export async function getFooter() {
  const sanityFooter = await fetchFromSanity(`*[_type == "siteFooter"][0] {
    "title": coalesce(title, ""),
    "address": coalesce(address, ""),
    "phone": coalesce(phone, ""),
    "email": coalesce(email, ""),
    "helpTitle": coalesce(helpTitle, "Bantuan"),
    "helpLinks": helpLinks[] {
      label,
      description,
      href
    },
    "socialTitle": coalesce(socialTitle, "Media Sosial Desa"),
    "socialLinks": socialLinks[] {
      label,
      href
    }
  }`);

  if (!sanityFooter) {
    return defaultFooter;
  }

  const helpLinks = normalizeHelpLinks(sanityFooter.helpLinks);

  return {
    ...defaultFooter,
    ...sanityFooter,
    helpLinks: helpLinks.length ? helpLinks : defaultFooter.helpLinks,
    socialLinks: sanityFooter.socialLinks?.length
      ? sanityFooter.socialLinks
      : defaultFooter.socialLinks,
    copyright: defaultFooter.copyright,
  };
}

export async function getHeader() {
  const sanityHeader = await fetchFromSanity(`*[_type == "siteHeader"][0] {
    "logoUrl": logo.asset->url,
    "title": coalesce(title, ""),
    "subtitle": coalesce(subtitle, "")
  }`);

  if (!sanityHeader) {
    return defaultHeader;
  }

  return {
    ...defaultHeader,
    ...sanityHeader,
    logoUrl: sanityHeader.logoUrl || defaultHeader.logoUrl,
  };
}

export async function getHelpItems() {
  const footer = await getFooter();
  return normalizeHelpLinks(footer.helpLinks);
}

export async function getHelpItemBySlug(slug) {
  const helpItems = await getHelpItems();
  return helpItems.find((item) => item.slug === slug) || null;
}
