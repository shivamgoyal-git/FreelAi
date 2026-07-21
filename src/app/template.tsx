"use client";

import { motion } from "framer-motion";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.995 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.995 }}
      transition={{
        duration: 0.22,
        ease: [0.16, 1, 0.3, 1], // Emil Kowalski standard cubic-bezier curve
      }}
    >
      {children}
    </motion.div>
  );
}
