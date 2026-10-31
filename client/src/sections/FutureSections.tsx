// Home page sections hidden for the first launch. To show them again, import
// ServicesSection and DemosSection in pages/Home.tsx and add them back between
// <VoiceSpotlight /> and <Trust />, and restore the "Services" and "Live Demos" links in data/site.ts.
import type { ReactNode } from "react";
import { Link } from "react-router";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import Picture from "../components/Picture";
import { Eyebrow, Reveal, Waveform } from "../components/Brand";
import { SERVICES } from "../data/services";
import { DEMOS } from "../data/demos";

export function SectionHeader({ eyebrow, title, text, action }: { eyebrow: string; title: string; text?: string; action?: ReactNode }) {
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

export function ServicesSection() {
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

export function DemosSection() {
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

