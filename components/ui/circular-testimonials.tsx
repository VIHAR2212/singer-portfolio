"use client";
import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
} from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface Testimonial {
  quote: string;
  name: string;
  designation: string;
  src: string;
  objectPosition?: string;
}

export interface Colors {
  name?: string;
  designation?: string;
  testimony?: string;
  arrowBackground?: string;
  arrowForeground?: string;
  arrowHoverBackground?: string;
}

export interface FontSizes {
  name?: string;
  designation?: string;
  quote?: string;
}

export interface CircularTestimonialsProps {
  testimonials: Testimonial[];
  autoplay?: boolean;
  colors?: Colors;
  fontSizes?: FontSizes;
  onImageClick?: (index: number) => void;
}

function calculateGap(width: number) {
  const minWidth = 768;
  const maxWidth = 1456;
  const minGap = 40;
  const maxGap = 80;
  if (width <= minWidth) return minGap;
  if (width >= maxWidth)
    return Math.max(minGap, maxGap + 0.06018 * (width - maxWidth));
  return minGap + (maxGap - minGap) * ((width - minWidth) / (maxWidth - minWidth));
}

export const CircularTestimonials = ({
  testimonials,
  autoplay = true,
  colors = {},
  fontSizes = {},
  onImageClick,
}: CircularTestimonialsProps) => {
  const colorName = colors.name ?? "#F5EBDD";
  const colorDesignation = colors.designation ?? "#E5BE7A";
  const colorTestimony = colors.testimony ?? "#C4B7A5";
  const colorArrowBg = colors.arrowBackground ?? "#14110E";
  const colorArrowFg = colors.arrowForeground ?? "#E5BE7A";
  const colorArrowHoverBg = colors.arrowHoverBackground ?? "#E5BE7A";

  const [activeIndex, setActiveIndex] = useState(0);
  const [hoverPrev, setHoverPrev] = useState(false);
  const [hoverNext, setHoverNext] = useState(false);
  const [containerWidth, setContainerWidth] = useState(1000);

  const imageContainerRef = useRef<HTMLDivElement>(null);
  const autoplayIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const testimonialsLength = useMemo(() => testimonials.length, [testimonials]);
  const activeTestimonial = useMemo(
    () => testimonials[activeIndex],
    [activeIndex, testimonials]
  );

  useEffect(() => {
    function handleResize() {
      if (imageContainerRef.current) {
        setContainerWidth(imageContainerRef.current.offsetWidth);
      }
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (autoplay && testimonialsLength > 1) {
      autoplayIntervalRef.current = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % testimonialsLength);
      }, 5500);
    }
    return () => {
      if (autoplayIntervalRef.current) clearInterval(autoplayIntervalRef.current);
    };
  }, [autoplay, testimonialsLength]);

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % testimonialsLength);
    if (autoplayIntervalRef.current) clearInterval(autoplayIntervalRef.current);
  }, [testimonialsLength]);

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + testimonialsLength) % testimonialsLength);
    if (autoplayIntervalRef.current) clearInterval(autoplayIntervalRef.current);
  }, [testimonialsLength]);

  function getImageStyle(index: number): React.CSSProperties {
    const gap = calculateGap(containerWidth);
    const maxStickUp = gap * 0.75;
    const isActive = index === activeIndex;
    const isLeft = (activeIndex - 1 + testimonialsLength) % testimonialsLength === index;
    const isRight = (activeIndex + 1) % testimonialsLength === index;

    if (isActive) {
      return {
        zIndex: 3,
        opacity: 1,
        pointerEvents: "auto",
        transform: `translateX(0px) translateY(0px) scale(1) rotateY(0deg)`,
        transition: "all 0.8s cubic-bezier(.32, .72, 0, 1)",
      };
    }
    if (isLeft) {
      return {
        zIndex: 2,
        opacity: 0.7,
        pointerEvents: "auto",
        transform: `translateX(-${gap}px) translateY(-${maxStickUp}px) scale(0.85) rotateY(16deg)`,
        transition: "all 0.8s cubic-bezier(.32, .72, 0, 1)",
      };
    }
    if (isRight) {
      return {
        zIndex: 2,
        opacity: 0.7,
        pointerEvents: "auto",
        transform: `translateX(${gap}px) translateY(-${maxStickUp}px) scale(0.85) rotateY(-16deg)`,
        transition: "all 0.8s cubic-bezier(.32, .72, 0, 1)",
      };
    }
    return {
      zIndex: 1,
      opacity: 0,
      pointerEvents: "none",
      transition: "all 0.8s cubic-bezier(.32, .72, 0, 1)",
    };
  }

  const quoteVariants = {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -15 },
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
        {/* 3D Stacked Image Container */}
        <div className="lg:col-span-6 w-full">
          <div
            className="relative w-full h-[22rem] sm:h-[26rem] md:h-[28rem] [perspective:1000px] flex items-center justify-center cursor-pointer"
            ref={imageContainerRef}
            onClick={() => onImageClick?.(activeIndex)}
          >
            {testimonials.map((testimonial, index) => {
              const webpSrc = testimonial.src.replace(/\.(png|jpg|jpeg)$/i, '.webp');
              return (
                <img
                  key={testimonial.src + index}
                  src={webpSrc}
                  alt={testimonial.name}
                  loading={index === activeIndex ? "eager" : "lazy"}
                  decoding="async"
                  className="absolute inset-0 w-full h-full object-cover rounded-xl border border-[#E5BE7A]/40 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.9)] cursor-pointer will-change-transform"
                  style={{
                    ...getImageStyle(index),
                    objectPosition: testimonial.objectPosition || "center 20%"
                  }}
                  onClick={(e) => {
                    if (index !== activeIndex) {
                      e.stopPropagation();
                      setActiveIndex(index);
                    }
                  }}
                />
              );
            })}
          </div>
          <div className="text-center mt-3.5 text-xs font-mono uppercase tracking-[0.16em] text-[#A39888]">
            Plate [{String(activeIndex + 1).padStart(2, "0")} / {String(testimonialsLength).padStart(2, "0")}] · Click to expand
          </div>
        </div>

        {/* Narrative & Controls */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              variants={quoteVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs sm:text-[13px] text-[#E5BE7A] font-medium px-3 py-1 border border-[#E5BE7A]/30 bg-[#14110E]">
                  STAGE PLATE {String(activeIndex + 1).padStart(2, "0")}
                </span>
                <span className="text-xs uppercase tracking-wider text-[#A39888] font-mono">
                  Live Archival Record
                </span>
              </div>

              <h3
                className="font-serif-luxury text-3xl sm:text-4xl text-[#F5EBDD] font-normal leading-tight"
                style={{ color: colorName }}
              >
                {activeTestimonial.name}
              </h3>

              <p
                className="font-mono text-xs sm:text-sm uppercase tracking-wider text-[#E5BE7A] font-medium"
                style={{ color: colorDesignation }}
              >
                {activeTestimonial.designation}
              </p>

              <motion.p
                className="font-light text-[#D8CDC0] text-base sm:text-lg leading-relaxed pt-2.5 border-t border-white/[0.08]"
                style={{ color: colorTestimony }}
              >
                {activeTestimonial.quote.split(" ").map((word, i) => (
                  <motion.span
                    key={i}
                    initial={{
                      filter: "blur(8px)",
                      opacity: 0,
                      y: 4,
                    }}
                    animate={{
                      filter: "blur(0px)",
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      duration: 0.2,
                      ease: "easeInOut",
                      delay: 0.02 * i,
                    }}
                    style={{ display: "inline-block" }}
                  >
                    {word}&nbsp;
                  </motion.span>
                ))}
              </motion.p>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Controls */}
          <div className="flex items-center gap-4 pt-4 border-t border-white/[0.08]">
            <button
              onClick={handlePrev}
              onMouseEnter={() => setHoverPrev(true)}
              onMouseLeave={() => setHoverPrev(false)}
              className="w-12 h-12 rounded-full border border-[#E5BE7A]/40 flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none"
              style={{
                backgroundColor: hoverPrev ? colorArrowHoverBg : colorArrowBg,
                color: hoverPrev ? "#090807" : colorArrowFg,
              }}
              aria-label="Previous plate"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              onMouseEnter={() => setHoverNext(true)}
              onMouseLeave={() => setHoverNext(false)}
              className="w-12 h-12 rounded-full border border-[#E5BE7A]/40 flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none"
              style={{
                backgroundColor: hoverNext ? colorArrowHoverBg : colorArrowBg,
                color: hoverNext ? "#090807" : colorArrowFg,
              }}
              aria-label="Next plate"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
            <span className="text-xs sm:text-sm font-mono text-[#A39888] ml-2">
              Navigate Archive
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CircularTestimonials;
