import type { ImageSlug } from "../components/Picture";

export type Service = { title: string; description: string; image: ImageSlug; alt: string };

export const SERVICES: Service[] = [
  {
    title: "AI Agents & Agentic AI",
    description: "Intelligent agents that understand instructions, use tools and execute multi-step business tasks.",
    image: "service-agents",
    alt: "A friendly humanoid robot",
  },
  {
    title: "Voice AI Solutions",
    description: "Voice agents for lead qualification, customer support, appointment scheduling and follow-ups.",
    image: "service-voice",
    alt: "A person on a phone call while working on a laptop",
  },
  {
    title: "Workflow Automation",
    description: "Automate repetitive processes and connect your applications through intelligent workflows.",
    image: "service-workflow",
    alt: "A hand sketching a process flow diagram",
  },
  {
    title: "AI Chatbots & Virtual Assistants",
    description: "Conversational assistants that give instant answers to customers and employees.",
    image: "service-assistants",
    alt: "A robot reading on a bench",
  },
  {
    title: "AI Integration & Custom Solutions",
    description: "AI connected with your CRM, ERP, APIs and existing technology systems.",
    image: "service-integration",
    alt: "Network cables connected to a server switch",
  },
  {
    title: "AI Consulting & Transformation",
    description: "Find automation opportunities and implement AI aligned with measurable business outcomes.",
    image: "service-consulting",
    alt: "A team planning with sticky notes on a wall",
  },
];

export const VALUES = [
  { title: "Innovation First", text: "We explore emerging AI technologies to solve evolving business needs." },
  { title: "Purposeful Automation", text: "Automation should solve real problems and deliver measurable value." },
  { title: "Human-Centric AI", text: "Technology that empowers people and complements human intelligence." },
  { title: "Trust & Transparency", text: "Responsible AI, data privacy and security in everything we build." },
  { title: "Continuous Learning", text: "We embrace change and keep evolving our capabilities." },
  { title: "Customer Success", text: "Our success is measured by the outcomes we create for clients." },
];
