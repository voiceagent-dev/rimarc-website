import type { ReactNode } from "react";
import { ArrowRight, CheckCircle2, ClipboardList, FileText, MessageSquareText, Timer, UserRoundCheck } from "lucide-react";
import { Arc, Eyebrow, Reveal } from "../components/Brand";

/** The four problems the AI Voice Sales Agent solves, each with a small product-style visual. */
export default function WhatItSolves() {
  return (
    <section id="what-it-solves" className="container-page scroll-mt-28 pb-24 lg:pb-32">
      <Reveal className="grid items-end gap-6 lg:grid-cols-2">
        <div>
          <Eyebrow>What it solves</Eyebrow>
          <h2 className="heading mt-5 text-[36px] sm:text-[50px]">
            From form fill to a qualified conversation, in under a minute.
          </h2>
        </div>
        <p className="max-w-lg text-lg text-muted lg:justify-self-end">
          Every lead gets a fast, relevant first call, and your sales team gets everything it needs to close.
        </p>
      </Reveal>

      <div className="relative mt-14">
        <Arc className="pointer-events-none absolute -top-6 left-4 right-4 hidden h-16 w-[calc(100%-2rem)] opacity-70 md:block" strokeWidth={2} />
        <div className="relative grid gap-5 md:grid-cols-2">
          <SolveCard
            n="01"
            icon={Timer}
            title="Call leads while they're still interested"
            text="The agent calls within a minute of the form being submitted, before the lead moves on to someone else."
          >
            <SpeedVisual />
          </SolveCard>
          <SolveCard
            n="02"
            icon={MessageSquareText}
            title="Every call starts with context"
            text="It already knows the name, purpose and home type from the form, so it confirms them instead of asking again."
            delay={80}
          >
            <ContextVisual />
          </SolveCard>
          <SolveCard
            n="03"
            icon={ClipboardList}
            title="Every answer captured, structured"
            text="Budget, timeline, objections and open questions are saved as clean fields, not buried in a recording."
            delay={160}
          >
            <CaptureVisual />
          </SolveCard>
          <SolveCard
            n="04"
            icon={UserRoundCheck}
            title="Your team picks up where the AI left off"
            text="The advisor gets a ready handoff note before the meeting. No more “so, tell me again what you need?”"
            delay={240}
          >
            <HandoffVisual />
          </SolveCard>
        </div>
      </div>

      <Reveal className="mt-8">
        <div className="flex justify-center rounded-[var(--radius-card)] border border-line bg-white px-6 py-6 sm:px-8">
          <ol className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-[15px] font-medium">
            {["Form", "AI call in < 1 min", "Requirements captured", "Advisor ready"].map((step, i, all) => (
              <li key={step} className="flex items-center gap-3">
                <span>{step}</span>
                {i < all.length - 1 && <ArrowRight size={16} className="text-arc-pink" aria-hidden="true" />}
              </li>
            ))}
          </ol>
        </div>
      </Reveal>
    </section>
  );
}

type CardProps = {
  n: string;
  icon: typeof Timer;
  title: string;
  text: string;
  delay?: number;
  children: ReactNode;
};

function SolveCard({ n, icon: Icon, title, text, delay = 0, children }: CardProps) {
  return (
    <Reveal delay={delay} className="h-full">
      <article className="card flex h-full flex-col gap-7 p-7 sm:p-9">
        <div className="flex items-start justify-between gap-4">
          <span className="arc-text text-[44px] font-light leading-none">{n}</span>
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-white">
            <Icon size={20} className="text-arc-violet" aria-hidden="true" />
          </span>
        </div>
        <div>
          <h3 className="text-[22px] font-semibold tracking-tight sm:text-2xl">{title}</h3>
          <p className="mt-2 text-[15px] leading-relaxed text-muted">{text}</p>
        </div>
        <div className="mt-auto" aria-hidden="true">
          {children}
        </div>
      </article>
    </Reveal>
  );
}

const panel = "rounded-2xl border border-line bg-white p-4 shadow-[0_10px_30px_-18px_rgb(11_20_38_/_0.35)]";

function SpeedVisual() {
  return (
    <div className={panel}>
      <div className="flex items-center justify-between text-[14px]">
        <span className="flex items-center gap-2 text-muted">
          <FileText size={15} /> Form submitted
        </span>
        <span className="font-mono text-ink">10:02:14</span>
      </div>
      <div className="my-3 flex items-center gap-2">
        <span className="h-[3px] flex-1 rounded-full bg-gradient-to-r from-arc-orange via-arc-pink to-arc-teal" />
        <span className="rounded-full bg-surface px-2.5 py-0.5 text-[12px] font-semibold text-ink">37 sec</span>
      </div>
      <div className="flex items-center justify-between text-[14px]">
        <span className="flex items-center gap-2 font-medium text-ink">
          <CheckCircle2 size={15} className="text-arc-teal" /> AI call started
        </span>
        <span className="font-mono text-ink">10:02:51</span>
      </div>
    </div>
  );
}

function ContextVisual() {
  return (
    <div className="grid gap-3 sm:grid-cols-[1fr_auto_1.3fr] sm:items-center">
      <div className={`${panel} text-[13px]`}>
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-subtle">Enquiry form</p>
        <p className="mt-2 font-semibold text-ink">Stevie</p>
        <p className="text-muted">Investment · 2 Bedroom</p>
      </div>
      <ArrowRight size={18} className="mx-auto rotate-90 text-arc-pink sm:rotate-0" />
      <div className="rounded-2xl rounded-bl-sm bg-navy px-4 py-3 text-[14px] text-white">
        “I see you're looking at a 2 bedroom for investment, right?”
      </div>
    </div>
  );
}

function CaptureVisual() {
  const fields: [string, string][] = [
    ["Budget", "₹4–5 Cr"],
    ["Timeline", "3 months"],
    ["Objection", "Handover date"],
    ["Video call", "Tue 4:15 PM ✓"],
  ];
  return (
    <div className="flex flex-wrap gap-2">
      {fields.map(([k, v]) => (
        <span key={k} className="rounded-full border border-line bg-white px-3.5 py-2 text-[13px]">
          <span className="text-muted">{k}:</span> <span className="font-semibold text-ink">{v}</span>
        </span>
      ))}
    </div>
  );
}

function HandoffVisual() {
  return (
    <div className={panel}>
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-subtle">Advisor handoff note</p>
        <span className="rounded-full bg-arc-orange/10 px-2.5 py-0.5 text-[11px] font-bold tracking-[0.1em] text-arc-orange">WARM</span>
      </div>
      <p className="mt-2 text-[14px] leading-relaxed text-ink">
        Stevie · Investment · 2 Bedroom · Budget ₹4–5 Cr
        <br />
        <span className="text-muted">Pending:</span> payment plan
        <br />
        <span className="text-muted">Next:</span> Video call booked, Tue 4:15 PM
      </p>
    </div>
  );
}
