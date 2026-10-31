import { Link } from "react-router";
import { ArrowLeft, CalendarClock, Languages, MessagesSquare } from "lucide-react";
import DemoCallForm from "../components/DemoCallForm";
import Picture from "../components/Picture";
import { Eyebrow, Reveal, Waveform } from "../components/Brand";
import { usePageTitle } from "../lib/usePageTitle";

const transcript = [
  { who: "agent", text: "Hi, this is Rahul. Am I speaking with Rohan?" },
  { who: "you", text: "Yes, speaking." },
  { who: "agent", text: "Are you looking for investment or self-use?" },
  { who: "you", text: "Investment, a two bedroom." },
  { who: "agent", text: "What day and time suits you for a quick Google Meet?" },
  { who: "you", text: "Tomorrow, around four." },
] as const;

const features = [
  { icon: MessagesSquare, title: "Understands your needs", text: "Confirms your requirement and answers questions about the project." },
  { icon: CalendarClock, title: "Books at your time", text: "Turns “tomorrow evening” or “in an hour” into an exact, confirmed slot." },
  { icon: Languages, title: "Speaks your language", text: "Switches between English, Hindi and Hinglish as you speak." },
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

        <Reveal delay={120} className="flex flex-col gap-6">
          <div className="relative overflow-hidden rounded-[var(--radius-card)] bg-navy">
            <Picture slug="demo-show-apartment" alt="A bright, modern apartment living room" sizes="(min-width: 1024px) 45vw, 100vw" className="absolute inset-0 h-full w-full opacity-45" />
            <div className="absolute inset-0 bg-gradient-to-br from-navy/90 via-navy/70 to-[#3b1d6e]/70" />
            <div className="relative p-7 sm:p-9">
              <p className="text-[12px] font-medium uppercase tracking-[0.16em] text-white/60">What happens on the call</p>
              <Waveform bars={30} className="mt-4" />
              <ul className="mt-6 space-y-3">
                {transcript.map((m, i) => (
                  <li key={i} className={`flex ${m.who === "you" ? "justify-end" : "justify-start"}`}>
                    <span
                      className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-[14px] ${
                        m.who === "you" ? "rounded-br-sm bg-white/15 text-white" : "rounded-bl-sm bg-white text-ink"
                      }`}
                    >
                      {m.text}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-6 inline-flex rounded-full bg-arc-teal px-4 py-2 text-[13px] font-semibold text-navy">
                Meeting booked ✓
              </p>
            </div>
          </div>
          <ul className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            {features.map(({ icon: Icon, title, text }) => (
              <li key={title} className="card flex gap-4 p-5">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white">
                  <Icon size={19} className="text-arc-pink" />
                </span>
                <div>
                  <p className="font-semibold">{title}</p>
                  <p className="mt-1 text-[14px] leading-relaxed text-muted">{text}</p>
                </div>
              </li>
            ))}
          </ul>
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
