import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prevent mongoose/mongodb from being bundled into Edge runtime / middleware.
  // These packages use Node.js built-ins (stream, crypto, net) not available on Edge.
  serverExternalPackages: ["mongoose", "mongodb", "bcryptjs"],
};

export default nextConfig;
