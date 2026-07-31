import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "./utils";

interface BlurImageProps {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
}

export function BlurImage({ src, alt, className, containerClassName }: BlurImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div className={cn("relative overflow-hidden", containerClassName)}>
      {/* Skeleton placeholder */}
      {!isLoaded && !hasError && (
        <motion.div
          className="absolute inset-0 bg-gw-gray-200"
          animate={{ opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {/* Error fallback */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gw-bg">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-gw-gray-300 text-sm"
          >
            ?
          </motion.div>
        </div>
      )}

      {/* Actual image */}
      <motion.img
        src={src}
        alt={alt}
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{
          opacity: isLoaded ? 1 : 0,
          scale: isLoaded ? 1 : 1.05,
          filter: isLoaded ? "blur(0px)" : "blur(8px)",
        }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={cn("w-full h-full object-contain", className)}
      />
    </div>
  );
}
