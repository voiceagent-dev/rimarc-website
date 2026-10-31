import { useEffect, useId, useRef, useState, type ReactNode } from "react";

/**
 * Header/footer logo. The wordmark is real text (sharp at any size, on any screen) and the
 * arc is drawn with a fixed 3.4px line, so nothing turns thin or blurry when the logo is small.
 */
export function Logo({ variant = "dark", className = "" }: { variant?: "dark" | "light"; className?: string }) {
  const id = useId();
  return (
    <span
      role="img"
      aria-label="RIMARC AI"
      className={`relative inline-block h-[50px] w-[176px] select-none ${className}`}
    >
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 176 50" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id={id} x1="0" x2="1">
            <stop offset="0" stopColor="#FF7A1A" />
            <stop offset="0.35" stopColor="#F2367E" />
            <stop offset="0.68" stopColor="#8B5CF6" />
            <stop offset="1" stopColor="#14B8A6" />
          </linearGradient>
        </defs>
        <path d="M4 37.5 C 4.5 10, 50 3.4, 104 4.4 C 132 5.5, 152 8.8, 165 12.6" stroke={`url(#${id})`} strokeWidth="3.4" strokeLinecap="round" />
        <circle cx="166" cy="12.9" r="4" fill="#14B8A6" />
      </svg>
      <span
        aria-hidden="true"
        className={`absolute bottom-[3px] left-[13px] whitespace-nowrap text-[26px] font-extrabold leading-none tracking-[-0.025em] ${
          variant === "light" ? "text-white" : "text-ink"
        }`}
      >
        RIMARC <span className="arc-text">AI</span>
      </span>
    </span>
  );
}

/** The signature gradient arc from the logo, used as a decorative line. */
export function Arc({ className = "", animate = true, strokeWidth = 3 }: { className?: string; animate?: boolean; strokeWidth?: number }) {
  const id = useId();
  return (
    <svg className={className} viewBox="0 0 1200 120" fill="none" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" x2="1">
          <stop offset="0" stopColor="#FF7A1A" />
          <stop offset="0.35" stopColor="#F2367E" />
          <stop offset="0.68" stopColor="#8B5CF6" />
          <stop offset="1" stopColor="#14B8A6" />
        </linearGradient>
      </defs>
      <path
        d="M10 110 C 260 20, 820 -10, 1180 40"
        stroke={`url(#${id})`}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        pathLength={1}
        className={animate ? "draw-arc" : ""}
      />
    </svg>
  );
}

/** Animated voice waveform in the arc gradient. */
export function Waveform({ bars = 28, className = "" }: { bars?: number; className?: string }) {
  const colors = ["#FF7A1A", "#F2367E", "#8B5CF6", "#14B8A6"];
  return (
    <div className={`flex h-12 items-center gap-[3px] ${className}`} aria-hidden="true">
      {Array.from({ length: bars }, (_, i) => {
        const t = i / (bars - 1);
        const color = colors[Math.min(3, Math.floor(t * 4))];
        const h = 30 + 70 * Math.abs(Math.sin(i * 1.7));
        return (
          <span
            key={i}
            className="wave-bar w-[3px] rounded-full"
            style={{ height: `${h}%`, background: color, animationDelay: `${(i % 7) * 0.12}s` }}
          />
        );
      })}
    </div>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="eyebrow">{children}</p>;
}

/** Fades content in as it scrolls into view. */
export function Reveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.08 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} className={`reveal ${visible ? "is-visible" : ""} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}
