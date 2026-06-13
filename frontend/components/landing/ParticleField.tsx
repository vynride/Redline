"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";

type Particle = { x: number; y: number; vx: number; vy: number; r: number };

/**
 * Lightweight constellation field on <canvas>, drifting nodes with proximity
 * links and a soft cursor-attraction. No WebGL, throttled to device pixel
 * ratio, paused when offscreen or under prefers-reduced-motion.
 */
export function ParticleField({
  className,
  density = 0.00009,
  link = 130,
  color = "124,92,252",
}: {
  className?: string;
  density?: number;
  link?: number;
  color?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    let particles: Particle[] = [];
    const mouse = { x: -9999, y: -9999 };
    let raf = 0;
    let running = true;

    const seed = () => {
      const parent = canvas.parentElement;
      w = parent?.clientWidth ?? window.innerWidth;
      h = parent?.clientHeight ?? window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(110, Math.max(28, Math.floor(w * h * density)));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.6 + 0.6,
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        // Gentle cursor attraction.
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const md = Math.hypot(dx, dy);
        if (md < 160) {
          p.x += (dx / md) * 0.25;
          p.y += (dy / md) * 0.25;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color},0.7)`;
        ctx.fill();
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < link) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(${color},${0.16 * (1 - d / link)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
      if (running) raf = requestAnimationFrame(draw);
    };

    const onMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    };
    const onLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };

    seed();
    raf = requestAnimationFrame(draw);

    const ro = new ResizeObserver(seed);
    if (canvas.parentElement) ro.observe(canvas.parentElement);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);

    // Pause when the field scrolls out of view.
    const io = new IntersectionObserver(
      ([entry]) => {
        running = entry.isIntersecting;
        if (running) raf = requestAnimationFrame(draw);
        else cancelAnimationFrame(raf);
      },
      { threshold: 0 },
    );
    io.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, [density, link, color]);

  return <canvas ref={canvasRef} aria-hidden className={cn("h-full w-full", className)} />;
}
