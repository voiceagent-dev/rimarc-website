import { Link } from "react-router";
import { ArrowLeft, CalendarClock, Languages, MessagesSquare } from "lucide-react";
import DemoCallForm from "../components/DemoCallForm";
import Picture from "../components/Picture";
import { Eyebrow, Reveal, Waveform } from "../components/Brand";
import { usePageTitle } from "../lib/usePageTitle";

type Line =
  | { kind: "agent" | "you"; text: string }
  | { kind: "tag"; icon: typeof MessagesSquare; label: string; note: string };

// A sample call. The labels mark the three things the agent is doing at that moment.
const transcript: Line[] = [
  { kind: "agent", text: "Hi, this is Rahul. Am I speaking with Stevie?" },
  { kind: "you", text: "Yes, speaking." },
  { kind: "agent", text: "Thanks for your enquiry. I see you're looking at a two bedroom for investment, right?" },
  { kind: "you", text: "Yes. When is the handover?" },
  { kind: "agent", text: "Handover is planned for the fourth quarter of 2029." },
  { kind: "tag", icon: MessagesSquare, label: "Understands your needs", note: "Confirms the form details and answers from project facts" },
  { kind: "you", text: "Achha, payment plan kya hai?" },
  { kind: "agent", text: "Bahut achha question hai. Exact payment plan hamare advisor aapko Google Meet pe share karenge." },
  { kind: "tag", icon: Languages, label: "Speaks your language", note: "Switches to Hinglish the moment you do" },
  { kind: "you", text: "Theek hai, ek ghante baad call kar lo." },
  { kind: "agent", text: "Toh confirm kar leta hoon: aaj, 5:15 PM, Google Meet. Sahi hai?" },
  { kind: "you", text: "Haan, sahi hai." },
  { kind: "tag", icon: CalendarClock, label: "Books at your time", note: "Turns “in an hour” into an exact, confirmed slot" },
];

export default function VoiceDemo() {
  usePageTitle(
    "AI Voice Sales Agent · Live Demo · RIMARC AI",
    "Enter your details and get a live call from our AI voice sales agent within a minute.",
  );
  return (
    <>
      <section className="container-page pb-14 pt-10 lg:pt-14">
        <nav aria-label="Breadcrumb" className="text-[14px] text-muted">
          <Link to="/" className="hover:text-ink">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-ink">AI Voice Sales Agent</span>
        </nav>
        <div className="mt-8 grid items-end gap-6 lg:grid-cols-2">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3.5 py-1.5 text-[13px] font-medium">
              <span className="pulse-dot h-2 w-2 rounded-full bg-arc-teal" aria-hidden="true" />
              LIVE DEMO · Voice AI
            </span>
            <h1 className="display mt-6 text-[44px] sm:text-[64px]">Get a live call from our AI sales agent.</h1>
          </Reveal>
          <Reveal delay={100}>
            <p className="max-w-lg text-lg text-muted lg:justify-self-end">
              Enter your details and our AI agent will call you, understand your requirements, answer questions about a
              Dubai sea-view residential project and book a meeting.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="container-page grid gap-6 pb-24 lg:grid-cols-[1.05fr_1fr]">
        <Reveal>
          <DemoCallForm />
        </Reveal>

        <Reveal delay={120}>
          <div className="relative h-full overflow-hidden rounded-[var(--radius-card)] bg-navy">
            <Picture slug="demo-show-apartment" alt="A bright, modern apartment living room" sizes="(min-width: 1024px) 45vw, 100vw" className="absolute inset-0 h-full w-full opacity-45" />
            <div className="absolute inset-0 bg-gradient-to-br from-navy/90 via-navy/70 to-[#3b1d6e]/70" />
            <div className="relative p-7 sm:p-9">
              <p className="text-[12px] font-medium uppercase tracking-[0.16em] text-white/60">What happens on the call</p>
              <Waveform bars={30} className="mt-4" />
              <ul className="mt-6 space-y-3">
                {transcript.map((m, i) =>
                  m.kind === "tag" ? (
                    <li key={i} className="flex justify-center py-1">
                      <span className="inline-flex max-w-full items-center gap-2.5 rounded-full border border-white/15 bg-white/[0.06] py-1.5 pl-2 pr-4 text-left backdrop-blur">
                        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gradient-to-br from-arc-orange via-arc-pink to-arc-violet">
                          <m.icon size={14} className="text-white" aria-hidden="true" />
                        </span>
                        <span className="text-[12.5px] leading-tight">
                          <span className="block font-semibold text-white">{m.label}</span>
                          <span className="block text-white/60">{m.note}</span>
                        </span>
                      </span>
                    </li>
                  ) : (
                    <li key={i} className={`flex ${m.kind === "you" ? "justify-end" : "justify-start"}`}>
                      <span
                        className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-[14px] ${
                          m.kind === "you" ? "rounded-br-sm bg-white/15 text-white" : "rounded-bl-sm bg-white text-ink"
                        }`}
                      >
                        {m.text}
                      </span>
                    </li>
                  ),
                )}
              </ul>
              <p className="mt-6 inline-flex rounded-full bg-arc-teal px-4 py-2 text-[13px] font-semibold text-navy">
                Meeting booked ✓
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      <section className="container-page pb-24">
        <Reveal className="card p-8 sm:p-12">
          <Eyebrow>How it works</Eyebrow>
          <ol className="mt-8 grid gap-6 md:grid-cols-4">
            {[
              ["Form submitted", "Your details go securely to our server."],
              ["AI agent calls you", "A voice agent calls your number within a minute."],
              ["Meeting booked", "It confirms a time that suits you and your email."],
              ["Sales team notified", "A summary reaches the advisor, ready for the meeting."],
            ].map(([t, d], i) => (
              <li key={t} className="relative">
                <span className="arc-text text-[34px] font-light">0{i + 1}</span>
                <p className="mt-2 font-semibold">{t}</p>
                <p className="mt-1 text-[14px] text-muted">{d}</p>
              </li>
            ))}
          </ol>
          <Link to="/" className="btn-secondary mt-10">
            <ArrowLeft size={16} /> Back to home
          </Link>
        </Reveal>
      </section>
    </>
  );
}
