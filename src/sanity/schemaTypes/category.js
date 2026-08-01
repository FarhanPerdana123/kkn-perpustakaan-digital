import { defineField, defineType } from "sanity";

export const category = defineType({
  name: "category",
  title: "Genre Buku",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Nama Genre",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug URL",
      type: "slug",
      options: { source: "name", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Deskripsi",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "featured",
      title: "Tampilkan di beranda",
      type: "boolean",
      initialValue: true,
    }),
  ],
});
