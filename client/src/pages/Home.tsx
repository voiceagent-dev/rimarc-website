import type { ReactNode } from "react";
import { Link } from "react-router";
import { ArrowRight, ArrowUpRight, CalendarCheck2, KeyRound, Lock, ShieldCheck, UserCheck } from "lucide-react";
import Picture from "../components/Picture";
import PhoneMockup from "../components/PhoneMockup";
import { Arc, Eyebrow, Reveal, Waveform } from "../components/Brand";
import { SERVICES } from "../data/services";
import { DEMOS } from "../data/demos";
import { usePageTitle } from "../lib/usePageTitle";

export default function Home() {
  usePageTitle("RIMARC AI · Automate Beyond Limits");
  return (
    <>
      <Hero />
      <VoiceSpotlight />
      <Services />
      <Demos />
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
            <Link to="/#services" className="btn-secondary">
              Our Services
            </Link>
          </div>
          <p className="mt-8 flex items-center gap-2.5 text-[14px] text-muted">
            <span className="pulse-dot h-2 w-2 rounded-full bg-arc-teal" aria-hidden="true" />
            Live now: get a call from our AI voice agent within a minute.
          </p>
        </Reveal>
      </div>

      <Reveal delay={150} className="relative">
        <Picture
          slug="hero-ai"
          alt="A glowing 3D rendering of the letters AI on a circuit surface"
          sizes="(min-width: 1024px) 46vw, 100vw"
          priority
          className="aspect-[5/4] rounded-[2rem] lg:aspect-square"
          imgClassName="object-[62%_50%]"
        />
        <div className="float absolute -left-4 top-10 rounded-2xl border border-white/60 bg-white/90 px-4 py-3 shadow-[var(--shadow-float)] backdrop-blur sm:-left-8">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-subtle">Voice AI · Live call</p>
          <Waveform bars={20} className="mt-1 !h-9" />
        </div>
        <div className="float absolute -right-3 bottom-10 flex items-center gap-3 rounded-2xl bg-navy px-4 py-3 text-white shadow-[var(--shadow-float)] [animation-delay:1.5s] sm:-right-6">
          <CalendarCheck2 size={20} className="text-arc-teal" />
          <div>
            <p className="text-[14px] font-semibold">Meeting booked</p>
            <p className="text-[12px] text-white/65">Tomorrow · 4:15 PM</p>
          </div>
        </div>
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

function SectionHeader({ eyebrow, title, text, action }: { eyebrow: string; title: string; text?: string; action?: ReactNode }) {
  return (
    <Reveal className="grid items-end gap-6 lg:grid-cols-2">
      <div>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 className="heading mt-5 text-[38px] sm:text-[50px]">{title}</h2>
      </div>
      {text && <p className="max-w-lg text-lg text-muted lg:justify-self-end">{text}</p>}
      {action && <div className="lg:justify-self-end">{action}</div>}
    </Reveal>
  );
}

function Services() {
  const [first, second, ...rest] = SERVICES;
  return (
    <section id="services" className="container-page scroll-mt-28 py-28 lg:py-36">
      <SectionHeader
        eyebrow="Services"
        title="Intelligent solutions for every workflow"
        text="From single tasks to multi-step processes, we design AI that works inside your business."
      />
      <div className="mt-14 grid gap-5 lg:grid-cols-2">
        {[first!, second!].map((s, i) => (
          <Reveal key={s.title} delay={i * 100}>
            <article className="group relative h-[420px] overflow-hidden rounded-[var(--radius-card)] sm:h-[480px]">
              <Picture
                slug={s.image}
                alt={s.alt}
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="absolute inset-0 h-full w-full"
                imgClassName="transition-transform duration-[1.2s] ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-7 text-white sm:p-9">
                <h3 className="text-2xl font-semibold tracking-tight sm:text-[28px]">{s.title}</h3>
                <p className="mt-2 max-w-md text-[15px] text-white/80">{s.description}</p>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
      <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {rest.map((s, i) => (
          <Reveal key={s.title} delay={i * 80}>
            <article className="card group h-full overflow-hidden">
              <Picture
                slug={s.image}
                alt={s.alt}
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                className="aspect-[4/3]"
                imgClassName="transition-transform duration-[1.2s] ease-out group-hover:scale-105"
              />
              <div className="p-6">
                <h3 className="text-[18px] font-semibold tracking-tight">{s.title}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-muted">{s.description}</p>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Demos() {
  return (
    <section id="demos" className="container-page scroll-mt-28 pb-28 lg:pb-36">
      <SectionHeader
        eyebrow="Live Demos"
        title="See our AI agents in action"
        action={
          <Link to="/contact" className="btn-secondary">
            Request a custom demo <ArrowUpRight size={16} />
          </Link>
        }
      />
      <div className="mt-14 grid gap-5 md:grid-cols-2">
        {DEMOS.map((d, i) => (
          <Reveal key={d.slug} delay={i * 100}>
            <article className="card group flex h-full flex-col p-4">
              <div className="relative overflow-hidden rounded-[1.25rem]">
                <Picture
                  slug={d.image}
                  alt=""
                  sizes="(min-width: 768px) 45vw, 100vw"
                  className={`aspect-[16/10] ${d.status === "soon" ? "grayscale-[60%]" : ""}`}
                  imgClassName="transition-transform duration-[1.2s] ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
                {d.status === "live" && <Waveform bars={34} className="absolute bottom-5 left-6 right-6" />}
              </div>
              <div className="flex flex-1 flex-col px-3 pb-3 pt-6">
                <span
                  className={`w-fit rounded-full px-3 py-1 text-[12px] font-semibold tracking-[0.12em] ${
                    d.status === "live" ? "bg-ink text-white" : "bg-surface-2 text-muted"
                  }`}
                >
                  {d.status === "live" ? "LIVE" : "COMING SOON"}
                </span>
                <p className="mt-4 text-[14px] text-muted">{d.category}</p>
                <h3 className="mt-1 text-2xl font-normal tracking-tight">{d.title}</h3>
                <p className="mt-2 text-[15px] text-muted">{d.description}</p>
                <div className="mt-auto pt-7">
                  {d.href ? (
                    <Link to={d.href} className="btn-secondary">
                      {d.cta} <ArrowRight size={16} />
                    </Link>
                  ) : (
                    <span className="btn-secondary cursor-not-allowed opacity-60" aria-disabled="true">
                      {d.cta}
                    </span>
                  )}
                </div>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
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
    <section className="container-page pb-28 lg:pb-36">
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
