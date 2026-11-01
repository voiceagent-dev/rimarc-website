/** Title and description for every page. Used in the browser and when pages are pre-rendered at build time. */
export const ORIGIN = "https://www.rimarcai.com";

export type PageMeta = { title: string; description: string; indexable?: boolean };

export const PAGES = {
  "/": {
    title: "RIMARC AI · AI Voice Agents & Workflow Automation",
    description:
      "RIMARC AI builds AI voice agents and workflow automation. Our AI voice sales agent calls every new lead within a minute, captures requirements and books meetings. Try the live demo.",
  },
  "/demos/ai-voice-sales-agent": {
    title: "AI Voice Sales Agent · Live Demo · RIMARC AI",
    description:
      "Enter your details and get a live call from our AI voice sales agent within a minute. It speaks English and Hinglish, answers questions and books a meeting at your time.",
  },
  "/about": {
    title: "About · RIMARC AI",
    description: "RIMARC AI helps businesses embrace intelligent operations with AI agents, voice AI and automation.",
  },
  "/contact": {
    title: "Contact · RIMARC AI",
    description: "Tell us what you'd like to automate with AI agents or voice AI. We reply within one working day.",
  },
  "/privacy": {
    title: "Privacy Policy · RIMARC AI",
    description: "How RIMARC AI collects, uses and protects the details you share for a demo call or enquiry.",
  },
  "/404": {
    title: "Page not found · RIMARC AI",
    description: "This page doesn't exist. Visit RIMARC AI to try our live AI voice sales agent demo.",
    indexable: false,
  },
} satisfies Record<string, PageMeta>;

export type PagePath = keyof typeof PAGES;
