import type { NextConfig } from "next";

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

export default nextConfig;
