import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "./schemaTypes";
import { apiVersion, dataset, projectId } from "./env";

export default defineConfig({
  basePath: "/studio",
  name: "perpustakaan_podosoko",
  title: "Perpustakaan Podosoko",
  projectId,
  dataset,
  apiVersion,
  plugins: [structureTool()],
  schema: {
    types: schemaTypes,
  },
});
