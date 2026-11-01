import { Link } from "react-router";
import { Arc } from "../components/Brand";
import { usePageMeta } from "../lib/usePageMeta";

export default function NotFound() {
  usePageMeta("/404");
  return (
    <section className="container-page flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <Arc className="h-16 w-full max-w-md" />
      <h1 className="display mt-6 text-[48px] sm:text-[64px]">Page not found</h1>
      <p className="mt-4 text-lg text-muted">The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn-primary mt-10">
        Back to home
      </Link>
    </section>
  );
}
