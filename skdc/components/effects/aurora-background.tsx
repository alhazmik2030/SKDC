"use client";

import { motion } from "framer-motion";

/**
 * Aurora-style animated background with floating gradient blobs.
 * Place inside a `relative` container; it absolutely fills the parent.
 */
export function AuroraBackground({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden
    >
      {/* Grid */}
      <div
        className="absolute inset-0 grid-bg opacity-60"
        style={{
          maskImage:
            "radial-gradient(ellipse 80% 60% at 50% 30%, black 30%, transparent 80%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 60% at 50% 30%, black 30%, transparent 80%)",
        }}
      />

      {/* Aurora blob 1 — violet */}
      <motion.div
        className="absolute -top-32 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(167, 139, 250, 0.35) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
        animate={{ x: ["-50%", "-30%", "-60%", "-50%"], y: [0, 30, -20, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Aurora blob 2 — pink */}
      <motion.div
        className="absolute top-40 right-1/4 h-[500px] w-[500px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(236, 72, 153, 0.25) 0%, transparent 70%)",
          filter: "blur(90px)",
        }}
        animate={{ x: [0, -60, 40, 0], y: [0, -40, 30, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Aurora blob 3 — sky */}
      <motion.div
        className="absolute top-1/2 left-10 h-[500px] w-[500px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(56, 189, 248, 0.25) 0%, transparent 70%)",
          filter: "blur(90px)",
        }}
        animate={{ x: [0, 60, -30, 0], y: [0, 50, -40, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Subtle noise overlay for premium texture */}
      <div className="absolute inset-0 bg-noise opacity-[0.015] mix-blend-overlay" />
    </div>
  );
}
