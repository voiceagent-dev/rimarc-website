import { useMemo, useState, type FormEvent } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { formTimer, postJson } from "../lib/api";

type Status = { kind: "idle" } | { kind: "sending" } | { kind: "done"; message: string } | { kind: "error"; message: string };

export default function ContactForm() {
  const elapsed = useMemo(() => formTimer(), []);
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const get = (k: string) => String(form.get(k) ?? "").trim();
    const payload = {
      full_name: get("full_name"),
      email: get("email"),
      company: get("company"),
      message: get("message"),
      consent: form.get("consent") === "on",
      company_website: get("company_website"),
      elapsed_ms: elapsed(),
    };
    if (payload.message.length < 10) return setStatus({ kind: "error", message: "Please write a little more." });
    if (!payload.consent) return setStatus({ kind: "error", message: "Please agree to be contacted." });
    setStatus({ kind: "sending" });
    const res = await postJson("/api/contact", payload);
    setStatus(res.ok ? { kind: "done", message: res.message } : { kind: "error", message: res.error });
  }

  if (status.kind === "done") {
    return (
      <div role="status" className="rounded-2xl border border-emerald-200 bg-white p-8">
        <CheckCircle2 className="text-emerald-600" size={28} />
        <p className="mt-3 text-lg font-semibold">Message sent</p>
        <p className="mt-1 text-muted">{status.message}</p>
      </div>
    );
  }

  return (
    <form className="space-y-5" onSubmit={onSubmit} noValidate>
      <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor="c_company_website">Company website</label>
        <input id="c_company_website" name="company_website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="field-label" htmlFor="c_full_name">Full name</label>
          <input id="c_full_name" name="full_name" className="field" autoComplete="name" maxLength={80} required />
        </div>
        <div>
          <label className="field-label" htmlFor="c_email">Email</label>
          <input id="c_email" name="email" type="email" className="field" autoComplete="email" maxLength={254} required />
        </div>
      </div>
      <div>
        <label className="field-label" htmlFor="c_company">Company <span className="font-normal text-subtle">(optional)</span></label>
        <input id="c_company" name="company" className="field" autoComplete="organization" maxLength={120} />
      </div>
      <div>
        <label className="field-label" htmlFor="c_message">How can we help?</label>
        <textarea
          id="c_message"
          name="message"
          rows={5}
          maxLength={2000}
          className="field !h-auto py-3"
          placeholder="Tell us about the process you'd like to automate."
          required
        />
      </div>
      <label className="flex items-start gap-3 text-[14px] text-muted">
        <input name="consent" type="checkbox" className="mt-0.5 h-5 w-5 shrink-0 accent-navy" required />
        <span>
          I agree to be contacted about my enquiry, as described in the{" "}
          <a href="/privacy" className="text-ink underline underline-offset-2">privacy policy</a>.
        </span>
      </label>
      {status.kind === "error" && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-[14px] text-red-700">{status.message}</p>
      )}
      <button type="submit" className="btn-primary w-full !py-4 sm:w-auto" disabled={status.kind === "sending"}>
        {status.kind === "sending" ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
        Send message
      </button>
    </form>
  );
}
