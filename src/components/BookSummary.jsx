"use client";

import { useMemo, useState } from "react";

const collapsedLength = 190;

function MetadataRow({ label, children }) {
  if (!children) return null;

  return (
    <div className="grid gap-2 sm:grid-cols-[120px_1fr] sm:items-start">
      <dt className="text-sm font-bold text-slate-950">{label}</dt>
      <dd className="flex flex-wrap gap-2 text-sm font-semibold text-slate-700">
        {children}
      </dd>
    </div>
  );
}

function Chip({ children, tone = "slate" }) {
  const colorClass =
    tone === "emerald"
      ? "bg-emerald-50 text-emerald-800"
      : "bg-slate-100 text-slate-700";

  return (
    <span className={`rounded-full px-3 py-1 ${colorClass}`}>{children}</span>
  );
}

export function BookSummary({ author, categories = [], description, year }) {
  const [expanded, setExpanded] = useState(false);

  const cleanDescription = String(description || "").trim();
  const shouldClamp = cleanDescription.length > collapsedLength;
  const visibleDescription = useMemo(() => {
    if (expanded || !shouldClamp) {
      return cleanDescription;
    }

    const clipped = cleanDescription.slice(0, collapsedLength).trimEnd();
    const lastSpace = clipped.lastIndexOf(" ");

    return `${clipped.slice(0, lastSpace > 120 ? lastSpace : clipped.length)}...`;
  }, [cleanDescription, expanded, shouldClamp]);

  const hasMetadata = categories.length || author || year;

  return (
    <div className="mt-5 space-y-6">
      {cleanDescription ? (
        <p className="max-w-3xl text-base leading-7 text-slate-700">
          {visibleDescription}
          {shouldClamp ? (
            <>
              {" "}
              <button
                className="inline-flex rounded-md bg-slate-950/5 px-2 py-0.5 font-bold text-emerald-800 transition hover:bg-emerald-50 hover:text-emerald-950"
                onClick={() => setExpanded((value) => !value)}
                type="button"
              >
                {expanded ? "Tutup" : "Read More"}
              </button>
            </>
          ) : null}
        </p>
      ) : null}

      {hasMetadata ? (
        <dl className="grid max-w-3xl gap-4">
          <MetadataRow label="Genre">
            {categories.map((category) => (
              <Chip key={category.id || category.name} tone="emerald">
                {category.name}
              </Chip>
            ))}
          </MetadataRow>

          <MetadataRow label="Penulis">
            {author ? <Chip>{author}</Chip> : null}
          </MetadataRow>

          <MetadataRow label="Tahun Terbit">
            {year ? <Chip>{year}</Chip> : null}
          </MetadataRow>
        </dl>
      ) : null}
    </div>
  );
}
