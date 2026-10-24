import { useState } from "react";

interface LogoProps {
  /** "light" for dark backgrounds (transparent navbar, footer), "dark" for white. */
  variant?: "light" | "dark";
  /** Height of the mark in pixels. The width scales with the image. */
  height?: number;
  showWordmark?: boolean;
  className?: string;
}

/**
 * Site logo.
 *
 * Drop the company logo into `public/logo.png` (or .svg) and it appears
 * everywhere automatically — navbar, footer, admin sidebar, emails.
 * A second file at `public/logo-light.png` is used on dark backgrounds
 * when present; otherwise the same file is used for both.
 *
 * Until those files exist, this falls back to the globe mark and "Eduvic"
 * wordmark, so nothing ever renders broken.
 *
 * Recommended: SVG, or PNG with a transparent background, around 400px wide.
 */
export default function Logo({
  variant = "dark",
  height = 36,
  showWordmark = true,
  className = "",
}: LogoProps) {
  const [failed, setFailed] = useState(false);

  const src = variant === "light" ? "/logo-light.png" : "/logo.png";

  if (!failed) {
    return (
      <img
        src={src}
        alt="Eduvic Travels"
        style={{ height }}
        className={`w-auto object-contain ${className}`}
        onError={(e) => {
          // Try the main logo before giving up on dark backgrounds.
          const img = e.currentTarget;
          if (variant === "light" && !img.dataset.retried) {
            img.dataset.retried = "true";
            img.src = "/logo.png";
            return;
          }
          setFailed(true);
        }}
      />
    );
  }

  // Fallback mark — used until a logo file is added.
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <span
        className="rounded-lg bg-orange-500 flex items-center justify-center shrink-0 transition-transform duration-300"
        style={{ width: height, height }}
      >
        <i className="ri-earth-line text-white" style={{ fontSize: height * 0.52 }} />
      </span>
      {showWordmark && (
        <span
          className={`font-heading font-bold tracking-tight ${
            variant === "light" ? "text-white" : "text-slate-900"
          }`}
          style={{ fontSize: height * 0.56 }}
        >
          Eduvic
        </span>
      )}
    </span>
  );
}