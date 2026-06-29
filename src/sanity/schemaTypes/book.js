import { defineField, defineType } from "sanity";

export const book = defineType({
  name: "book",
  title: "Buku",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Judul Buku",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug URL",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      description:
        "Opsional. Jika kosong, website akan memakai ID dokumen Sanity.",
    }),
    defineField({
      name: "author",
      title: "Penulis",
      type: "string",
    }),
    defineField({
      name: "category",
      title: "Kategori",
      type: "reference",
      to: [{ type: "category" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "year",
      title: "Tahun Terbit",
      type: "string",
    }),
    defineField({
      name: "description",
      title: "Deskripsi Singkat",
      type: "text",
      rows: 4,
    }),
    defineField({
      name: "pdf",
      title: "File Buku PDF",
      type: "file",
      options: {
        accept: "application/pdf",
      },
    }),
    defineField({
      name: "cover",
      title: "Sampul Buku",
      type: "image",
      options: {
        hotspot: true,
      },
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "category.name",
      media: "cover",
    },
  },
});
