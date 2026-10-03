"use client";

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ArrowUpRight } from 'lucide-react';

const LUXURY_EASE: [number, number, number, number] = [0.32, 0.72, 0, 1];

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  videoId?: string;
  channelUrl?: string;
}

export default function VideoModal({
  isOpen,
  onClose,
  title = "Sonal Makwana Live Performance",
  subtitle = "Classical · Devotional · Garba · Folk Raas",
  videoId = "RXVnBqGBi9A",
  channelUrl = "https://www.youtube.com/@SonalMakwana-zb7qc",
}: VideoModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: LUXURY_EASE }}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
          className="fixed inset-0 z-50 bg-[#0B0705]/95 backdrop-blur-md flex items-center justify-center p-4 md:p-8 cursor-pointer overflow-y-auto"
        >
          <motion.div
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.98, opacity: 0 }}
            transition={{ duration: 0.4, ease: LUXURY_EASE }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-4xl bg-[#0E0C0A] luxury-card p-4 sm:p-6 will-change-transform space-y-4 border border-[#E5BE7A]/30 shadow-2xl cursor-default my-auto"
          >
            {/* Prominent Modal Header Bar */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E5BE7A] animate-pulse" />
                <span className="font-mono text-xs sm:text-sm text-[#E5BE7A] uppercase tracking-wider font-semibold">
                  {title}
                </span>
              </div>
              <button
                onClick={onClose}
                className="px-4 py-1.5 bg-[#E5BE7A] hover:bg-white text-[#090807] font-semibold text-xs sm:text-sm uppercase tracking-wider rounded flex items-center gap-1.5 transition-all shadow-md active:scale-95"
              >
                <X className="w-4 h-4" />
                <span>Close [Esc]</span>
              </button>
            </div>

            {/* 16:9 Video Player - loaded only when modal opens */}
            <div className="aspect-[16/9] w-full overflow-hidden bg-black border border-white/15 shadow-2xl">
              <iframe
                className="w-full h-full"
                src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&controls=1&rel=0`}
                title={title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* Modal Footer with Channel Links and Return Button */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 text-xs sm:text-sm">
              <div>
                <span className="font-serif-luxury text-xl sm:text-2xl text-[#F5EBDD] block">
                  {title}
                </span>
                <span className="text-xs sm:text-sm uppercase tracking-wider text-[#A39888]">
                  {subtitle}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 border border-white/20 text-[#C4B7A5] hover:text-white hover:border-[#E5BE7A] text-xs sm:text-[13px] uppercase tracking-wider font-mono transition-colors font-medium"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Return to Site</span>
                </button>
                <a
                  href={channelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 border border-[#E5BE7A]/40 text-[#E5BE7A] hover:bg-[#E5BE7A] hover:text-black text-xs sm:text-[13px] uppercase tracking-wider font-mono transition-colors font-medium"
                >
                  <span>YouTube Channel</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
