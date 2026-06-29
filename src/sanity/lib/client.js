import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "../env";

export const sanityClient = createClient({
  apiVersion,
  dataset: dataset || "production",
  projectId: projectId || "00000000",
  useCdn: false,
});
