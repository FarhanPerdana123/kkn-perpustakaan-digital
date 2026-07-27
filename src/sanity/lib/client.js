import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "../env";

export const sanityClient = createClient({
  apiVersion,
  dataset,
  projectId,
  useCdn: false,
});
