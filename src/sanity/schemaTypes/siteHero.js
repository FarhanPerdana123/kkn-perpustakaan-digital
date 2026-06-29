import { defineField, defineType } from "sanity";

export const siteHero = defineType({
  name: "siteHero",
  title: "Hero Beranda",
  type: "document",
  fields: [
    defineField({
      name: "badge",
      title: "Teks Badge",
      type: "string",
    }),
    defineField({
      name: "title",
      title: "Judul Utama",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Deskripsi",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "image",
      title: "Gambar Background",
      type: "image",
      options: {
        hotspot: true,
      },
    }),
  ],
});
