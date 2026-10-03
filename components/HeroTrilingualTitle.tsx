"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LUXURY_EASE: [number, number, number, number] = [0.32, 0.72, 0, 1];

interface NameLanguage {
  id: string;
  label: string;
  nativeLabel: string;
  line1: string;
  line2: string;
  fontClass: string;
  subtagline: string;
}

const NAME_LANGUAGES: NameLanguage[] = [
  {
    id: 'en',
    label: 'English',
    nativeLabel: 'English',
    line1: 'Sonal',
    line2: 'Makwana',
    fontClass: 'font-serif-luxury',
    subtagline: 'A Voice That Brings Every Celebration to Life.',
  },
  {
    id: 'gu',
    label: 'Gujarati',
    nativeLabel: 'ગુજરાતી',
    line1: 'સોનલ',
    line2: 'મકવાણા',
    fontClass: 'font-serif-gujarati',
    subtagline: 'દરેક ઉત્સવ અને પ્રસંગમાં પ્રાણ પૂરતો સુર',
  },
  {
    id: 'hi',
    label: 'Hindi',
    nativeLabel: 'हिन्दी',
    line1: 'सोनल',
    line2: 'मकवाणा',
    fontClass: 'font-serif-devanagari',
    subtagline: 'हर उत्सव और समारोह में जान फूंकने वाली आवाज़',
  },
];

export default function HeroTrilingualTitle() {
  const [currentLangIdx, setCurrentLangIdx] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Respect reduced motion
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) return;

    let isVisible = true;
    let isTabVisible = !document.hidden;
    let interval: ReturnType<typeof setInterval> | null = null;

    const startTimer = () => {
      if (interval) clearInterval(interval);
      if (isVisible && isTabVisible) {
        interval = setInterval(() => {
          setCurrentLangIdx((prev) => (prev + 1) % NAME_LANGUAGES.length);
        }, 4200);
      }
    };

    const stopTimer = () => {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
    };

    startTimer();

    const handleVisibility = () => {
      isTabVisible = !document.hidden;
      if (isTabVisible) {
        startTimer();
      } else {
        stopTimer();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);

    let observer: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== 'undefined' && containerRef.current) {
      observer = new IntersectionObserver(([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible) {
          startTimer();
        } else {
          stopTimer();
        }
      });
      observer.observe(containerRef.current);
    }

    return () => {
      stopTimer();
      document.removeEventListener('visibilitychange', handleVisibility);
      if (observer) observer.disconnect();
    };
  }, []);

  const lang = NAME_LANGUAGES[currentLangIdx];

  return (
    <div ref={containerRef} className="space-y-3">
      <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-[104px] font-normal leading-[0.98] tracking-tight min-h-[2.1em] flex flex-col justify-center overflow-visible">
        <AnimatePresence mode="wait">
          <motion.div
            key={lang.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.55, ease: LUXURY_EASE }}
            className={`block ${lang.fontClass} overflow-visible`}
          >
            {/* Top Line: Sonal / સોનલ / सोनल in Big Letters */}
            <div className="overflow-visible pt-2 pb-1">
              <span className="block gold-shimmer-text overflow-visible">
                {lang.line1}
              </span>
            </div>

            {/* Bottom Line: Makwana / મકવાણા / मकवाणा in Big Letters */}
            <div className="overflow-visible pt-1 pb-2">
              <span
                className={`block gold-shimmer-text overflow-visible ${
                  lang.id === 'en' ? 'italic font-light' : 'font-normal'
                }`}
              >
                {lang.line2}
              </span>
            </div>
          </motion.div>
        </AnimatePresence>
      </h1>

      {/* Sub-tagline */}
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: LUXURY_EASE, delay: 0.85 }}
        className="text-sm sm:text-base uppercase tracking-[0.2em] text-[#E5BE7A] font-light pt-2 will-change-transform"
      >
        A Voice That Brings Every Celebration to Life.
      </motion.p>
    </div>
  );
}
