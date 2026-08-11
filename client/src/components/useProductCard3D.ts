import {
  useMotionValue,
  useReducedMotion,
  useSpring,
  type MotionValue,
} from "framer-motion";

/**
 * Mouse-tracking 3D tilt for the product card's IMAGE ZONE — the
 * VanillaTilt equivalent (max 12° rotate, scale 1.05) built on
 * framer-motion springs so it needs no external dependency. The returned
 * props are spread onto the image-zone div (NOT the card anchor — only
 * the image section moves; the info section stays flat):
 *
 *   <motion.div className="gw-product-card-3d-tilt" {...tiltProps}>
 *
 * `transformPerspective` is deliberately NOT used here — the depth context
 * comes from the `.gw-product-card-3d-wrap` `perspective` CSS property in
 * product-card-3d.css, so the translateZ pops work even when this hook is
 * inactive (no-JS / reduced motion).
 */

export interface CardTiltProps {
  style?: {
    rotateX: MotionValue<number>;
    rotateY: MotionValue<number>;
    scale: MotionValue<number>;
  };
  onMouseMove?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseLeave?: () => void;
}

const TILT_MAX_DEG = 12;
const TILT_SCALE = 1.05;

export function useProductCard3D(): CardTiltProps {
  const reduceMotion = useReducedMotion();

  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const scale = useMotionValue(1);

  const springRotateX = useSpring(rotateX, { stiffness: 260, damping: 20 });
  const springRotateY = useSpring(rotateY, { stiffness: 260, damping: 20 });
  const springScale = useSpring(scale, { stiffness: 300, damping: 24 });

  if (reduceMotion) {
    return {}; // accessibility: no tilt, no springs, no pointer tracking
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    rotateY.set((px - 0.5) * TILT_MAX_DEG);
    rotateX.set((0.5 - py) * TILT_MAX_DEG * 0.8);
    scale.set(TILT_SCALE);
  };

  const handleMouseLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
    scale.set(1);
  };

  return {
    style: {
      rotateX: springRotateX,
      rotateY: springRotateY,
      scale: springScale,
    },
    onMouseMove: handleMouseMove,
    onMouseLeave: handleMouseLeave,
  };
}
