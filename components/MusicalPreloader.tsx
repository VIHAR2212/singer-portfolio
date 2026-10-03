"use client";

import React, { useEffect, useRef, useState } from 'react';

interface MusicalPreloaderProps {
  onComplete?: () => void;
}

export default function MusicalPreloader({ onComplete }: MusicalPreloaderProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [typedText, setTypedText] = useState("");
  const [isDismissed, setIsDismissed] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isPageReady, setIsPageReady] = useState(false);

  // Typewriter loop with the exact phrases requested
  useEffect(() => {
    const phrases = [
      'Welcome to Portfolio',
      'Of melodious Singer',
      'Sonal Makwana'
    ];

    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let timer: ReturnType<typeof setTimeout>;

    const handleTypewriterLoop = () => {
      const currentPhrase = phrases[phraseIndex];

      if (isDeleting) {
        charIndex--;
      } else {
        charIndex++;
      }

      setTypedText(currentPhrase.substring(0, charIndex));

      let delay = isDeleting ? 40 : 80;

      if (!isDeleting && charIndex === currentPhrase.length) {
        delay = 1400; // Pause when phrase is complete
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        delay = 300;
      }

      timer = setTimeout(handleTypewriterLoop, delay);
    };

    timer = setTimeout(handleTypewriterLoop, 150);
    return () => clearTimeout(timer);
  }, []);

  // Background site loading readiness check - FAST & NON-BLOCKING
  useEffect(() => {
    let isMounted = true;

    const checkReadiness = () => {
      // If document already complete/interactive, trigger ready immediately
      if (document.readyState === 'complete' || document.readyState === 'interactive') {
        if (isMounted) setIsPageReady(true);
      } else {
        const onReady = () => {
          if (isMounted) setIsPageReady(true);
        };
        window.addEventListener('DOMContentLoaded', onReady, { once: true });
        window.addEventListener('load', onReady, { once: true });
      }
    };

    checkReadiness();

    // Safety fallback: never hang longer than 1.5s
    const safetyTimer = setTimeout(() => {
      if (isMounted) setIsPageReady(true);
    }, 1500);

    return () => {
      isMounted = false;
      clearTimeout(safetyTimer);
    };
  }, []);

  // When website is ready, fade out gracefully without artificial delay
  useEffect(() => {
    if (!isPageReady) return;

    // Brief grace period (350ms) so user gets the elegant intro glimpse without waiting
    const minTimer = setTimeout(() => {
      setIsFadingOut(true);

      const dismissTimer = setTimeout(() => {
        setIsDismissed(true);
        if (onComplete) onComplete();
      }, 500);

      return () => clearTimeout(dismissTimer);
    }, 350);

    return () => clearTimeout(minTimer);
  }, [isPageReady, onComplete]);

  // Main Canvas Animation Engine - OPTIMIZED: no shadowBlur, DPR capped, low spline steps
  useEffect(() => {
    if (isDismissed) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const COLOR_PRIMARY = '#e2b989';
    const COLOR_SECONDARY = '#9c734b';
    const COLOR_PARTICLE = '#fadbb5';

    let width = 0;
    let height = 0;
    let animationId = 0;
    let isPaused = false;
    let isMobile = false;

    function resizeCanvas() {
      if (!canvas || !ctx) return;
      // Cap DPR to 1.0 on mobile, 1.25 on desktop
      isMobile = window.innerWidth < 768;
      const dpr = isMobile ? 1.0 : Math.min(window.devicePixelRatio || 1, 1.25);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas, { passive: true });

    function getStaffPoint(t: number) {
      const wave = Math.sin(t * Math.PI * 2.2 - performance.now() * 0.0014) * 6 * Math.sin(t * Math.PI);

      let p0: { x: number; y: number }, p1: { x: number; y: number }, p2: { x: number; y: number }, p3: { x: number; y: number };
      if (isMobile) {
        p0 = { x: width * -0.05, y: -30 };
        p1 = { x: width * 0.28, y: height * 0.2 };
        p2 = { x: width * 0.12, y: height * 0.58 };
        p3 = { x: width * 0.98, y: height * 0.96 };
      } else {
        p0 = { x: width * -0.02, y: -40 };
        p1 = { x: width * 0.28, y: height * 0.22 };
        p2 = { x: width * 0.18, y: height * 0.62 };
        p3 = { x: width * 0.97, y: height * 0.97 };
      }

      const u = 1 - t;
      const tt = t * t;
      const uu = u * u;
      const uuu = uu * u;
      const ttt = tt * t;

      const x = uuu * p0.x + 3 * uu * t * p1.x + 3 * u * tt * p2.x + ttt * p3.x;
      const y = uuu * p0.y + 3 * uu * t * p1.y + 3 * u * tt * p2.y + ttt * p3.y;

      return { x: x + wave, y };
    }

    function getStaffSpacing(t: number) {
      const narrowDownsideSpacing = isMobile ? 8.5 : 10.5;
      const wideTopSpacing = isMobile ? 24 : 32;
      const taper = Math.pow(1 - t, 0.88);
      return narrowDownsideSpacing + (wideTopSpacing - narrowDownsideSpacing) * taper;
    }

    function getStaffNormal(t: number) {
      const delta = 0.008;
      const t1 = Math.max(0, t - delta);
      const t2 = Math.min(1, t + delta);
      const p1 = getStaffPoint(t1);
      const p2 = getStaffPoint(t2);

      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const len = Math.hypot(dx, dy) || 1;

      return {
        nx: -dy / len,
        ny: dx / len,
        angle: Math.atan2(dy, dx),
      };
    }

    const NOTE_TYPES = ['eighth', 'beamed', 'quarter', 'trebleClef', 'barLine', 'sharp'];

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      decay: number;
      size: number;
    }

    const PARTICLES: Particle[] = [];
    function spawnParticles(x: number, y: number) {
      if (PARTICLES.length > 20) return;
      PARTICLES.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 0.8,
        vy: -Math.random() * 0.6 - 0.1,
        life: 1.0,
        decay: Math.random() * 0.03 + 0.02,
        size: Math.random() * 1.5 + 0.8,
      });
    }

    function updateAndDrawParticles() {
      if (!ctx) return;
      ctx.save();
      for (let i = PARTICLES.length - 1; i >= 0; i--) {
        const p = PARTICLES[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= p.decay;

        if (p.life <= 0) {
          PARTICLES.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fillStyle = COLOR_PARTICLE;
        ctx.globalAlpha = p.life * 0.65;
        ctx.fill();
      }
      ctx.restore();
    }

    class FlowNote {
      t: number;
      lineIndex: number;
      speed: number;
      type: string;
      opacity: number;

      constructor(initialT = 0) {
        this.t = initialT;
        const possiblePositions = [-2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2];
        this.lineIndex = possiblePositions[Math.floor(Math.random() * possiblePositions.length)];
        this.speed = 0.0016 + Math.random() * 0.0012;
        this.type = NOTE_TYPES[Math.floor(Math.random() * NOTE_TYPES.length)];
        this.opacity = 0;
      }

      update() {
        this.t += this.speed;

        if (this.t < 0.12) {
          this.opacity = this.t / 0.12;
        } else if (this.t > 0.86) {
          this.opacity = Math.max(0, (1 - this.t) / 0.14);
        } else {
          this.opacity = 1;
        }

        if (Math.random() < 0.04 && this.opacity > 0.4) {
          const pos = this.getPosition();
          spawnParticles(pos.x, pos.y);
        }
      }

      getPosition() {
        const center = getStaffPoint(this.t);
        const norm = getStaffNormal(this.t);
        const currentSpacing = getStaffSpacing(this.t);
        return {
          x: center.x + norm.nx * (this.lineIndex * currentSpacing),
          y: center.y + norm.ny * (this.lineIndex * currentSpacing),
          angle: norm.angle,
          lineSpacing: currentSpacing,
        };
      }

      draw(context: CanvasRenderingContext2D) {
        if (this.opacity <= 0.02) return;
        const pos = this.getPosition();
        const s = pos.lineSpacing * 0.95;

        context.save();
        context.translate(pos.x, pos.y);
        context.rotate(pos.angle);
        context.globalAlpha = this.opacity;

        // Clean rendering WITHOUT heavy shadowBlur
        context.fillStyle = COLOR_PRIMARY;
        context.strokeStyle = COLOR_PRIMARY;
        context.lineWidth = Math.max(1.5, pos.lineSpacing * 0.16);

        switch (this.type) {
          case 'eighth': {
            context.beginPath();
            context.ellipse(0, 0, s * 0.48, s * 0.35, -0.4, 0, Math.PI * 2);
            context.fill();
            context.beginPath();
            context.moveTo(s * 0.38, 0);
            context.lineTo(s * 0.38, -s * 1.6);
            context.stroke();
            context.beginPath();
            context.moveTo(s * 0.38, -s * 1.6);
            context.bezierCurveTo(s * 1.0, -s * 1.3, s * 0.85, -s * 0.7, s * 0.38, -s * 0.5);
            context.stroke();
            break;
          }

          case 'beamed': {
            context.beginPath();
            context.ellipse(-s * 0.55, 0, s * 0.44, s * 0.32, -0.35, 0, Math.PI * 2);
            context.fill();
            context.beginPath();
            context.ellipse(s * 0.55, -s * 0.25, s * 0.44, s * 0.32, -0.35, 0, Math.PI * 2);
            context.fill();
            context.beginPath();
            context.moveTo(-s * 0.22, 0);
            context.lineTo(-s * 0.22, -s * 1.5);
            context.moveTo(s * 0.88, -s * 0.25);
            context.lineTo(s * 0.88, -s * 1.75);
            context.stroke();
            context.lineWidth = 3.2;
            context.beginPath();
            context.moveTo(-s * 0.22, -s * 1.5);
            context.lineTo(s * 0.88, -s * 1.75);
            context.stroke();
            break;
          }

          case 'quarter': {
            context.beginPath();
            context.ellipse(0, 0, s * 0.48, s * 0.35, -0.35, 0, Math.PI * 2);
            context.fill();
            context.beginPath();
            context.moveTo(s * 0.38, 0);
            context.lineTo(s * 0.38, -s * 1.6);
            context.stroke();
            break;
          }

          case 'trebleClef': {
            context.font = `${s * 3.2}px 'Playfair Display', Georgia, serif`;
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillText('𝄞', 0, 0);
            break;
          }

          case 'sharp': {
            context.font = `${s * 1.6}px monospace`;
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillText('♯', 0, 0);
            break;
          }

          case 'barLine': {
            const h = pos.lineSpacing * 4.4;
            context.beginPath();
            context.moveTo(0, -h / 2);
            context.lineTo(0, h / 2);
            context.lineWidth = 2.2;
            context.stroke();
            context.lineWidth = 1.1;
            context.moveTo(4, -h / 2);
            context.lineTo(4, h / 2);
            context.stroke();
            break;
          }
        }

        context.restore();
      }
    }

    const NOTES_POOL: FlowNote[] = [];
    const targetNoteCount = isMobile ? 5 : 7;
    for (let i = 0; i < targetNoteCount; i++) {
      NOTES_POOL.push(new FlowNote((i / targetNoteCount) * 0.92));
    }

    function drawStaffLines() {
      if (!ctx) return;
      const steps = isMobile ? 42 : 65;

      for (let lineIndex = -2; lineIndex <= 2; lineIndex++) {
        ctx.beginPath();

        for (let i = 0; i <= steps; i++) {
          const t = i / steps;
          const pt = getStaffPoint(t);
          const norm = getStaffNormal(t);
          const currentSpacing = getStaffSpacing(t);

          const px = pt.x + norm.nx * (lineIndex * currentSpacing);
          const py = pt.y + norm.ny * (lineIndex * currentSpacing);

          if (i === 0) {
            ctx.moveTo(px, py);
          } else {
            ctx.lineTo(px, py);
          }
        }

        const gradient = ctx.createLinearGradient(0, 0, width * 0.88, height);
        gradient.addColorStop(0, 'rgba(226, 185, 137, 0.22)');
        gradient.addColorStop(0.3, COLOR_PRIMARY);
        gradient.addColorStop(0.8, COLOR_SECONDARY);
        gradient.addColorStop(1, 'rgba(226, 185, 137, 0.06)');

        ctx.strokeStyle = gradient;
        ctx.lineWidth = lineIndex === 0 ? 1.8 : 1.3;
        ctx.stroke();
      }

      // Top measure bracket
      const topPt = getStaffPoint(0.03);
      const topNorm = getStaffNormal(0.03);
      const topSpacing = getStaffSpacing(0.03);
      const topHalfHeight = topSpacing * 2.3;
      ctx.beginPath();
      ctx.moveTo(topPt.x + topNorm.nx * -topHalfHeight, topPt.y + topNorm.ny * -topHalfHeight);
      ctx.lineTo(topPt.x + topNorm.nx * topHalfHeight, topPt.y + topNorm.ny * topHalfHeight);
      ctx.lineWidth = 2.4;
      ctx.strokeStyle = COLOR_PRIMARY;
      ctx.stroke();
    }

    const handleVisibility = () => {
      isPaused = document.hidden;
      if (!isPaused && !animationId) {
        animationId = requestAnimationFrame(render);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    function render() {
      if (isPaused || !ctx || isFadingOut) {
        animationId = 0;
        return;
      }

      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);

      drawStaffLines();

      for (let i = NOTES_POOL.length - 1; i >= 0; i--) {
        const note = NOTES_POOL[i];
        note.update();
        note.draw(ctx);

        if (note.t >= 1.0) {
          NOTES_POOL.splice(i, 1);
          NOTES_POOL.push(new FlowNote(0.01));
        }
      }

      updateAndDrawParticles();

      animationId = requestAnimationFrame(render);
    }

    animationId = requestAnimationFrame(render);

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [isFadingOut, isDismissed]);

  if (isDismissed) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-[99999] bg-[#000000] text-[#e8cbb0] overflow-hidden select-none pointer-events-auto transition-opacity duration-500 ease-out ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      aria-label="Loading Sonal Makwana Portfolio"
      role="status"
    >
      <style>{`
        .serif-title {
          font-family: 'Playfair Display', 'Cormorant Garamond', Georgia, serif;
        }
        .clean-glow {
          text-shadow: 0 0 10px rgba(226, 185, 137, 0.32);
        }
        @keyframes cursorBlink {
          0%, 45% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
        .cursor-blink {
          animation: cursorBlink 0.9s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>

      {/* Fullscreen Main Animation Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block z-0" />

      {/* Right-aligned text positioned comfortably */}
      <div className="absolute top-[22%] xs:top-[24%] sm:top-[26%] md:top-[28%] right-5 sm:right-10 md:right-14 lg:right-20 flex flex-col items-end text-right z-10 pointer-events-none select-none max-w-[85vw] sm:max-w-lg md:max-w-2xl">
        <div className="flex items-baseline justify-end flex-wrap sm:flex-nowrap">
          <span className="text-xl xs:text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-normal tracking-tight text-[#f3dfca] serif-title clean-glow leading-tight">
            {typedText}
          </span>
          <span className="inline-block w-1.5 sm:w-2 md:w-2.5 h-5 sm:h-8 md:h-10 ml-1.5 sm:ml-2 bg-[#e2b989] rounded-xs cursor-blink align-middle shrink-0" />
        </div>
      </div>
    </div>
  );
}
