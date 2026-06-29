const paths = {
  Accessibility: (
    <>
      <circle cx="12" cy="4" r="2" />
      <path d="M6 8h12" />
      <path d="M12 10v10" />
      <path d="m8 20 4-10 4 10" />
    </>
  ),
  Archive: (
    <>
      <path d="M3 7h18" />
      <path d="M5 7v12h14V7" />
      <path d="M4 4h16v3H4z" />
      <path d="M10 11h4" />
    </>
  ),
  BookOpen: (
    <>
      <path d="M12 6.5A6 6 0 0 0 5 5v14a6 6 0 0 1 7 1.5" />
      <path d="M12 6.5A6 6 0 0 1 19 5v14a6 6 0 0 0-7 1.5" />
      <path d="M12 6.5v14" />
    </>
  ),
  Bridge: (
    <>
      <path d="M4 18h16" />
      <path d="M6 18V9" />
      <path d="M18 18V9" />
      <path d="M6 9c3 4 9 4 12 0" />
      <path d="M8 18v-4" />
      <path d="M12 18v-5" />
      <path d="M16 18v-4" />
    </>
  ),
  ChevronDown: <path d="m6 9 6 6 6-6" />,
  FileText: (
    <>
      <path d="M14 3H6v18h12V7z" />
      <path d="M14 3v4h4" />
      <path d="M9 13h6" />
      <path d="M9 17h4" />
    </>
  ),
  GraduationCap: (
    <>
      <path d="m3 8 9-4 9 4-9 4z" />
      <path d="M7 10v5c3 2 7 2 10 0v-5" />
      <path d="M21 8v6" />
    </>
  ),
  Headphones: (
    <>
      <path d="M4 14a8 8 0 0 1 16 0" />
      <path d="M4 14v4a2 2 0 0 0 2 2h2v-7H6a2 2 0 0 0-2 2" />
      <path d="M20 14v4a2 2 0 0 1-2 2h-2v-7h2a2 2 0 0 1 2 2" />
    </>
  ),
  Image: (
    <>
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <circle cx="9" cy="10" r="1.5" />
      <path d="m7 17 4-4 3 3 2-2 3 3" />
    </>
  ),
  Menu: (
    <>
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </>
  ),
  MonitorSmartphone: (
    <>
      <rect x="3" y="4" width="13" height="11" rx="2" />
      <path d="M8 19h4" />
      <path d="M10 15v4" />
      <rect x="17" y="10" width="4" height="9" rx="1" />
    </>
  ),
  ScrollText: (
    <>
      <path d="M8 4h10a3 3 0 0 1 0 6H8a3 3 0 0 0 0-6Z" />
      <path d="M8 10v10h9" />
      <path d="M7 20a3 3 0 0 1 0-6h10" />
      <path d="M11 13h4" />
      <path d="M11 16h3" />
    </>
  ),
  Search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m16 16 4 4" />
    </>
  ),
  Sprout: (
    <>
      <path d="M12 20V10" />
      <path d="M12 10c0-4 3-6 7-6 0 4-2 7-7 7" />
      <path d="M12 13c0-3-2-5-6-5 0 4 2 6 6 6" />
    </>
  ),
  Users: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-8 0v2" />
      <circle cx="12" cy="8" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M2 21v-2a4 4 0 0 1 3-3.87" />
    </>
  ),
  Video: (
    <>
      <rect x="3" y="6" width="13" height="12" rx="2" />
      <path d="m16 10 5-3v10l-5-3z" />
    </>
  ),
};

export function Icon({ name, className = "h-5 w-5" }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      {paths[name]}
    </svg>
  );
}
