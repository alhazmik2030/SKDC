import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

// Why: gated behind an env flag so it only runs during `npm run analyze`,
// never in production builds on Railway.
const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  // Trim per-route bundles by letting Next chunk heavy package barrels.
  // framer-motion, lucide-react, three, konva are the worst offenders without this.
  experimental: {
    optimizePackageImports: [
      "framer-motion",
      "lucide-react",
      "@react-three/drei",
      "@react-three/fiber",
      "three",
      "konva",
      "react-konva",
      "@base-ui/react",
      "@hookform/resolvers",
    ],
  },
};

export default withBundleAnalyzer(nextConfig);
