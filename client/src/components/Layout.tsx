import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router";
import { ArrowRight, Linkedin, Mail, Menu, X } from "lucide-react";
import { Logo } from "./Brand";
import { NAV, SITE } from "../data/site";

const DEMO_PATH = "/demos/ai-voice-sales-agent";

/**
 * One demo button on screen at a time: the header's "Try a Live Demo" hides while a page's own demo
 * button (marked data-demo-cta) is visible, and on the demo page itself.
 */
function useHeaderCtaVisible(pathname: string) {
  // Start hidden on the home page (its hero button is on screen at load) to avoid a flash.
  const [visible, setVisible] = useState(pathname !== "/" && pathname !== DEMO_PATH);
  useEffect(() => {
    if (pathname === DEMO_PATH) return setVisible(false);
    const targets = Array.from(document.querySelectorAll("[data-demo-cta]"));
    if (!targets.length || typeof IntersectionObserver === "undefined") return setVisible(true);
    const onScreen = new Set<Element>();
    const obs = new IntersectionObserver((entries) => {
      for (const e of entries) e.isIntersecting ? onScreen.add(e.target) : onScreen.delete(e.target);
      setVisible(onScreen.size === 0);
    });
    targets.forEach((t) => obs.observe(t));
    return () => obs.disconnect();
  }, [pathname]);
  return visible;
}

function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname, hash } = useLocation();
  const ctaVisible = useHeaderCtaVisible(pathname);

  useEffect(() => setOpen(false), [pathname, hash]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? "border-b border-line bg-canvas/85 backdrop-blur-xl" : "bg-canvas"
      }`}
    >
      <div className="container-page flex h-20 items-center justify-between gap-6">
        <Link to="/" aria-label="RIMARC AI home" className="shrink-0">
          <Logo />
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-9 md:flex">
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} className="text-[15px] text-ink/80 transition hover:text-ink">
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="hidden w-[170px] justify-end md:flex">
          <Link
            to={DEMO_PATH}
            className={`btn-primary !px-5 !py-2.5 transition-all duration-300 ${
              ctaVisible ? "opacity-100" : "pointer-events-none translate-y-1 opacity-0"
            }`}
            aria-hidden={!ctaVisible}
            tabIndex={ctaVisible ? undefined : -1}
          >
            Try a Live Demo
          </Link>
        </div>
        <button
          type="button"
          className="grid h-11 w-11 place-items-center rounded-full border border-line md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      {open && (
        <div id="mobile-menu" className="border-t border-line bg-canvas md:hidden">
          <nav aria-label="Mobile" className="container-page flex flex-col py-4">
            {NAV.map((item) => (
              <NavLink key={item.to} to={item.to} className="border-b border-line py-4 text-lg">
                {item.label}
              </NavLink>
            ))}
            {pathname !== DEMO_PATH && (
              <Link to={DEMO_PATH} className="btn-primary mt-6">
                Try a Live Demo <ArrowRight size={16} />
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-line bg-canvas">
      <div className="container-page grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-5 max-w-xs text-[15px] text-muted">
            AI agents, voice AI and workflow automation for businesses of every size.
          </p>
        </div>
        <nav aria-label="Footer" className="flex flex-col gap-3 text-[15px]">
          <p className="mb-1 text-[12px] font-medium uppercase tracking-[0.16em] text-subtle">Explore</p>
          <Link to={DEMO_PATH} className="w-fit text-ink/80 hover:text-ink">
            Live demo
          </Link>
          {NAV.map((item) => (
            <Link key={item.to} to={item.to} className="w-fit text-ink/80 hover:text-ink">
              {item.label}
            </Link>
          ))}
          <Link to="/privacy" className="w-fit text-ink/80 hover:text-ink">
            Privacy Policy
          </Link>
        </nav>
        <div className="flex flex-col gap-3 text-[15px]">
          <p className="mb-1 text-[12px] font-medium uppercase tracking-[0.16em] text-subtle">Get in touch</p>
          <a href={`https://${SITE.domain}`} className="w-fit text-ink/80 hover:text-ink">
            {SITE.domain}
          </a>
          <a href={`mailto:${SITE.email}`} className="inline-flex w-fit items-center gap-2 text-ink/80 hover:text-ink">
            <Mail size={16} /> {SITE.email}
          </a>
          <a
            href={SITE.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-fit items-center gap-2 text-ink/80 hover:text-ink"
          >
            <Linkedin size={16} /> LinkedIn
          </a>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="container-page flex flex-col gap-2 py-6 text-[13px] text-subtle sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} RIMARC AI. All rights reserved.</p>
          <p>Photos: Unsplash</p>
        </div>
      </div>
    </footer>
  );
}

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>
      <Header />
      <main id="main" className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
