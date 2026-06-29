import crypto from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { bookCategoryOptions } from "@/data/library";
import { isSanityConfigured } from "@/sanity/env";
import { sanityClient } from "@/sanity/lib/client";

const dataDirectory = path.join(process.cwd(), "data");
const uploadDirectory = path.join(process.cwd(), "public", "uploads", "books");
const siteUploadDirectory = path.join(process.cwd(), "public", "uploads", "site");
const storePath = path.join(dataDirectory, "library-store.json");

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

const defaultStore = {
  books: [],
  header: defaultHeader,
  hero: defaultHero,
  footer: defaultFooter,
  categories: bookCategoryOptions.map((name, index) => ({
    id: createSlug(name),
    name,
    description: "Kategori buku perpustakaan digital desa.",
    createdAt: new Date(index).toISOString(),
  })),
};

export function createSlug(value) {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/&/g, "dan")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function createId(prefix) {
  return `${prefix}-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
}

function getExtension(fileName, fallback = "") {
  const extension = path.extname(fileName || "").toLowerCase();
  return extension || fallback;
}

async function ensureStoreFile() {
  await mkdir(dataDirectory, { recursive: true });
  await mkdir(uploadDirectory, { recursive: true });
  await mkdir(siteUploadDirectory, { recursive: true });

  try {
    await readFile(storePath, "utf8");
  } catch {
    await writeFile(storePath, JSON.stringify(defaultStore, null, 2));
  }
}

async function readStore() {
  await ensureStoreFile();
  const raw = await readFile(storePath, "utf8");
  const store = JSON.parse(raw);

  return {
    books: Array.isArray(store.books) ? store.books : [],
    header: {
      ...defaultHeader,
      ...(store.header || {}),
    },
    hero: {
      ...defaultHero,
      ...(store.hero || {}),
    },
    footer: {
      ...defaultFooter,
      ...(store.footer || {}),
      helpLinks: Array.isArray(store.footer?.helpLinks)
        ? store.footer.helpLinks
        : defaultFooter.helpLinks,
      socialLinks: Array.isArray(store.footer?.socialLinks)
        ? store.footer.socialLinks
        : defaultFooter.socialLinks,
    },
    categories: Array.isArray(store.categories)
      ? store.categories
      : defaultStore.categories,
  };
}

async function writeStore(store) {
  await ensureStoreFile();
  await writeFile(storePath, JSON.stringify(store, null, 2));
}

async function fetchFromSanity(query, params = {}) {
  if (!isSanityConfigured) {
    return null;
  }

  try {
    return await sanityClient.fetch(query, params);
  } catch (error) {
    console.warn("Sanity fetch failed. Falling back to local JSON.", error);
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

async function deletePublicUpload(publicUrl, directory) {
  if (!publicUrl || !publicUrl.startsWith("/uploads/")) {
    return;
  }

  const relativePath = publicUrl.replace(/^\//, "");
  const fullPath = path.join(process.cwd(), "public", relativePath);
  const resolvedPath = path.resolve(fullPath);
  const resolvedDirectory = path.resolve(directory);

  if (!resolvedPath.startsWith(resolvedDirectory)) {
    return;
  }

  try {
    await unlink(resolvedPath);
  } catch {
    // File may already be missing; the JSON record should still be deleted.
  }
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

  if (Array.isArray(sanityBooks)) {
    return sanityBooks.map((book) => ({
      ...book,
      readerId: book.slug || book.id,
    }));
  }

  const store = await readStore();
  return store.books
    .map((book) => ({
      ...book,
      slug: book.slug || createSlug(book.title || book.id),
      readerId: book.slug || createSlug(book.title || book.id),
    }))
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
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

  if (sanityBook) {
    return {
      ...sanityBook,
      readerId: sanityBook.slug || sanityBook.id,
    };
  }

  const books = await getBooks();
  return (
    books.find(
      (book) =>
        book.id === cleanReaderId ||
        book.slug === cleanReaderId ||
        book.readerId === cleanReaderId,
    ) || null
  );
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

  const store = await readStore();
  return store.categories
    .map((category, index) => ({
      ...category,
      createdAt: category.createdAt || new Date(index).toISOString(),
    }))
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
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

  return books.filter((book) => book.category === category.name);
}

export async function getHero() {
  const sanityHero = await fetchFromSanity(`*[_type == "siteHero"][0] {
    "badge": coalesce(badge, ""),
    "title": coalesce(title, ""),
    "description": coalesce(description, ""),
    "imageUrl": image.asset->url
  }`);

  if (sanityHero) {
    return {
      ...defaultHero,
      ...sanityHero,
      imageUrl: sanityHero.imageUrl || defaultHero.imageUrl,
    };
  }

  const store = await readStore();
  return store.hero;
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

  if (sanityFooter) {
    return {
      ...defaultFooter,
      ...sanityFooter,
      helpLinks: normalizeHelpLinks(sanityFooter.helpLinks).length
        ? normalizeHelpLinks(sanityFooter.helpLinks)
        : defaultFooter.helpLinks,
      socialLinks: sanityFooter.socialLinks?.length
        ? sanityFooter.socialLinks
        : defaultFooter.socialLinks,
      copyright: defaultFooter.copyright,
    };
  }

  const store = await readStore();
  return store.footer;
}

export async function getHeader() {
  const sanityHeader = await fetchFromSanity(`*[_type == "siteHeader"][0] {
    "logoUrl": logo.asset->url,
    "title": coalesce(title, ""),
    "subtitle": coalesce(subtitle, "")
  }`);

  if (sanityHeader) {
    return {
      ...defaultHeader,
      ...sanityHeader,
      logoUrl: sanityHeader.logoUrl || defaultHeader.logoUrl,
    };
  }

  const store = await readStore();
  return store.header;
}

export async function getHelpItems() {
  const footer = await getFooter();
  return normalizeHelpLinks(footer.helpLinks);
}

export async function getHelpItemBySlug(slug) {
  const helpItems = await getHelpItems();
  return helpItems.find((item) => item.slug === slug) || null;
}

export async function updateHeader(headerData) {
  const store = await readStore();

  store.header = {
    ...store.header,
    logoUrl: headerData.logoUrl || store.header.logoUrl || defaultHeader.logoUrl,
    logoText: String(headerData.logoText || "").trim() || defaultHeader.logoText,
    title: String(headerData.title || "").trim() || defaultHeader.title,
    subtitle: String(headerData.subtitle || "").trim() || defaultHeader.subtitle,
    updatedAt: new Date().toISOString(),
  };

  await writeStore(store);
  return store.header;
}

export async function saveHeaderLogo(file) {
  if (!file || typeof file.arrayBuffer !== "function" || file.size === 0) {
    return "";
  }

  await mkdir(siteUploadDirectory, { recursive: true });

  const extension = getExtension(file.name, ".png");
  const fileName = `${createId("logo")}${extension}`;
  const fullPath = path.join(siteUploadDirectory, fileName);
  const buffer = Buffer.from(await file.arrayBuffer());

  await writeFile(fullPath, buffer);

  return `/uploads/site/${fileName}`;
}

export async function updateHero(heroData) {
  const store = await readStore();

  store.hero = {
    ...store.hero,
    badge: String(heroData.badge || "").trim() || defaultHero.badge,
    title: String(heroData.title || "").trim() || defaultHero.title,
    description:
      String(heroData.description || "").trim() || defaultHero.description,
    imageUrl: heroData.imageUrl || store.hero.imageUrl || defaultHero.imageUrl,
    updatedAt: new Date().toISOString(),
  };

  await writeStore(store);
  return store.hero;
}

function cleanLinks(links) {
  if (!Array.isArray(links)) {
    return [];
  }

  return links
    .map((link) => ({
      label: String(link.label || "").trim(),
      href: String(link.href || "").trim(),
    }))
    .filter((link) => link.label && link.href);
}

export async function updateFooter(footerData) {
  const store = await readStore();
  const helpLinks = cleanLinks(footerData.helpLinks);
  const socialLinks = cleanLinks(footerData.socialLinks);

  store.footer = {
    ...store.footer,
    title: String(footerData.title || "").trim() || defaultFooter.title,
    address: String(footerData.address || "").trim() || defaultFooter.address,
    phone: String(footerData.phone || "").trim() || defaultFooter.phone,
    email: String(footerData.email || "").trim() || defaultFooter.email,
    helpTitle:
      String(footerData.helpTitle || "").trim() || defaultFooter.helpTitle,
    helpLinks: helpLinks.length > 0 ? helpLinks : defaultFooter.helpLinks,
    socialTitle:
      String(footerData.socialTitle || "").trim() || defaultFooter.socialTitle,
    socialLinks:
      socialLinks.length > 0 ? socialLinks : defaultFooter.socialLinks,
    copyright: store.footer?.copyright || defaultFooter.copyright,
    updatedAt: new Date().toISOString(),
  };

  await writeStore(store);
  return store.footer;
}

export async function addCategory({ name, description }) {
  const store = await readStore();
  const cleanName = String(name || "").trim();

  if (!cleanName) {
    throw new Error("Nama kategori wajib diisi.");
  }

  const id = createSlug(cleanName);
  const exists = store.categories.some(
    (category) => category.id === id || category.name === cleanName,
  );

  if (!exists) {
    store.categories.unshift({
      id,
      name: cleanName,
      description:
        String(description || "").trim() ||
        "Kategori buku perpustakaan digital desa.",
      createdAt: new Date().toISOString(),
    });
    await writeStore(store);
  }

  return store.categories.find((category) => category.id === id);
}

export async function deleteCategory(categoryId) {
  const store = await readStore();
  const id = String(categoryId || "");
  const category = store.categories.find((item) => item.id === id);

  if (!category) {
    return null;
  }

  store.categories = store.categories.filter((item) => item.id !== id);

  await writeStore(store);
  return category;
}

export async function saveUploadedFile(file, type) {
  if (!file || typeof file.arrayBuffer !== "function" || file.size === 0) {
    return "";
  }

  await mkdir(uploadDirectory, { recursive: true });

  const fallbackExtension = type === "pdf" ? ".pdf" : ".jpg";
  const extension = getExtension(file.name, fallbackExtension);
  const fileName = `${createId(type)}${extension}`;
  const fullPath = path.join(uploadDirectory, fileName);
  const buffer = Buffer.from(await file.arrayBuffer());

  await writeFile(fullPath, buffer);

  return `/uploads/books/${fileName}`;
}

export async function saveHeroImage(file) {
  if (!file || typeof file.arrayBuffer !== "function" || file.size === 0) {
    return "";
  }

  await mkdir(siteUploadDirectory, { recursive: true });

  const extension = getExtension(file.name, ".jpg");
  const fileName = `${createId("hero")}${extension}`;
  const fullPath = path.join(siteUploadDirectory, fileName);
  const buffer = Buffer.from(await file.arrayBuffer());

  await writeFile(fullPath, buffer);

  return `/uploads/site/${fileName}`;
}

export async function addBook(bookData) {
  const store = await readStore();
  const title = String(bookData.title || "").trim();

  if (!title) {
    throw new Error("Judul buku wajib diisi.");
  }

  const book = {
    id: createId("book"),
    title,
    author: String(bookData.author || "").trim(),
    category: String(bookData.category || "").trim(),
    year: String(bookData.year || "").trim(),
    description: String(bookData.description || "").trim(),
    pdfUrl: bookData.pdfUrl || "",
    coverUrl: bookData.coverUrl || "",
    createdAt: new Date().toISOString(),
  };

  store.books.push(book);
  await writeStore(store);

  return book;
}

export async function deleteBook(bookId) {
  const store = await readStore();
  const id = String(bookId || "");
  const book = store.books.find((item) => item.id === id);

  if (!book) {
    return null;
  }

  store.books = store.books.filter((item) => item.id !== id);
  await writeStore(store);

  await Promise.all([
    deletePublicUpload(book.pdfUrl, uploadDirectory),
    deletePublicUpload(book.coverUrl, uploadDirectory),
  ]);

  return book;
}
