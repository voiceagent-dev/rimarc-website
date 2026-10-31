import { useState } from "react";
import manifest from "../data/images.json";

export type ImageSlug = keyof typeof manifest;

type Props = {
  slug: ImageSlug;
  alt: string;
  /** Matches the layout width, e.g. "(min-width: 1024px) 50vw, 100vw" */
  sizes?: string;
  className?: string;
  imgClassName?: string;
  /** Above-the-fold images load immediately; everything else loads lazily. */
  priority?: boolean;
};

export default function Picture({ slug, alt, sizes = "100vw", className = "", imgClassName = "", priority = false }: Props) {
  const meta = manifest[slug];
  const [loaded, setLoaded] = useState(false);
  const srcSet = (ext: string) => meta.widths.map((w) => `/images/${slug}-${w}.${ext} ${w}w`).join(", ");
  const fallbackWidth = meta.widths[Math.min(2, meta.widths.length - 1)];
  // Callers may position the image absolutely; only default to relative when they don't.
  const position = /\b(absolute|fixed)\b/.test(className) ? "" : "relative";

  return (
    <div
      className={`${position} overflow-hidden bg-surface-2 ${className}`}
      style={{ backgroundImage: `url(${meta.placeholder})`, backgroundSize: "cover", backgroundPosition: "center" }}
    >
      <picture className="block h-full w-full">
        <source type="image/avif" srcSet={srcSet("avif")} sizes={sizes} />
        <source type="image/webp" srcSet={srcSet("webp")} sizes={sizes} />
        <img
          src={`/images/${slug}-${fallbackWidth}.webp`}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={priority ? "high" : "auto"}
          onLoad={() => setLoaded(true)}
          className={`h-full w-full object-cover transition-opacity duration-700 ${loaded ? "opacity-100" : "opacity-0"} ${imgClassName}`}
        />
      </picture>
    </div>
  );
}
