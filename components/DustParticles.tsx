"use client";

import React, { useEffect, useRef } from 'react';

export default function DustParticles() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    // Respect prefers-reduced-motion
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationId = 0;
    let width = 0;
    let height = 0;
    let isPaused = false;
    let isMobile = false;
    let lastRender = 0;

    const resize = () => {
      if (!canvas) return;
      isMobile = window.innerWidth < 768;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initParticles();
    };

    interface Particle {
      x: number;
      y: number;
      size: number;
      opacity: number;
      vx: number;
      vy: number;
      wobble: number;
    }

    let particles: Particle[] = [];

    const initParticles = () => {
      // 6-7 subtle motes on mobile, 14 on desktop (down from 22 on all devices)
      const count = isMobile ? 7 : 14;
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * (width || window.innerWidth),
        y: Math.random() * (height || window.innerHeight),
        size: Math.random() * 0.7 + 0.5,
        opacity: Math.random() * 0.02 + 0.01,
        vx: (Math.random() - 0.5) * 0.15,
        vy: -Math.random() * 0.18 - 0.06,
        wobble: Math.random() * Math.PI * 2,
      }));
    };

    resize();

    let resizeTimer: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 150);
    };
    window.addEventListener('resize', handleResize, { passive: true });

    // Pause when tab is hidden or when scrolled far down
    const handleVisibility = () => {
      isPaused = document.hidden;
      if (!isPaused && !animationId) {
        lastRender = performance.now();
        animationId = requestAnimationFrame(render);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    const throttleMs = isMobile ? 33 : 20;

    const render = (time: number) => {
      if (isPaused) {
        animationId = 0;
        return;
      }

      if (time - lastRender < throttleMs) {
        animationId = requestAnimationFrame(render);
        return;
      }
      lastRender = time;

      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.wobble += 0.01;
        p.x += p.vx + Math.sin(p.wobble) * 0.1;
        p.y += p.vy;

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(232, 221, 203, ${p.opacity})`;
        ctx.fill();
      }

      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[1]"
      style={{ opacity: 0.8 }}
      aria-hidden="true"
    />
  );
}
