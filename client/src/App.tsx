import { lazy, Suspense, useEffect } from "react";
import { Route, Routes, useLocation } from "react-router";
import Layout from "./components/Layout";
import Home from "./pages/Home";

const VoiceDemo = lazy(() => import("./pages/VoiceDemo"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Privacy = lazy(() => import("./pages/Privacy"));
const NotFound = lazy(() => import("./pages/NotFound"));

function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0 });
      return;
    }
    // Pages load on demand, so the target section may not exist yet: keep looking for up to 3 seconds.
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
          <Route
            path="demos/ai-voice-sales-agent"
            element={
              <Suspense fallback={<PageFallback />}>
                <VoiceDemo />
              </Suspense>
            }
          />
          <Route path="about" element={<Suspense fallback={<PageFallback />}><About /></Suspense>} />
          <Route path="contact" element={<Suspense fallback={<PageFallback />}><Contact /></Suspense>} />
          <Route path="privacy" element={<Suspense fallback={<PageFallback />}><Privacy /></Suspense>} />
          <Route path="*" element={<Suspense fallback={<PageFallback />}><NotFound /></Suspense>} />
        </Route>
      </Routes>
    </>
  );
}

function PageFallback() {
  return <div className="min-h-[60vh]" aria-busy="true" />;
}
