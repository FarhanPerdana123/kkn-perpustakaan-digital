import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { apiVersion, dataset, projectId } from "./src/sanity/env";
import { schemaTypes } from "./src/sanity/schemaTypes";

export default defineConfig({
  name: "perpustakaan_podosoko",
  title: "Perpustakaan Podosoko",
  projectId,
  dataset,
  basePath: "/studio",
  plugins: [structureTool()],
  schema: {
    types: schemaTypes,
  },
  scheduledPublishing: {
    enabled: false,
  },
  document: {
    productionUrl: async (prev, context) => {
      const { document } = context;

      if (document?._type === "book") {
        return "/koleksi";
      }

      if (document?._type === "category" && document?.slug?.current) {
        return `/kategori/${document.slug.current}`;
      }

      return prev;
    },
  },
  apiVersion,
});
