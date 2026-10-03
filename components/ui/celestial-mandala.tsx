'use client';

import React, { useEffect, useRef } from 'react';

interface CelestialMandalaProps {
  className?: string;
  speedMultiplier?: number;
  opacity?: number;
}

export function CelestialMandala({
  className = '',
  speedMultiplier = 1.0,
  opacity = 0.22,
}: CelestialMandalaProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });
    if (!ctx) return;

    // Respect prefers-reduced-motion
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let animationId = 0;
    let lastTime = 0;
    let lastRenderTime = 0;
    let rotation = 0;
    let isVisible = true;
    let isTabVisible = true;

    // Palette harmonized with luxury black-and-gold theme
    const palette = {
      strokePrimary: '#E5BE7A', // Radiant Champagne Gold
      strokeSecondary: '#C89B56', // Warm Antique Gold
      strokeFaint: 'rgba(229, 190, 122, 0.28)', // Filigree gold
      nodePoint: '#FFF1D6', // Luminous Pearl Gold
      auraInner: 'rgba(229, 190, 122, 0.06)',
      auraOuter: 'rgba(200, 155, 86, 0.0)',
    };

    // 18 symmetry folds matching authentic classical mandala geometry
    const folds = 18;
    const angleStep = (Math.PI * 2) / folds;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let baseRadius = 0;
    let auraGrad: CanvasGradient | null = null;
    let isMobile = false;
    let frameThrottleMs = 16; // ~60fps desktop, ~33fps mobile

    interface Particle {
      x: number;
      y: number;
      radius: number;
      vx: number;
      vy: number;
      alpha: number;
    }

    let particles: Particle[] = [];

    const initParticles = (w: number, h: number) => {
      particles = [];
      // On mobile phones, reduce particle count to 8 (from 24) to save CPU/GPU cycles
      const count = isMobile ? 8 : 16;
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          radius: Math.random() * 0.7 + 0.3,
          vx: (Math.random() - 0.5) * 0.08,
          vy: (Math.random() - 0.5) * 0.08,
          alpha: Math.random() * 0.25 + 0.08,
        });
      }
    };

    const resize = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const winW = window.innerWidth;
      isMobile = winW < 768;

      // STRICT MOBILE-FIRST OPTIMIZATION:
      // Cap DPR to 1.0 on mobile to avoid rendering up to 4 million pixels per frame.
      // On desktop, cap at 1.25 (crisp without wasteful 2x-3x supersampling).
      dpr = isMobile ? 1.0 : Math.min(window.devicePixelRatio || 1, 1.25);
      frameThrottleMs = isMobile ? 32 : 16; // ~31 FPS on mobile, ~60 FPS on desktop

      width = rect.width || canvas.clientWidth || canvas.parentElement?.clientWidth || 500;
      height = rect.height || canvas.clientHeight || canvas.parentElement?.clientHeight || 500;

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      baseRadius = Math.min(width, height) * 0.44;

      // Pre-compute gradient on resize rather than allocating every frame
      try {
        auraGrad = ctx.createRadialGradient(0, 0, 4, 0, 0, baseRadius * 0.75);
        auraGrad.addColorStop(0, palette.auraInner);
        auraGrad.addColorStop(1, palette.auraOuter);
      } catch {
        auraGrad = null;
      }

      initParticles(width, height);

      // If reduced motion, draw once statically
      if (prefersReducedMotion) {
        drawFrame(0);
      }
    };

    resize();

    // Debounced resize listener
    let resizeTimer: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 100);
    };
    window.addEventListener('resize', handleResize, { passive: true });

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && canvas.parentElement) {
      resizeObserver = new ResizeObserver(() => {
        handleResize();
      });
      resizeObserver.observe(canvas.parentElement);
    }

    // Stop animation when page/tab is hidden
    const handleVisibilityChange = () => {
      isTabVisible = !document.hidden;
      if (isTabVisible && isVisible && !animationId && !prefersReducedMotion) {
        lastTime = 0;
        lastRenderTime = 0;
        animationId = requestAnimationFrame(render);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Pause completely when outside viewport
    let observer: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(
        ([entry]) => {
          isVisible = entry.isIntersecting;
          if (isVisible && isTabVisible && !animationId && !prefersReducedMotion) {
            lastTime = 0;
            lastRenderTime = 0;
            animationId = requestAnimationFrame(render);
          } else if (!isVisible && animationId) {
            cancelAnimationFrame(animationId);
            animationId = 0;
          }
        },
        { threshold: 0.05, rootMargin: '60px' }
      );
      observer.observe(canvas);
    }

    // Drawing Helpers
    const drawPoint = (x: number, y: number, r: number, fill: string) => {
      ctx.fillStyle = fill;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    };

    const drawRing = (radius: number, strokeStyle: string, lineWidth = 0.8, dash: number[] = []) => {
      ctx.save();
      ctx.strokeStyle = strokeStyle;
      ctx.lineWidth = lineWidth;
      if (dash.length > 0) ctx.setLineDash(dash);
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    };

    const drawPetal = (length: number, w: number, strokeStyle: string) => {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(w * 0.7, length * 0.35, w * 0.9, length * 0.7, 0, length);
      ctx.bezierCurveTo(-w * 0.9, length * 0.7, -w * 0.7, length * 0.35, 0, 0);
      ctx.closePath();
      ctx.strokeStyle = strokeStyle;
      ctx.stroke();
    };

    // Draw single mandala frame
    const drawFrame = (currentRotation: number) => {
      const w = width;
      const h = height;
      const cx = w / 2;
      const cy = h / 2;

      ctx.clearRect(0, 0, w, h);

      // Micro-particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;
        drawPoint(p.x, p.y, p.radius, `rgba(229, 190, 122, ${p.alpha})`);
      }

      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.translate(cx, cy);

      // Subtle warm aura behind the core
      if (auraGrad) {
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(0, 0, baseRadius * 0.75, 0, Math.PI * 2);
        ctx.fill();
      }

      // Concentric guide rings
      drawRing(baseRadius * 0.15, palette.strokePrimary, 0.8);
      drawRing(baseRadius * 0.22, palette.strokeFaint, 0.6, [2, 4]);
      drawRing(baseRadius * 0.38, palette.strokeSecondary, 0.7);
      drawRing(baseRadius * 0.52, palette.strokeFaint, 0.6, [3, 5]);
      drawRing(baseRadius * 0.68, palette.strokeSecondary, 0.8);

      // Center Bindu Dot
      drawPoint(0, 0, 2.8, palette.nodePoint);

      // 1. INNERMOST LOTUS PETALS (ROTATES ANTICLOCKWISE)
      ctx.save();
      ctx.rotate(-currentRotation);
      for (let i = 0; i < folds; i++) {
        ctx.save();
        ctx.rotate(i * angleStep);
        ctx.lineWidth = 0.8;
        drawPetal(baseRadius * 0.22, baseRadius * 0.06, palette.strokePrimary);
        drawPoint(0, baseRadius * 0.22, 1.2, palette.nodePoint);
        ctx.restore();
      }
      ctx.restore();

      // 2. GEOMETRIC JAALI DIAMONDS (ROTATES CLOCKWISE)
      ctx.save();
      ctx.rotate(currentRotation * 0.7);
      for (let i = 0; i < folds; i++) {
        ctx.save();
        ctx.rotate(i * angleStep + angleStep / 2);
        ctx.strokeStyle = palette.strokeSecondary;
        ctx.lineWidth = 0.7;
        ctx.beginPath();
        ctx.moveTo(0, baseRadius * 0.24);
        ctx.lineTo(baseRadius * 0.07, baseRadius * 0.38);
        ctx.lineTo(0, baseRadius * 0.5);
        ctx.lineTo(-baseRadius * 0.07, baseRadius * 0.38);
        ctx.closePath();
        ctx.stroke();
        drawPoint(0, baseRadius * 0.38, 1.2, palette.strokePrimary);
        ctx.restore();
      }
      ctx.restore();

      // 3. MID PETALS WITH CLEAN CENTRAL SPINE (ROTATES ANTICLOCKWISE)
      ctx.save();
      ctx.rotate(-currentRotation * 0.85);
      for (let i = 0; i < folds; i++) {
        ctx.save();
        ctx.rotate(i * angleStep);
        const petalLen = baseRadius * 0.68;
        const petalWidth = baseRadius * 0.11;
        ctx.lineWidth = 0.85;
        drawPetal(petalLen, petalWidth, palette.strokeSecondary);

        ctx.beginPath();
        ctx.moveTo(0, baseRadius * 0.28);
        ctx.lineTo(0, petalLen * 0.94);
        ctx.strokeStyle = palette.strokeFaint;
        ctx.lineWidth = 0.6;
        ctx.stroke();

        drawPoint(0, petalLen, 1.4, palette.nodePoint);
        ctx.restore();
      }
      ctx.restore();

      // 4. OUTER DOMES & FLAME ACCENTS (ROTATES CLOCKWISE)
      ctx.save();
      ctx.rotate(currentRotation * 0.45);

      const rInner = baseRadius * 0.68;
      const rOuterTip = baseRadius * 1.05;
      const rInterTip = baseRadius * 0.84;
      const maxHalfWidth = (Math.PI * rInner) / folds;
      const domeHeight = rOuterTip - rInner;
      const domeBaseWidth = maxHalfWidth * 0.9;
      const domeBellyWidth = maxHalfWidth * 0.98;

      // 4a. Interleaved secondary flame accents
      for (let i = 0; i < folds; i++) {
        ctx.save();
        ctx.rotate(i * angleStep + angleStep / 2);
        const interW = maxHalfWidth * 0.28;
        const interH = rInterTip - rInner;

        ctx.beginPath();
        ctx.moveTo(-interW, rInner);
        ctx.bezierCurveTo(
          -interW * 0.6,
          rInner + interH * 0.4,
          -interW * 0.15,
          rInner + interH * 0.75,
          0,
          rInterTip
        );
        ctx.bezierCurveTo(
          interW * 0.15,
          rInner + interH * 0.75,
          interW * 0.6,
          rInner + interH * 0.4,
          interW,
          rInner
        );
        ctx.strokeStyle = palette.strokeFaint;
        ctx.lineWidth = 0.55;
        ctx.stroke();

        drawPoint(0, rInterTip, 1.0, palette.strokeSecondary);
        ctx.restore();
      }

      // 4b. Primary outer dome petals with open base and inner portal
      for (let i = 0; i < folds; i++) {
        ctx.save();
        ctx.rotate(i * angleStep);

        ctx.strokeStyle = palette.strokePrimary;
        ctx.lineWidth = 0.85;
        ctx.beginPath();
        ctx.moveTo(-domeBaseWidth, rInner);
        ctx.bezierCurveTo(
          -domeBellyWidth,
          rInner + domeHeight * 0.22,
          -domeBellyWidth * 0.92,
          rInner + domeHeight * 0.48,
          -domeBaseWidth * 0.52,
          rInner + domeHeight * 0.7
        );
        ctx.bezierCurveTo(
          -domeBaseWidth * 0.2,
          rInner + domeHeight * 0.86,
          -domeBaseWidth * 0.02,
          rInner + domeHeight * 0.96,
          0,
          rOuterTip
        );
        ctx.bezierCurveTo(
          domeBaseWidth * 0.02,
          rInner + domeHeight * 0.96,
          domeBaseWidth * 0.2,
          rInner + domeHeight * 0.86,
          domeBaseWidth * 0.52,
          rInner + domeHeight * 0.7
        );
        ctx.bezierCurveTo(
          domeBellyWidth * 0.92,
          rInner + domeHeight * 0.48,
          domeBellyWidth,
          rInner + domeHeight * 0.22,
          domeBaseWidth,
          rInner
        );
        ctx.stroke();

        const iw = domeBaseWidth * 0.64;
        const ih = domeHeight * 0.3;
        const rCorner = Math.min(iw * 0.35, 7);

        ctx.strokeStyle = palette.strokeSecondary;
        ctx.lineWidth = 0.7;
        ctx.beginPath();
        ctx.moveTo(-iw, rInner);
        ctx.lineTo(-iw, rInner + ih - rCorner);
        ctx.quadraticCurveTo(-iw, rInner + ih, -iw + rCorner, rInner + ih);
        ctx.lineTo(iw - rCorner, rInner + ih);
        ctx.quadraticCurveTo(iw, rInner + ih, iw, rInner + ih - rCorner);
        ctx.lineTo(iw, rInner);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, rInner + ih + 2);
        ctx.lineTo(0, rOuterTip - 2);
        ctx.strokeStyle = palette.strokeFaint;
        ctx.lineWidth = 0.55;
        ctx.stroke();

        drawPoint(0, rOuterTip, 1.3, palette.nodePoint);
        ctx.restore();
      }
      ctx.restore();

      ctx.restore();
    };

    // Render loop with adaptive throttling
    const render = (time: number) => {
      if (!ctx || !canvas) return;
      if (!isVisible || !isTabVisible) {
        animationId = 0;
        return;
      }

      // Throttle framerate on mobile devices to preserve CPU/GPU
      const timeSinceLastRender = time - lastRenderTime;
      if (timeSinceLastRender < frameThrottleMs) {
        animationId = requestAnimationFrame(render);
        return;
      }

      if (lastTime === 0) lastTime = time;
      const delta = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;
      lastRenderTime = time;

      rotation += 0.035 * speedMultiplier * delta;
      drawFrame(rotation);

      animationId = requestAnimationFrame(render);
    };

    if (!prefersReducedMotion) {
      animationId = requestAnimationFrame(render);
    } else {
      drawFrame(0);
    }

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (observer) observer.disconnect();
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, [speedMultiplier, opacity]);

  return (
    <canvas
      ref={canvasRef}
      className={`block w-full h-full pointer-events-none select-none ${className}`}
      aria-hidden="true"
    />
  );
}
