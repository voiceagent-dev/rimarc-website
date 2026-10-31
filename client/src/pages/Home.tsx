import { Link } from "react-router";
import { ArrowRight, KeyRound, Lock, ShieldCheck, UserCheck } from "lucide-react";
import Picture from "../components/Picture";
import PhoneMockup from "../components/PhoneMockup";
import { Arc, Eyebrow, Reveal } from "../components/Brand";
import { usePageTitle } from "../lib/usePageTitle";
import WhatItSolves from "../sections/WhatItSolves";
import HeroAnimation from "../components/HeroAnimation";

export default function Home() {
  usePageTitle("RIMARC AI · Automate Beyond Limits");
  return (
    <>
      <Hero />
      <WhatItSolves />
      <VoiceSpotlight />
      <Trust />
      <ClosingCta />
    </>
  );
}

function Hero() {
  return (
    <section className="container-page grid items-center gap-14 pb-20 pt-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:pb-28 lg:pt-20">
      <div>
        <Reveal>
          <Eyebrow>AI automation · Agentic AI</Eyebrow>
          <h1 className="display mt-6 text-[52px] sm:text-[72px] lg:text-[88px]">
            Automate <span className="arc-text font-normal">Beyond</span> Limits.
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-relaxed text-muted sm:text-xl">
            AI agents, workflow automation and intelligent integrations that turn complex business processes into
            efficient, connected workflows.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link to="/demos/ai-voice-sales-agent" className="btn-primary">
              Try a Live Demo <ArrowRight size={17} />
            </Link>
            <Link to="/demos/ai-voice-sales-agent#how-it-works" className="btn-secondary">
              See how it works
            </Link>
          </div>
          <p className="mt-8 flex items-center gap-2.5 text-[14px] text-muted">
            <span className="pulse-dot h-2 w-2 rounded-full bg-arc-teal" aria-hidden="true" />
            Live now: get a call from our AI voice agent within a minute.
          </p>
        </Reveal>
      </div>

      <Reveal delay={150}>
        <HeroAnimation />
      </Reveal>
    </section>
  );
}

function VoiceSpotlight() {
  return (
    <section id="voice" className="container-page scroll-mt-28">
      <Reveal>
        <div className="card relative overflow-hidden px-6 pb-10 pt-24 sm:px-12 sm:pt-20 lg:px-14 lg:pb-14">
          <Arc className="pointer-events-none absolute left-8 right-8 top-5 h-12 w-[calc(100%-4rem)] sm:h-20" />
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3.5 py-1.5 text-[13px] font-medium">
                <span className="pulse-dot h-2 w-2 rounded-full bg-arc-teal" aria-hidden="true" />
                Voice AI · Live demo
              </span>
              <h2 className="heading mt-6 text-[40px] sm:text-[52px]">AI Voice Sales Agent</h2>
              <p className="mt-4 max-w-lg text-lg text-muted">
                Fill a short form and our AI agent calls you within a minute. It understands your needs, answers your
                questions and books a meeting, just as it would with a real lead.
              </p>
              <ol className="mt-8 grid gap-3 sm:grid-cols-3">
                {["Enter your details", "Receive a call", "Meeting booked"].map((step, i) => (
                  <li key={step} className="rounded-2xl border border-line bg-white px-4 py-4">
                    <span className="text-[12px] font-semibold text-subtle">0{i + 1}</span>
                    <p className="mt-1 text-[15px] font-medium">{step}</p>
                  </li>
                ))}
              </ol>
              <Link to="/demos/ai-voice-sales-agent" className="btn-primary mt-9">
                Get a demo call <ArrowRight size={17} />
              </Link>
            </div>

            <div className="relative">
              <Picture
                slug="demo-dubai-skyline"
                alt="Dubai skyline at sunset with Burj Khalifa"
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="aspect-[4/5] rounded-[1.5rem] sm:aspect-[5/6]"
              />
              <div className="absolute inset-0 rounded-[1.5rem] bg-gradient-to-t from-navy/55 via-navy/10 to-transparent" />
              <div className="absolute inset-0 flex items-center justify-center">
                <PhoneMockup className="scale-[0.8] sm:scale-90 lg:scale-95" />
              </div>
              <div className="absolute right-3 top-6 hidden max-w-[210px] rounded-2xl sm:block rounded-tr-sm bg-white px-4 py-3 text-[13px] shadow-[var(--shadow-float)] sm:right-5">
                “Are you looking for investment or self-use?”
              </div>
              <div className="absolute bottom-6 left-3 inline-flex items-center gap-2 rounded-full bg-navy px-4 py-2 text-[13px] font-medium text-white shadow-[var(--shadow-float)] sm:left-5">
                Meeting booked ✓
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function Trust() {
  const points = [
    { icon: Lock, title: "Encrypted in transit", text: "Every page and form runs over HTTPS with strict security headers." },
    { icon: UserCheck, title: "Consent first", text: "We only call people who ask for a call, once, and never for marketing." },
    { icon: KeyRound, title: "Secrets stay on the server", text: "API keys and credentials never reach the browser." },
    { icon: ShieldCheck, title: "Minimal data", text: "We collect only what the demo needs and don't sell or share it." },
  ];
  return (
    <section className="container-page py-28 lg:py-36">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <Reveal>
          <Picture
            slug="trust-security"
            alt="Engineers working in a secure server room"
            sizes="(min-width: 1024px) 45vw, 100vw"
            className="aspect-[4/3] rounded-[var(--radius-card)] lg:aspect-[5/6]"
          />
        </Reveal>
        <Reveal delay={120}>
          <Eyebrow>Trust & Transparency</Eyebrow>
          <h2 className="heading mt-5 text-[38px] sm:text-[50px]">Responsible AI, secure by design</h2>
          <p className="mt-5 max-w-lg text-lg text-muted">
            We build automation that protects your customers' data as carefully as you do.
          </p>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2">
            {points.map(({ icon: Icon, title, text }) => (
              <li key={title} className="card p-6">
                <Icon size={22} className="text-arc-violet" />
                <p className="mt-4 font-semibold">{title}</p>
                <p className="mt-1.5 text-[14px] leading-relaxed text-muted">{text}</p>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}

function ClosingCta() {
  return (
    <section className="container-page pb-24">
      <Reveal>
        <div className="relative overflow-hidden rounded-[2rem] bg-navy">
          <Picture
            slug="cta-laptop"
            alt=""
            sizes="100vw"
            className="absolute inset-0 h-full w-full !bg-navy opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/80 to-navy/30" />
          <Arc className="pointer-events-none absolute left-10 right-10 top-8 h-20 w-[calc(100%-5rem)] opacity-90" />
          <div className="relative px-8 py-24 text-center sm:px-14 lg:py-32">
            <h2 className="heading mx-auto max-w-3xl text-[36px] text-white sm:text-[54px]">
              Ready to make your business smarter with AI?
            </h2>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <Link to="/contact" className="btn bg-white text-ink hover:-translate-y-0.5">
                Contact Us <ArrowRight size={17} />
              </Link>
              <Link to="/demos/ai-voice-sales-agent" className="btn border border-white/30 text-white hover:border-white/60">
                Try the live demo
              </Link>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
