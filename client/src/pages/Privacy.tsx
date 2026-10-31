import { Eyebrow } from "../components/Brand";
import { SITE } from "../data/site";
import { usePageTitle } from "../lib/usePageTitle";

const sections: [string, string[]][] = [
  [
    "What we collect",
    [
      "Demo call form: your name, email, phone number, location, buying purpose and the home type you choose.",
      "Contact form: your name, email, company (optional) and your message.",
      "We don't use advertising trackers, analytics cookies or third-party scripts on this website.",
    ],
  ],
  [
    "Why we use it",
    [
      "To place the one demo call you asked for and to let our AI agent personalise it.",
      "To reply to your message.",
      "We never use these details for marketing and never sell or rent them.",
    ],
  ],
  [
    "Who processes it",
    [
      "Demo calls are placed through our voice AI and telephony providers, which receive only what the call needs.",
      "Call summaries are shared with the property advisor so they can follow up on the meeting you booked.",
    ],
  ],
  [
    "How we protect it",
    [
      "All traffic is encrypted with HTTPS. Access keys stay on our servers and never reach your browser.",
      "To prevent repeat calls, we keep a one-way, keyed fingerprint of your phone number and email for 24 hours, not the details themselves.",
      "Forms are rate-limited and protected against automated abuse.",
    ],
  ],
  [
    "Your choices",
    [
      `To ask what we hold about you, or to have it deleted, email ${SITE.email}.`,
      "If you don't want a call, simply don't submit the demo form. You can end the call at any time.",
    ],
  ],
];

export default function Privacy() {
  usePageTitle("Privacy Policy · RIMARC AI");
  return (
    <section className="container-page max-w-3xl pb-24 pt-12 lg:pt-20">
      <Eyebrow>Privacy Policy</Eyebrow>
      <h1 className="display mt-6 text-[44px] sm:text-[56px]">How we handle your data</h1>
      <p className="mt-5 text-muted">Last updated: October 2026</p>
      <div className="mt-12 space-y-10">
        {sections.map(([title, items]) => (
          <div key={title}>
            <h2 className="text-xl font-semibold">{title}</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-[16px] leading-relaxed text-muted">
              {items.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
