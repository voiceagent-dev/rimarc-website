import type { ImageSlug } from "../components/Picture";

// To add a new demo: add an entry here (status "live") and a page under src/pages.
export type Demo = {
  slug: string;
  status: "live" | "soon";
  category: string;
  title: string;
  description: string;
  image: ImageSlug;
  href?: string;
  cta: string;
};

export const DEMOS: Demo[] = [
  {
    slug: "ai-voice-sales-agent",
    status: "live",
    category: "Voice AI · Real Estate",
    title: "AI Voice Sales Agent",
    description: "Submit a short form and receive a live call from our AI agent.",
    image: "card-voice-dubai",
    href: "/demos/ai-voice-sales-agent",
    cta: "Get a demo call",
  },
  {
    slug: "more-demos",
    status: "soon",
    category: "Live Demos",
    title: "More demos on the way",
    description: "New AI agents for support, operations and sales are being added.",
    image: "card-coming-soon",
    cta: "Coming soon",
  },
];
