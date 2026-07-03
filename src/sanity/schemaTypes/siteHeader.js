import { defineField, defineType } from "sanity";

export const siteHeader = defineType({
  name: "siteHeader",
  title: "Header Website",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Nama Website",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "subtitle",
      title: "Subjudul",
      type: "string",
    }),
    defineField({
      name: "logo",
      title: "Logo Gambar",
      type: "image",
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: "favicon",
      title: "Favicon",
      description: "Ikon kecil yang tampil di tab browser. Gunakan gambar persegi.",
      type: "image",
      options: {
        hotspot: true,
      },
    }),
  ],
});
