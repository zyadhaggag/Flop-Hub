"use client";

import Link from "next/link";
import { Logo } from "./logo";
import { Button } from "./ui/button";
import { motion } from "framer-motion";

export function LandingNavbar() {
  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 flex justify-center px-4 pt-4"
      style={{ zIndex: 50 }}
    >
      <div className="max-w-6xl w-full h-14 px-6 rounded-2xl border border-white/[0.08] bg-black/50 backdrop-blur-xl flex items-center justify-between shadow-lg">
        <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
          <Logo size="sm" forceTheme="dark" />
        </Link>

        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:text-primary hover:bg-white/5 font-medium text-sm"
            >
              تسجيل الدخول
            </Button>
          </Link>
          <Link href="/signup">
            <Button
              size="sm"
              className="bg-gradient-to-r from-primary to-blue-500 hover:opacity-90 text-white font-bold px-5 shadow-[0_4px_20px_rgba(124,58,237,0.3)] transition-all text-sm"
            >
              ابدأ الآن
            </Button>
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}
