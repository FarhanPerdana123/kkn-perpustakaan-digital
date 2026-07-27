import { defineCliConfig } from "sanity/cli";
import { dataset, projectId } from "./src/sanity/env";

export default defineCliConfig({
  api: {
    dataset,
    projectId,
  },
});
