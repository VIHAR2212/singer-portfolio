"use client";

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Testimonial } from '@/components/ui/circular-testimonials';

const LUXURY_EASE: [number, number, number, number] = [0.32, 0.72, 0, 1];

interface LightboxModalProps {
  activeIndex: number | null;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  items: Testimonial[];
}

export default function LightboxModal({
  activeIndex,
  onClose,
  onPrev,
  onNext,
  items,
}: LightboxModalProps) {
  useEffect(() => {
    if (activeIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, onClose, onPrev, onNext]);

  return (
    <AnimatePresence>
      {activeIndex !== null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: LUXURY_EASE }}
          className="fixed inset-0 z-50 bg-[#0B0705]/98 flex items-center justify-center p-4 md:p-12 select-none"
          onClick={onClose}
        >
          <button
            onClick={onClose}
            className="absolute top-6 right-6 z-50 text-xs sm:text-sm uppercase tracking-wider text-[#C4B7A5] hover:text-white transition-colors p-2 flex items-center gap-1.5 hover:-translate-y-[1px] active:scale-[0.98] font-medium"
            aria-label="Close Lightbox"
          >
            <span>Close</span>
            <X className="w-4 h-4" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onPrev();
            }}
            className="absolute left-6 z-50 text-xs sm:text-sm uppercase tracking-wider text-[#C4B7A5] hover:text-white transition-colors p-3 hidden sm:flex items-center gap-1 hover:-translate-y-[1px] active:scale-[0.98] font-medium"
            aria-label="Previous Image"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>PREV</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            className="absolute right-6 z-50 text-xs sm:text-sm uppercase tracking-wider text-[#C4B7A5] hover:text-white transition-colors p-3 hidden sm:flex items-center gap-1 hover:-translate-y-[1px] active:scale-[0.98] font-medium"
            aria-label="Next Image"
          >
            <span>NEXT</span>
            <ChevronRight className="w-4 h-4" />
          </button>

          <motion.div
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.98, opacity: 0 }}
            transition={{ duration: 0.4, ease: LUXURY_EASE }}
            className="relative max-w-4xl w-full luxury-card p-6 sm:p-8 flex flex-col md:flex-row items-center gap-8 will-change-transform"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full md:w-3/5 aspect-[16/10] bg-[#14110E] border border-white/10 overflow-hidden">
              <img
                src={items[activeIndex]?.src || items[0]?.src}
                alt={items[activeIndex]?.name || 'Stage Photo'}
                className="w-full h-full object-cover transition-transform duration-300"
                style={{
                  objectPosition: items[activeIndex]?.objectPosition || 'center 20%',
                  transform: `scale(${items[activeIndex]?.scale || 1}) rotate(${items[activeIndex]?.rotation || 0}deg)`,
                  transformOrigin: items[activeIndex]?.objectPosition || 'center 20%',
                }}
              />
            </div>

            <div className="w-full md:w-2/5 space-y-4">
              <span className="font-mono text-xs sm:text-sm text-[#E5BE7A] font-medium">
                PHOTO [{String(activeIndex + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}]
              </span>

              <h3 className="font-serif-luxury text-2xl sm:text-3xl text-[#F5EBDD]">
                {items[activeIndex]?.name || 'Stage Performance'}
              </h3>

              <div className="text-xs sm:text-sm text-[#E5BE7A] font-mono uppercase tracking-wider font-medium">
                Occasion: {items[activeIndex]?.designation || 'Live Concert'}
              </div>

              <p className="text-sm text-[#D8CDC0] font-light leading-relaxed pt-3 border-t border-white/[0.08]">
                {items[activeIndex]?.quote || 'Live stage performance moment by Sonal Makwana.'}
              </p>

              <div className="pt-4 flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-[#A39888] font-mono">
                  Stage Gallery
                </span>
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-[#E5BE7A]/40 text-[#E5BE7A] hover:bg-[#E5BE7A] hover:text-[#0B0705] text-xs sm:text-sm font-mono uppercase tracking-wider transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
