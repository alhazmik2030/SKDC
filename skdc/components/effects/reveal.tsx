"use client";

import { motion, useInView, type Variants } from "framer-motion";
import { ReactNode, useRef } from "react";

type Direction = "up" | "down" | "left" | "right" | "scale";

const variants: Record<Direction, Variants> = {
  up: {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 },
  },
  down: {
    hidden: { opacity: 0, y: -40 },
    visible: { opacity: 1, y: 0 },
  },
  left: {
    hidden: { opacity: 0, x: 40 },
    visible: { opacity: 1, x: 0 },
  },
  right: {
    hidden: { opacity: 0, x: -40 },
    visible: { opacity: 1, x: 0 },
  },
  scale: {
    hidden: { opacity: 0, scale: 0.92 },
    visible: { opacity: 1, scale: 1 },
  },
};

/**
 * Scroll-triggered reveal animation. Animates in once when entering viewport.
 */
export function Reveal({
  children,
  direction = "up",
  delay = 0,
  duration = 0.7,
  once = true,
  className = "",
}: {
  children: ReactNode;
  direction?: Direction;
  delay?: number;
  duration?: number;
  once?: boolean;
  className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={variants[direction]}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
