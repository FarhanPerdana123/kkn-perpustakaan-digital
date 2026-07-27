export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-06-29";

export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "7sj4ugh9";

export const isSanityConfigured = Boolean(projectId && dataset);
