"use client"

import { motion } from "framer-motion"
import { spaceGrotesk } from "@/lib/fonts"

const Logo = () => {
  return (
    <motion.span
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`inline-flex items-baseline gap-0 text-lg sm:text-xl md:text-2xl font-medium tracking-tight ${spaceGrotesk.variable} font-sans`}
      aria-label="Xerweon"
    >
      <span className="text-foreground">xerw</span>
      <span className="text-primary">eon</span>
      <span className="text-muted-foreground">™</span>
    </motion.span>
  )
}

export default Logo
