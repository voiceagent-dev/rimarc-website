import { Phone, PhoneOff } from "lucide-react";
import { Waveform } from "./Brand";

/** Incoming-call phone illustration used in the Voice AI spotlight. */
export default function PhoneMockup({ className = "" }: { className?: string }) {
  return (
    <div className={className}>
      <div className="relative mx-auto w-[248px] rounded-[44px] border-[10px] border-navy bg-white p-5 pt-8 shadow-[var(--shadow-float)] sm:w-[268px]">
        <div className="absolute left-1/2 top-2.5 h-1.5 w-16 -translate-x-1/2 rounded-full bg-navy" />
        <p className="text-center text-[11px] font-medium uppercase tracking-[0.16em] text-subtle">Incoming call</p>
        <div className="mx-auto mt-5 grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-arc-orange via-arc-pink to-arc-violet text-xl font-semibold text-white">
          R
        </div>
        <p className="mt-3 text-center text-[17px] font-semibold">RIMARC AI Agent</p>
        <p className="text-center text-[12px] text-muted">Voice AI · Live demo</p>
        <Waveform className="mx-auto mt-6 justify-center" bars={24} />
        <div className="mt-8 flex items-center justify-around pb-2">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-red-500 text-white" aria-hidden="true">
            <PhoneOff size={22} />
          </span>
          <span className="grid h-14 w-14 place-items-center rounded-full bg-emerald-500 text-white" aria-hidden="true">
            <Phone size={22} />
          </span>
        </div>
      </div>
    </div>
  );
}
