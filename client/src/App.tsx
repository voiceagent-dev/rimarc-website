import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router";
import Layout from "./components/Layout";
// Every page is part of the main bundle (the site is small), so the HTML pre-rendered at build
// time hydrates straight away with no blank "loading" placeholder.
import Home from "./pages/Home";
import VoiceDemo from "./pages/VoiceDemo";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import NotFound from "./pages/NotFound";

function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0 });
      return;
    }
    // The target section may not be on screen yet after a page change: keep looking for up to 3 seconds.
    const id = decodeURIComponent(hash.slice(1));
    let frame = 0;
    const started = performance.now();
    const find = () => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      } else if (performance.now() - started < 3000) {
        frame = requestAnimationFrame(find);
      }
    };
    find();
    return () => cancelAnimationFrame(frame);
  }, [pathname, hash]);
  return null;
}

export default function App() {
  return (
    <>
      <ScrollManager />
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="demos/ai-voice-sales-agent" element={<VoiceDemo />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="privacy" element={<Privacy />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  );
}

