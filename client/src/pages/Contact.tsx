import { Linkedin, Mail } from "lucide-react";
import ContactForm from "../components/ContactForm";
import Picture from "../components/Picture";
import { Arc, Eyebrow, Reveal } from "../components/Brand";
import { SITE } from "../data/site";
import { usePageMeta } from "../lib/usePageMeta";

export default function Contact() {
  usePageMeta("/contact");
  return (
    <section className="container-page grid gap-12 pb-24 pt-12 lg:grid-cols-[1fr_1.1fr] lg:pt-20">
      <Reveal>
        <Eyebrow>Contact</Eyebrow>
        <h1 className="display mt-6 text-[44px] sm:text-[64px]">Let's build your next AI solution.</h1>
        <p className="mt-6 max-w-md text-lg text-muted">
          Tell us what you'd like to automate. We reply within one working day.
        </p>
        <div className="mt-8 flex flex-col gap-3 text-[15px]">
          <a href={`mailto:${SITE.email}`} className="inline-flex w-fit items-center gap-2.5 hover:text-arc-violet">
            <Mail size={18} /> {SITE.email}
          </a>
          <a href={SITE.linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex w-fit items-center gap-2.5 hover:text-arc-violet">
            <Linkedin size={18} /> RIMARC AI on LinkedIn
          </a>
        </div>
        <Picture slug="contact-office" alt="A team working together in a bright office" sizes="(min-width: 1024px) 40vw, 100vw" className="mt-10 aspect-[16/10] rounded-[var(--radius-card)]" />
      </Reveal>
      <Reveal delay={120}>
        <div className="card relative overflow-hidden p-6 sm:p-10">
          <Arc className="pointer-events-none absolute -top-2 left-6 right-6 h-14 w-[calc(100%-3rem)]" />
          <h2 className="relative text-2xl font-semibold tracking-tight">Send us a message</h2>
          <div className="relative mt-7">
            <ContactForm />
          </div>
        </div>
      </Reveal>
    </section>
  );
}
