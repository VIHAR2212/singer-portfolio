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
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let lastTime = 0;
    let rotation = 0;

    // Palette harmonized with luxury black-and-gold theme
    const palette = {
      strokePrimary: '#E5BE7A',      // Radiant Champagne Gold
      strokeSecondary: '#C89B56',    // Warm Antique Gold
      strokeFaint: 'rgba(229, 190, 122, 0.28)', // Filigree gold
      nodePoint: '#FFF1D6',          // Luminous Pearl Gold
      auraInner: 'rgba(229, 190, 122, 0.06)',
      auraOuter: 'rgba(200, 155, 86, 0.0)'
    };

    // 18 symmetry folds matching authentic classical mandala geometry
    const folds = 18;
    const angleStep = (Math.PI * 2) / folds;

    // Floating stardust micro-particles
    let width = 0;
    let height = 0;
    let dpr = 1;

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
      const count = 24;
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          radius: Math.random() * 0.8 + 0.3,
          vx: (Math.random() - 0.5) * 0.1,
          vy: (Math.random() - 0.5) * 0.1,
          alpha: Math.random() * 0.3 + 0.1,
        });
      }
    };

    const resize = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width || canvas.clientWidth || canvas.parentElement?.clientWidth || 600;
      height = rect.height || canvas.clientHeight || canvas.parentElement?.clientHeight || 600;

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      initParticles(width, height);
    };

    resize();
    window.addEventListener('resize', resize);

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && canvas.parentElement) {
      resizeObserver = new ResizeObserver(() => {
        resize();
      });
      resizeObserver.observe(canvas.parentElement);
    }

    let isVisible = true;
    let observer: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible && !animationId) {
          lastTime = 0;
          animationId = requestAnimationFrame(render);
        }
      });
      observer.observe(canvas);
    }

    // Helpers
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
      ctx.setLineDash(dash);
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    };

    const drawPetal = (length: number, width: number, strokeStyle: string) => {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(width * 0.7, length * 0.35, width * 0.9, length * 0.7, 0, length);
      ctx.bezierCurveTo(-width * 0.9, length * 0.7, -width * 0.7, length * 0.35, 0, 0);
      ctx.closePath();
      ctx.strokeStyle = strokeStyle;
      ctx.stroke();
    };

    // Render loop
    const render = (time: number) => {
      if (!ctx || !canvas) return;
      if (!isVisible) {
        animationId = 0;
        return;
      }

      if (lastTime === 0) lastTime = time;
      const delta = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      // Delta time rotation calculation
      rotation += 0.035 * speedMultiplier * delta;

      const w = width;
      const h = height;
      const cx = w / 2;
      const cy = h / 2;
      const baseRadius = Math.min(w, h) * 0.44;

      ctx.clearRect(0, 0, w, h);

      // Ambient micro-particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;
        drawPoint(p.x, p.y, p.radius, `rgba(229, 190, 122, ${p.alpha})`);
      });

      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.translate(cx, cy);

      // Subtle warm aura behind the core
      const auraGrad = ctx.createRadialGradient(0, 0, 4, 0, 0, baseRadius * 0.75);
      auraGrad.addColorStop(0, palette.auraInner);
      auraGrad.addColorStop(1, palette.auraOuter);
      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.arc(0, 0, baseRadius * 0.75, 0, Math.PI * 2);
      ctx.fill();

      // Clean concentric guide rings matching the user's reference
      drawRing(baseRadius * 0.15, palette.strokePrimary, 0.8);
      drawRing(baseRadius * 0.22, palette.strokeFaint, 0.6, [2, 4]);
      drawRing(baseRadius * 0.38, palette.strokeSecondary, 0.7);
      drawRing(baseRadius * 0.52, palette.strokeFaint, 0.6, [3, 5]);
      drawRing(baseRadius * 0.68, palette.strokeSecondary, 0.8);

      // Center Bindu Dot
      drawPoint(0, 0, 2.8, palette.nodePoint);

      // -------------------------------------------------------------
      // 1. INNERMOST LOTUS PETALS (ROTATES ANTICLOCKWISE)
      // -------------------------------------------------------------
      ctx.save();
      ctx.rotate(-rotation); // <-- Inner rotates anticlockwise!
      for (let i = 0; i < folds; i++) {
        ctx.save();
        ctx.rotate(i * angleStep);
        ctx.lineWidth = 0.8;
        drawPetal(baseRadius * 0.22, baseRadius * 0.06, palette.strokePrimary);
        drawPoint(0, baseRadius * 0.22, 1.2, palette.nodePoint);
        ctx.restore();
      }
      ctx.restore();

      // -------------------------------------------------------------
      // 2. GEOMETRIC JAALI DIAMONDS (ROTATES CLOCKWISE)
      // -------------------------------------------------------------
      ctx.save();
      ctx.rotate(rotation * 0.7);
      for (let i = 0; i < folds; i++) {
        ctx.save();
        ctx.rotate(i * angleStep + angleStep / 2);
        ctx.strokeStyle = palette.strokeSecondary;
        ctx.lineWidth = 0.7;
        ctx.beginPath();
        ctx.moveTo(0, baseRadius * 0.24);
        ctx.lineTo(baseRadius * 0.07, baseRadius * 0.38);
        ctx.lineTo(0, baseRadius * 0.50);
        ctx.lineTo(-baseRadius * 0.07, baseRadius * 0.38);
        ctx.closePath();
        ctx.stroke();
        drawPoint(0, baseRadius * 0.38, 1.2, palette.strokePrimary);
        ctx.restore();
      }
      ctx.restore();

      // -------------------------------------------------------------
      // 3. MID PETALS WITH CLEAN CENTRAL SPINE (ROTATES ANTICLOCKWISE)
      // -------------------------------------------------------------
      ctx.save();
      ctx.rotate(-rotation * 0.85);
      for (let i = 0; i < folds; i++) {
        ctx.save();
        ctx.rotate(i * angleStep);
        const petalLen = baseRadius * 0.68;
        const petalWidth = baseRadius * 0.11;
        ctx.lineWidth = 0.85;
        drawPetal(petalLen, petalWidth, palette.strokeSecondary);

        // Subtle internal spine
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

      // -------------------------------------------------------------
      // 4. OUTER DOMES & FLAME ACCENTS (ROTATES CLOCKWISE)
      // -------------------------------------------------------------
      ctx.save();
      ctx.rotate(rotation * 0.45); // <-- Outer portion moves clockwise!

      const rInner = baseRadius * 0.68;
      const rOuterTip = baseRadius * 1.05;
      const rInterTip = baseRadius * 0.84;
      const maxHalfWidth = (Math.PI * rInner) / folds;
      const domeHeight = rOuterTip - rInner;
      const domeBaseWidth = maxHalfWidth * 0.90;
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
        // Left foot
        ctx.moveTo(-domeBaseWidth, rInner);
        // Flared side wall
        ctx.bezierCurveTo(
          -domeBellyWidth,
          rInner + domeHeight * 0.22,
          -domeBellyWidth * 0.92,
          rInner + domeHeight * 0.48,
          -domeBaseWidth * 0.52,
          rInner + domeHeight * 0.70
        );
        // Inward curve to sharp pointed crest
        ctx.bezierCurveTo(
          -domeBaseWidth * 0.20,
          rInner + domeHeight * 0.86,
          -domeBaseWidth * 0.02,
          rInner + domeHeight * 0.96,
          0,
          rOuterTip
        );
        // Right side
        ctx.bezierCurveTo(
          domeBaseWidth * 0.02,
          rInner + domeHeight * 0.96,
          domeBaseWidth * 0.20,
          rInner + domeHeight * 0.86,
          domeBaseWidth * 0.52,
          rInner + domeHeight * 0.70
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

        // Wide inner portal niche
        const iw = domeBaseWidth * 0.64;
        const ih = domeHeight * 0.30;
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

        // Center finial spine
        ctx.beginPath();
        ctx.moveTo(0, rInner + ih + 2);
        ctx.lineTo(0, rOuterTip - 2);
        ctx.strokeStyle = palette.strokeFaint;
        ctx.lineWidth = 0.55;
        ctx.stroke();

        // Apex finial bead
        drawPoint(0, rOuterTip, 1.3, palette.nodePoint);
        ctx.restore();
      }
      ctx.restore();

      ctx.restore(); // End main transform

      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
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
