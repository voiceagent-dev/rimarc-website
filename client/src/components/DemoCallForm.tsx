import { useMemo, useState, type FormEvent } from "react";
import { CheckCircle2, Loader2, PhoneCall } from "lucide-react";
import { CONFIGURATIONS, DIAL_CODES, LOCATIONS, PURPOSES } from "../data/formOptions";
import { formTimer, submitForm } from "../lib/api";
import { Arc } from "./Brand";

type Status = { kind: "idle" } | { kind: "sending" } | { kind: "done"; message: string } | { kind: "error"; message: string };

const NAME_RE = /^[\p{L}][\p{L}\p{M} .'-]{1,79}$/u;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function DemoCallForm() {
  const elapsed = useMemo(() => formTimer(), []);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [purpose, setPurpose] = useState<(typeof PURPOSES)[number]>("Investment");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const get = (k: string) => String(form.get(k) ?? "").trim();
    const payload = {
      full_name: get("full_name"),
      email: get("email"),
      dial_code: get("dial_code"),
      phone_number: get("phone_number"),
      location: get("location"),
      purpose,
      configuration: get("configuration"),
      consent: form.get("consent") === "on",
      company_website: get("company_website"),
      elapsed_ms: elapsed(),
    };

    // Quick checks in the browser; the server validates everything again.
    if (!NAME_RE.test(payload.full_name)) return setStatus({ kind: "error", message: "Please enter your full name." });
    if (!EMAIL_RE.test(payload.email)) return setStatus({ kind: "error", message: "Please enter a valid email." });
    if (payload.phone_number.replace(/\D/g, "").length < 7)
      return setStatus({ kind: "error", message: "Please enter a valid phone number." });
    if (!payload.consent) return setStatus({ kind: "error", message: "Please agree to receive the demo call." });

    setStatus({ kind: "sending" });
    const res = await submitForm("demo", payload);
    setStatus(res.ok ? { kind: "done", message: res.message } : { kind: "error", message: res.error });
  }

  return (
    <div className="card relative overflow-hidden bg-surface p-6 sm:p-9">
      <Arc className="pointer-events-none absolute -top-2 left-6 right-6 h-14 w-[calc(100%-3rem)]" />
      <div className="relative">
        <h2 className="text-2xl font-semibold tracking-tight">Request your demo call</h2>
        <p className="mt-1.5 text-[15px] text-muted">Takes 30 seconds. Our AI agent will call you shortly after.</p>

        {status.kind === "done" ? (
          <div role="status" className="mt-8 rounded-2xl border border-emerald-200 bg-white p-6">
            <CheckCircle2 className="text-emerald-600" size={28} />
            <p className="mt-3 text-lg font-semibold">Request received</p>
            <p className="mt-1 text-muted">{status.message}</p>
          </div>
        ) : (
          <form className="mt-7 space-y-5" onSubmit={onSubmit} noValidate>
            {/* Honeypot: hidden from people, bots fill it in. */}
            <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
              <label htmlFor="company_website">Company website</label>
              <input id="company_website" name="company_website" type="text" tabIndex={-1} autoComplete="off" />
            </div>

            <div>
              <label className="field-label" htmlFor="full_name">Full name</label>
              <input id="full_name" name="full_name" className="field" placeholder="e.g. Stevie Mehta" autoComplete="name" maxLength={80} required />
            </div>

            <div>
              <label className="field-label" htmlFor="email">Email</label>
              <input id="email" name="email" type="email" className="field" placeholder="you@example.com" autoComplete="email" maxLength={254} required />
            </div>

            <div>
              <label className="field-label" htmlFor="phone_number">Phone number</label>
              <div className="flex gap-2">
                <select name="dial_code" aria-label="Country code" className="field !w-[118px] shrink-0 !px-3" defaultValue="+91">
                  {DIAL_CODES.map((d) => (
                    <option key={d.code} value={d.code}>{d.label}</option>
                  ))}
                </select>
                <input
                  id="phone_number"
                  name="phone_number"
                  type="tel"
                  inputMode="tel"
                  className="field"
                  placeholder="98765 43210"
                  autoComplete="tel-national"
                  maxLength={20}
                  required
                />
              </div>
            </div>

            <div>
              <label className="field-label" htmlFor="location">Location</label>
              <select id="location" name="location" className="field" defaultValue="India">
                {LOCATIONS.map((l) => (
                  <option key={l}>{l}</option>
                ))}
              </select>
            </div>

            <fieldset>
              <legend className="field-label">What are you buying for?</legend>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {PURPOSES.map((p) => (
                  <label
                    key={p}
                    className={`flex min-h-12 cursor-pointer items-center justify-center rounded-full border px-4 py-2.5 text-center text-[14px] transition ${
                      purpose === p ? "border-navy bg-navy text-white" : "border-black/10 bg-white text-ink hover:border-black/25"
                    }`}
                  >
                    <input type="radio" name="purpose" value={p} checked={purpose === p} onChange={() => setPurpose(p)} className="sr-only" />
                    {p}
                  </label>
                ))}
              </div>
            </fieldset>

            <div>
              <label className="field-label" htmlFor="configuration">Which home are you interested in?</label>
              <select id="configuration" name="configuration" className="field" defaultValue="2 Bedroom">
                {CONFIGURATIONS.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>

            <label className="flex items-start gap-3 text-[14px] text-muted">
              <input name="consent" type="checkbox" className="mt-0.5 h-5 w-5 shrink-0 accent-navy" required />
              <span>
                I agree to receive one AI demo call on this number and to the{" "}
                <a href="/privacy" className="text-ink underline underline-offset-2">privacy policy</a>.
              </span>
            </label>

            {status.kind === "error" && (
              <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-[14px] text-red-700">{status.message}</p>
            )}

            <button type="submit" className="btn-primary w-full !py-4 text-base" disabled={status.kind === "sending"}>
              {status.kind === "sending" ? (
                <>
                  <Loader2 className="animate-spin" size={18} /> Placing your call…
                </>
              ) : (
                <>
                  <PhoneCall size={18} /> Get my demo call →
                </>
              )}
            </button>
            <p className="text-center text-[13px] text-subtle">
              You'll receive one demo call on this number. We don't use your details for marketing.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
