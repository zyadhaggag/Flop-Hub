"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useRef, useCallback } from "react";

// ── Smooth Scroll (Lenis) ──
export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    let lenis: any;
    let rafId: number;

    import("lenis").then((mod) => {
      const Lenis = mod.default;
      lenis = new Lenis({
        duration: 1.4,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
      });

      function raf(time: number) {
        lenis.raf(time);
        rafId = requestAnimationFrame(raf);
      }
      rafId = requestAnimationFrame(raf);
    });

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (lenis) lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}

// ── Interactive Mesh Grid (Canvas) ──
export function InteractiveMesh() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function resize() {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    function onMouse(e: MouseEvent) {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    }
    window.addEventListener("mousemove", onMouse);

    const GRID = 50;

    function draw() {
      const w = canvas!.width;
      const h = canvas!.height;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      ctx!.clearRect(0, 0, w, h);

      // draw grid lines
      for (let x = 0; x <= w; x += GRID) {
        for (let y = 0; y <= h; y += GRID) {
          const dx = mx - x;
          const dy = my - y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxD = 200;
          let ox = x, oy = y;

          if (dist < maxD && dist > 0) {
            const force = (1 - dist / maxD) * 15;
            ox = x - (dx / dist) * force;
            oy = y - (dy / dist) * force;
          }

          // dot at intersection
          const alpha = dist < maxD ? 0.15 + (1 - dist / maxD) * 0.4 : 0.08;
          ctx!.fillStyle = `rgba(124, 58, 237, ${alpha})`;
          ctx!.beginPath();
          ctx!.arc(ox, oy, dist < maxD ? 2 : 1, 0, Math.PI * 2);
          ctx!.fill();
        }
      }

      // glow at mouse
      if (mx > 0) {
        const g = ctx!.createRadialGradient(mx, my, 0, mx, my, 200);
        g.addColorStop(0, "rgba(124, 58, 237, 0.12)");
        g.addColorStop(1, "rgba(59, 130, 246, 0)");
        ctx!.fillStyle = g;
        ctx!.fillRect(0, 0, w, h);
      }

      rafRef.current = requestAnimationFrame(draw);
    }
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouse);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}

// ── Mouse Glow (large soft glow following cursor) ──
export function MouseGlow() {
  const [pos, setPos] = useState({ x: -500, y: -500 });

  useEffect(() => {
    const handler = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  return (
    <motion.div
      className="fixed pointer-events-none hidden lg:block rounded-full"
      style={{
        width: 500,
        height: 500,
        background: "radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)",
        zIndex: 1,
      }}
      animate={{ x: pos.x - 250, y: pos.y - 250 }}
      transition={{ type: "spring", stiffness: 80, damping: 30, mass: 0.5 }}
    />
  );
}

// ── Glass Card ──
export function GlassCard({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.7, delay, ease: "easeOut" }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      className={`relative rounded-3xl p-8 md:p-10 border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm overflow-hidden group transition-colors duration-500 hover:border-primary/20 hover:bg-white/[0.06] ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
