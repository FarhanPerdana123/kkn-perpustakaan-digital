import { defineArrayMember, defineField, defineType } from "sanity";

const helpItemField = defineArrayMember({
  type: "object",
  fields: [
    defineField({
      name: "label",
      title: "Judul Bantuan",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Teks Bantuan",
      type: "text",
      rows: 8,
      validation: (Rule) => Rule.required(),
    }),
  ],
});

const socialLinkField = defineArrayMember({
  type: "object",
  fields: [
    defineField({
      name: "label",
      title: "Label",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "href",
      title: "URL",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
  ],
});

export const siteFooter = defineType({
  name: "siteFooter",
  title: "Footer Website",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Judul Footer",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "address",
      title: "Alamat",
      type: "string",
    }),
    defineField({
      name: "phone",
      title: "Telepon",
      type: "string",
    }),
    defineField({
      name: "email",
      title: "Email",
      type: "string",
    }),
    defineField({
      name: "helpTitle",
      title: "Judul Bantuan",
      type: "string",
      initialValue: "Bantuan",
    }),
    defineField({
      name: "helpLinks",
      title: "Daftar Bantuan",
      type: "array",
      of: [helpItemField],
    }),
    defineField({
      name: "socialTitle",
      title: "Judul Media Sosial",
      type: "string",
      initialValue: "Media Sosial Desa",
    }),
    defineField({
      name: "socialLinks",
      title: "Link Media Sosial",
      type: "array",
      of: [socialLinkField],
    }),
  ],
});
