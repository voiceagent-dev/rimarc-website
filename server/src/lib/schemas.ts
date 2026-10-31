import { z } from "zod";

// Single source of truth for the allowed form values. Anything else is rejected.
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
export const DIAL_CODES = ["+91", "+1", "+44", "+971", "+966", "+974", "+968", "+973", "+965"] as const;

// Letters (any language), spaces, apostrophes, dots and hyphens. No digits, symbols or markup.
const NAME_RE = /^[\p{L}][\p{L}\p{M} .'-]{1,79}$/u;

const trimmed = (max: number) =>
  z
    .string()
    .transform((s) => s.normalize("NFKC").replace(/\s+/g, " ").trim())
    .pipe(z.string().max(max));

const botFields = {
  // Honeypot: hidden from people, so it must stay empty.
  company_website: z.string().max(0, "Invalid submission").optional().default(""),
  // Milliseconds the form was open before submitting; bots submit instantly.
  elapsed_ms: z.number().int().min(0).max(86_400_000),
  turnstile_token: z.string().max(4096).optional(),
};

export const DemoCallSchema = z
  .object({
    full_name: trimmed(80).pipe(z.string().regex(NAME_RE, "Please enter your full name")),
    email: trimmed(254).pipe(z.string().toLowerCase().email("Please enter a valid email")),
    dial_code: z.enum(DIAL_CODES),
    phone_number: z.string().trim().max(20).regex(/^[0-9 ()-]{6,20}$/, "Please enter a valid phone number"),
    location: z.enum(LOCATIONS),
    purpose: z.enum(PURPOSES),
    configuration: z.enum(CONFIGURATIONS),
    consent: z.literal(true, { error: "Please agree to receive the demo call" }),
    ...botFields,
  })
  .strict();

export type DemoCallInput = z.infer<typeof DemoCallSchema>;

export const ContactSchema = z
  .object({
    full_name: trimmed(80).pipe(z.string().regex(NAME_RE, "Please enter your full name")),
    email: trimmed(254).pipe(z.string().toLowerCase().email("Please enter a valid email")),
    company: trimmed(120).optional().default(""),
    message: trimmed(2000).pipe(z.string().min(10, "Please write a little more")),
    consent: z.literal(true, { error: "Please agree to be contacted" }),
    ...botFields,
  })
  .strict();

export type ContactInput = z.infer<typeof ContactSchema>;
