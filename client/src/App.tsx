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
    if (hash) {
      document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0 });
    }
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
