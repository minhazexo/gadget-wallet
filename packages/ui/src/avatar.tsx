import { useEffect, useState } from "react";
import { cn } from "./utils";

/** First letters of first + last name ("John Doe" → "JD", "Ana" → "A"). */
function initials(name?: string | null): string {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  const first = parts[0][0] ?? "U";
  const last = parts.length > 1 ? parts[parts.length - 1][0] ?? "" : "";
  return (first + last).toUpperCase();
}

interface AvatarProps {
  /** Image URL. Falls back to initials when empty or on load error. */
  src?: string | null;
  /** Used for the initials fallback and the img alt text. */
  name?: string | null;
  alt?: string;
  /**
   * Controls the size + initials font, e.g. "w-12 h-12 text-lg".
   * The component supplies shape (rounded-full, object-cover) automatically.
   */
  className?: string;
}

/**
 * Circular avatar that always fills its box correctly:
 * - the image is absolutely positioned with object-cover, so it can never be
 *   squished, offset, or clipped by the circle's flex centering;
 * - if the URL is empty or fails to load, it gracefully falls back to the
 *   user's initials on the brand color instead of showing a broken image.
 */
export function Avatar({ src, name, alt, className }: AvatarProps) {
  const [error, setError] = useState(false);

  // A failed URL must not poison later uploads: once the source changes
  // (e.g. the user uploads a new photo), retry rendering the image.
  useEffect(() => {
    setError(false);
  }, [src]);

  const showImage = !!src && !error;

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-primary font-bold select-none",
        className,
      )}
      aria-label={alt || name || "avatar"}
      role="img"
    >
      {showImage ? (
        <img
          src={src!}
          alt={alt || name || "avatar"}
          loading="lazy"
          onError={() => setError(true)}
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
      ) : (
        <span className="leading-none">{initials(name)}</span>
      )}
    </span>
  );
}
