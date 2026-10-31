// Must match server/src/lib/schemas.ts. The server rejects any other value.
export const LOCATIONS = ["India", "USA", "UK", "Middle East"] as const;
export const PURPOSES = ["Investment", "Self-use (to live in)", "Holiday home", "Both investment and self-use"] as const;
export const CONFIGURATIONS = [
  "Studio",
  "1 Bedroom",
  "2 Bedroom",
  "3 Bedroom",
  "Ocean View Residence (lower levels, closest to the sea)",
  "Sky Penthouse (4–5 Bedroom)",
  "Retail / Shop",
  "Not sure yet",
] as const;
export const DIAL_CODES = [
  { code: "+91", label: "🇮🇳 +91" },
  { code: "+1", label: "🇺🇸 +1" },
  { code: "+44", label: "🇬🇧 +44" },
  { code: "+971", label: "🇦🇪 +971" },
  { code: "+966", label: "🇸🇦 +966" },
  { code: "+974", label: "🇶🇦 +974" },
  { code: "+968", label: "🇴🇲 +968" },
  { code: "+973", label: "🇧🇭 +973" },
  { code: "+965", label: "🇰🇼 +965" },
] as const;
