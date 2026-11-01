import { Link } from "react-router";
import { ArrowRight, Compass, Eye, HeartHandshake, Lightbulb, Rocket, ShieldCheck, Sparkles, Target, Users } from "lucide-react";
import Picture from "../components/Picture";
import { Eyebrow, Reveal } from "../components/Brand";
import { VALUES } from "../data/services";
import { usePageMeta } from "../lib/usePageMeta";

const valueIcons = [Lightbulb, Target, Users, ShieldCheck, Sparkles, HeartHandshake];

export default function About() {
  usePageMeta("/about");
  return (
    <>
      <section className="container-page grid items-center gap-12 pb-20 pt-12 lg:grid-cols-2 lg:pt-20">
        <Reveal>
          <Eyebrow>About</Eyebrow>
          <h1 className="display mt-6 text-[44px] sm:text-[64px]">Creating smarter ways of working</h1>
          <p className="mt-6 text-lg leading-relaxed text-muted">
            RIMARC AI is an AI automation and technology solutions company. We combine AI, AI agents, workflow
            automation, large language models and system integrations to turn complex business processes into
            intelligent, connected and efficient workflows.
          </p>
          <p className="mt-6 border-l-2 border-arc-violet pl-5 text-lg text-ink">
            Automation is not just about doing things faster; it's about creating smarter ways of working.
          </p>
        </Reveal>
        <Reveal delay={120}>
          <Picture slug="about-team" alt="A team collaborating around laptops" sizes="(min-width: 1024px) 45vw, 100vw" priority className="aspect-[4/3] rounded-[var(--radius-card)]" />
        </Reveal>
      </section>

      <section className="container-page grid gap-5 pb-24 md:grid-cols-2">
        {[
          { icon: Rocket, label: "Our Mission", text: "To make intelligent automation accessible, practical and impactful for businesses of every size.", img: "about-mission" as const, alt: "Two colleagues celebrating a success" },
          { icon: Eye, label: "Our Vision", text: "A future where businesses run on intelligent, connected and autonomous systems, so people can focus on innovation, creativity and growth.", img: "about-values" as const, alt: "Colleagues discussing work at a laptop" },
        ].map(({ icon: Icon, label, text, img, alt }, i) => (
          <Reveal key={label} delay={i * 100}>
            <article className="relative h-[440px] overflow-hidden rounded-[var(--radius-card)]">
              <Picture slug={img} alt={alt} sizes="(min-width: 768px) 50vw, 100vw" className="absolute inset-0 h-full w-full" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-8 text-white sm:p-10">
                <Icon size={24} className="text-arc-teal" />
                <h2 className="mt-4 text-[28px] font-semibold tracking-tight">{label}</h2>
                <p className="mt-2 max-w-md text-white/85">{text}</p>
              </div>
            </article>
          </Reveal>
        ))}
      </section>

      <section className="container-page pb-24">
        <Reveal>
          <Eyebrow>Core values</Eyebrow>
          <h2 className="heading mt-5 text-[38px] sm:text-[50px]">What guides our work</h2>
        </Reveal>
        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {VALUES.map((v, i) => {
            const Icon = valueIcons[i] ?? Compass;
            return (
              <Reveal key={v.title} delay={i * 60}>
                <li className="card h-full p-7">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-white">
                    <Icon size={20} className="text-arc-violet" />
                  </span>
                  <p className="mt-5 text-lg font-semibold">{v.title}</p>
                  <p className="mt-1.5 text-[15px] leading-relaxed text-muted">{v.text}</p>
                </li>
              </Reveal>
            );
          })}
        </ul>
        <Reveal className="mt-14 text-center">
          <Link to="/contact" className="btn-primary">
            Work with us <ArrowRight size={17} />
          </Link>
        </Reveal>
      </section>
    </>
  );
}
