import { CalendarCheck2, ClipboardList, FileText, PhoneCall } from "lucide-react";
import { Waveform } from "./Brand";

/**
 * Animated hero illustration: a lead flows into the AI voice agent, which calls,
 * captures requirements and books a meeting. Pulses travel along the connections
 * and each step lights up in turn (an 8-second loop). Pure SVG + CSS, no scripts.
 */
const CORE = { x: 250, y: 250 };
const NODES = [
  { id: "lead", x: 92, y: 96, path: "M92 96 C 150 120, 190 170, 250 250", into: true },
  { id: "call", x: 408, y: 96, path: "M250 250 C 310 170, 350 120, 408 96", into: false },
  { id: "capture", x: 408, y: 404, path: "M250 250 C 310 330, 350 380, 408 404", into: false },
  { id: "meeting", x: 92, y: 404, path: "M250 250 C 190 330, 150 380, 92 404", into: false },
] as const;

const STEP = 0.25; // each of the 4 steps takes a quarter of the loop

/** keyTimes/keyPoints so the pulse waits at the start, travels during its step, then rests at the end. */
function stepTiming(i: number) {
  const s = i * STEP;
  const e = s + STEP;
  const times = [0, s, e, 1];
  const points = [0, 0, 1, 1];
  const keep = times.map((t, k) => k === 0 || t !== times[k - 1]);
  return {
    keyTimes: times.filter((_, k) => keep[k]).join(";"),
    keyPoints: points.filter((_, k) => keep[k]).join(";"),
  };
}

/** Visible only while travelling. */
function stepOpacity(i: number) {
  const s = i * STEP;
  const e = s + STEP;
  return s === 0
    ? { values: "1;0", keyTimes: `0;${e}` }
    : { values: e >= 1 ? "0;1" : "0;1;0", keyTimes: e >= 1 ? `0;${s}` : `0;${s};${e}` };
}

export default function HeroAnimation() {
  return (
    <div
      className="hero-anim relative aspect-square w-full overflow-hidden rounded-[2rem] border border-line bg-gradient-to-br from-white via-canvas to-surface"
      role="img"
      aria-label="Animation: a new lead is called by the AI voice agent, requirements are captured and a meeting is booked"
    >
      {/* soft drifting colour glows */}
      <div className="glow glow-a" aria-hidden="true" />
      <div className="glow glow-b" aria-hidden="true" />
      <div className="glow glow-c" aria-hidden="true" />
      <div className="absolute inset-0 bg-[radial-gradient(rgb(11_20_38_/_0.07)_1px,transparent_1px)] [background-size:22px_22px]" aria-hidden="true" />

      {/* connections with travelling pulses */}
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 500 500" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id="flow" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#FF7A1A" />
            <stop offset="0.4" stopColor="#F2367E" />
            <stop offset="0.7" stopColor="#8B5CF6" />
            <stop offset="1" stopColor="#14B8A6" />
          </linearGradient>
        </defs>
        {NODES.map((n, i) => (
          <g key={n.id}>
            <path d={n.path} stroke="rgb(11 20 38 / 0.10)" strokeWidth="2" />
            <path d={n.path} stroke="url(#flow)" strokeWidth="2.5" strokeLinecap="round" className="flow-line" style={{ animationDelay: `${i * 2}s` }} />
            <circle r="5" fill="#fff" stroke="url(#flow)" strokeWidth="2.5" opacity="0">
              {/* One shared 8s timeline: this pulse travels only during its own 2s step. */}
              <animateMotion dur="8s" repeatCount="indefinite" path={n.path} calcMode="linear" {...stepTiming(i)} />
              <animate attributeName="opacity" dur="8s" repeatCount="indefinite" calcMode="discrete" {...stepOpacity(i)} />
            </circle>
          </g>
        ))}
        {/* rotating orbit around the core */}
        <circle cx={CORE.x} cy={CORE.y} r="92" stroke="url(#flow)" strokeWidth="1.5" strokeDasharray="4 10" className="orbit" opacity="0.6" />
      </svg>

      {/* AI agent core */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="core-ring relative grid h-[34cqw] max-h-44 w-[34cqw] max-w-44 min-h-28 min-w-28 place-items-center rounded-full p-[3px]">
          <div className="grid h-full w-full place-items-center rounded-full bg-white shadow-[var(--shadow-float)]">
            <div className="text-center">
              <Waveform bars={14} className="mx-auto !h-8 justify-center" />
              <p className="mt-1 text-[13px] font-semibold tracking-tight">AI Voice Agent</p>
              <p className="text-[11px] text-muted">working 24/7</p>
            </div>
          </div>
        </div>
      </div>

      {/* step cards */}
      <StepCard className="left-[4%] top-[8%]" step={0} icon={FileText} title="New lead" sub="Rohan · 2 Bedroom" />
      <StepCard className="right-[4%] top-[8%]" step={1} icon={PhoneCall} title="Calling now" sub="Answered in 37 sec" />
      <StepCard className="bottom-[8%] right-[4%]" step={2} icon={ClipboardList} title="Requirements captured" sub="₹4–5 Cr · 3 months" />
      <StepCard className="bottom-[8%] left-[4%]" step={3} icon={CalendarCheck2} title="Meeting booked" sub="Tue · 4:15 PM ✓" />
    </div>
  );
}

function StepCard({
  className,
  step,
  icon: Icon,
  title,
  sub,
}: {
  className: string;
  step: number;
  icon: typeof FileText;
  title: string;
  sub: string;
}) {
  return (
    <div
      className={`step-card absolute flex max-w-[45%] items-center gap-2 rounded-2xl border border-white/70 bg-white/90 py-2 pl-2 pr-2.5 sm:gap-2.5 sm:py-2.5 sm:pl-2.5 sm:pr-3.5 shadow-[0_14px_40px_-20px_rgb(11_20_38_/_0.45)] backdrop-blur ${className}`}
      style={{ animationDelay: `${step * 2}s` }}
    >
      <span className="step-icon grid h-7 w-7 shrink-0 sm:h-9 sm:w-9 place-items-center rounded-xl bg-surface text-ink" style={{ animationDelay: `${step * 2}s` }}>
        <Icon className="h-[15px] w-[15px] sm:h-[17px] sm:w-[17px]" />
      </span>
      <span className="min-w-0 leading-tight">
        <span className="block text-[11.5px] font-semibold sm:text-[13px]">{title}</span>
        <span className="block text-[10.5px] text-muted sm:text-[11.5px]">{sub}</span>
      </span>
    </div>
  );
}
