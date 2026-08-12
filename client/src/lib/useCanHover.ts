import { useEffect, useState } from "react";

/**
 * Whether the primary pointer is a fine (mouse/trackpad) pointer that can
 * hover. Touch phones/tablets (coarse pointer, no hover) return false, so
 * hover-only effects (the 3D card tilt) can be gated off and replaced with
 * touch feedback instead. Re-evaluates live when e.g. a mouse is connected
 * to a tablet.
 */
export function useCanHover(): boolean {
  const [canHover, setCanHover] = useState(() => {
    if (typeof window === "undefined" || !window.matchMedia) return true;
    return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  });

  useEffect(() => {
    if (!window.matchMedia) return;
    const mql = window.matchMedia("(hover: hover) and (pointer: fine)");
    const onChange = () => setCanHover(mql.matches);
    setCanHover(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return canHover;
}
