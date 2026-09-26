"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Image from 'next/image';
import Lenis from 'lenis';
import { CircularTestimonials, Testimonial } from '@/components/ui/circular-testimonials';
import { CelestialMandala } from '@/components/ui/celestial-mandala';
import MusicalPreloader from '@/components/MusicalPreloader';
import { 
  motion, 
  AnimatePresence, 
  useScroll, 
  useTransform
} from 'framer-motion';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  MapPin,
  Calendar,
  Clock,
  ArrowUpRight,
  ArrowRight,
  X,
  ChevronLeft,
  ChevronRight,
  Check,
  Disc,
  Sparkles,
  ShieldCheck,
  Music,
  Radio,
  Sliders,
  ChevronUp
} from 'lucide-react';

// Bespoke luxury easing curve for smooth, non-snapping transitions
const LUXURY_EASE: [number, number, number, number] = [0.32, 0.72, 0, 1];

interface Track {
  id: string;
  number: string;
  title: string;
  genre: 'Garba' | 'Classical' | 'Devotional' | 'Bollywood Sufi';
  duration: string;
  ragaOrMood: string;
  description: string;
  frequencyHz: number;
}

const TRACKS_CATALOG: Track[] = [
  {
    id: 'track-1',
    number: '01',
    title: 'Ram Aayenge',
    genre: 'Devotional',
    duration: '03:48',
    ragaOrMood: 'Devotional Bhajan · Bhakti Rasa',
    description: 'A soulful devotional rendition sung with deep emotion, classical grace, and devotion by Sonal Makwana.',
    frequencyHz: 432
  }
];

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
    subtagline: 'A Voice That Brings Every Celebration to Life.'
  },
  {
    id: 'gu',
    label: 'Gujarati',
    nativeLabel: 'ગુજરાતી',
    line1: 'સોનલ',
    line2: 'મકવાણા',
    fontClass: 'font-serif-gujarati',
    subtagline: 'દરેક ઉત્સવ અને પ્રસંગમાં પ્રાણ પૂરતો સુર'
  },
  {
    id: 'hi',
    label: 'Hindi',
    nativeLabel: 'हिन्दी',
    line1: 'सोनल',
    line2: 'मकवाणा',
    fontClass: 'font-serif-devanagari',
    subtagline: 'हर उत्सव और समारोह में जान फूंकने वाली आवाज़'
  }
];

interface GalleryItem {
  id: number;
  number: string;
  title: string;
  category: 'Navratri' | 'Classical' | 'Devotional' | 'Royal Wedding';
  spanClass: string;
  image: string;
}

const GALLERY_ARCHIVE: GalleryItem[] = [
  {
    id: 1,
    number: '01',
    title: 'Navratri Raas Stage',
    category: 'Navratri',
    spanClass: 'col-span-1',
    image: '/gallery-item-1.webp'
  },
  {
    id: 2,
    number: '02',
    title: 'Classical Baithak',
    category: 'Classical',
    spanClass: 'col-span-1',
    image: '/gallery-item-2.webp'
  },
  {
    id: 3,
    number: '03',
    title: 'Wedding Recital',
    category: 'Royal Wedding',
    spanClass: 'col-span-1',
    image: '/gallery-item-3.webp'
  },
  {
    id: 4,
    number: '04',
    title: 'Devotional Bhajan Sandhya',
    category: 'Devotional',
    spanClass: 'col-span-1',
    image: '/gallery-item-4.webp'
  },
  {
    id: 5,
    number: '05',
    title: 'Auditorium Musical Ensemble',
    category: 'Classical',
    spanClass: 'col-span-1',
    image: '/gallery-item-5.webp'
  },
  {
    id: 6,
    number: '06',
    title: 'Festival Concert Stage',
    category: 'Navratri',
    spanClass: 'col-span-1',
    image: '/gallery-item-6.webp'
  }
];

const ARCHIVE_TESTIMONIALS: Testimonial[] = [
  {
    src: '/gallery-item-1.webp',
    name: 'Navratri Raas Stage',
    designation: 'Live Festive Performance',
    quote: 'Energetic traditional Garba and folk melodies bringing thousands of dancers together under the festive night sky.'
  },
  {
    src: '/gallery-item-2.webp',
    name: 'Classical Baithak',
    designation: 'Traditional Sangeet Sabha',
    quote: 'An intimate evening of classical ragas and soulful melodies, performed with years of dedicated riyaz.'
  },
  {
    src: '/gallery-item-3.webp',
    name: 'Wedding Recital',
    designation: 'Family Wedding & Sangeet',
    quote: 'Heartfelt traditional songs and melodious wedding tunes celebrating precious family milestones.'
  },
  {
    src: '/gallery-item-4.webp',
    name: 'Devotional Bhajan Sandhya',
    designation: 'Soulful Bhajans & Prayers',
    quote: 'Peaceful devotional bhajans that create a calm, sacred, and uplifted atmosphere in the hall.'
  },
  {
    src: '/gallery-item-5.webp',
    name: 'Auditorium Ensemble',
    designation: 'Live Stage Concert',
    quote: 'Accompanied by skilled traditional musicians on tabla, harmonium, and acoustic instruments.'
  },
  {
    src: '/gallery-item-6.webp',
    name: 'Festival Concert Stage',
    designation: 'Community Celebration',
    quote: 'Singing beloved Gujarati and Hindi melodies that bring joy and smiles across generations.'
  }
];

const REPERTOIRE_PILLARS = [
  {
    id: '01',
    title: 'Navratri & Raas Garba',
    tradition: 'Festive High-Energy Nights',
    narrative: 'Fast-paced traditional dhol beats, classic Gujarati Garba, and popular folk songs that get everyone on their feet dancing with joy throughout the night.',
    accent: 'Popular on Festival Stages',
    tag: 'Festive Garba'
  },
  {
    id: '02',
    title: 'Devotional & Santvani',
    tradition: 'Soulful Bhajans & Stutis',
    narrative: 'Peaceful morning and evening bhajans, Krishna and Mataji songs, Santvani, and sacred stutis sung with genuine devotion that touch every heart.',
    accent: 'Temples & Satsang Evenings',
    tag: 'Bhakti Rasa'
  },
  {
    id: '03',
    title: 'Semi-Classical & Thumri',
    tradition: 'Timeless Classical Ragas',
    narrative: 'Rooted in dedicated classical training, featuring expressive ragas, graceful thumris, and melodious compositions sung with emotional depth.',
    accent: 'Sangeet Sabhas & Baithaks',
    tag: 'Classical Depth'
  },
  {
    id: '04',
    title: 'Wedding Sangeet & Folk',
    tradition: 'Joyous Family Celebrations',
    narrative: 'A curated blend of auspicious lagna geet, regional Gujarati folk, and golden Bollywood melodies to make your family celebrations truly unforgettable.',
    accent: 'Weddings & Sangeet Sandhya',
    tag: 'Celebration'
  }
];


// IntersectionObserver based luxury reveal container
function LuxuryReveal({
  children,
  className = "",
  delay = 0,
  yOffset = 18
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  yOffset?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: yOffset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.85, ease: LUXURY_EASE, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Atmospheric subtle drifting dust motes in auditorium light
function DustParticles() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    // Respect prefers-reduced-motion
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // 22 subtle drifting motes at < 0.035 opacity
    const particles = Array.from({ length: 22 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 0.8 + 0.5,
      opacity: Math.random() * 0.022 + 0.012,
      vx: (Math.random() - 0.5) * 0.18,
      vy: -Math.random() * 0.22 - 0.07,
      wobble: Math.random() * Math.PI * 2,
    }));

    let isPaused = false;
    const handleVisibility = () => {
      isPaused = document.hidden;
      if (!isPaused && !animationId) {
        animationId = requestAnimationFrame(render);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    const render = () => {
      if (isPaused) {
        animationId = 0;
        return;
      }
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.wobble += 0.012;
        p.x += p.vx + Math.sin(p.wobble) * 0.12;
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
      });

      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[1] will-change-transform"
      style={{ opacity: 0.8 }}
    />
  );
}

// Handcrafted Sacred Celestial Classical Mandala for Hero with Counter-Rotating Kinetics
function HeroMandala() {
  return (
    <div 
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] sm:w-[680px] sm:h-[680px] md:w-[820px] md:h-[820px] lg:w-[950px] lg:h-[950px] xl:w-[1000px] xl:h-[1000px] pointer-events-none z-0 select-none flex items-center justify-center overflow-visible will-change-transform"
      aria-hidden="true"
    >
      <CelestialMandala opacity={0.22} speedMultiplier={1.2} />
    </div>
  );
}

class AmbientTanpuraEngine {
  ctx: AudioContext | null = null;
  masterGain: GainNode | null = null;
  oscillators: OscillatorNode[] = [];
  isPlaying: boolean = false;

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
  }

  playDrone(baseFreq: number = 136.1) {
    if (!this.ctx) this.init();
    if (!this.ctx || !this.masterGain) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    this.stopDrone();

    // Sacred Tanpura string harmonics: Sa (root), Pa (fifth), Sa' (octave), Kharaj Sa (lower octave)
    const harmonicRatios = [1.0, 1.4983, 2.0, 0.5];
    const now = this.ctx.currentTime;

    harmonicRatios.forEach((ratio, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();

      osc.type = idx === 1 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(baseFreq * ratio, now);
      // Subtle natural chorus micro-detuning
      osc.detune.setValueAtTime((idx - 1.5) * 2.8, now);

      oscGain.gain.setValueAtTime(0.032 / (idx + 1), now);
      osc.connect(oscGain);
      oscGain.connect(this.masterGain);

      osc.start();
      this.oscillators.push(osc);
    });

    this.masterGain.gain.linearRampToValueAtTime(0.075, now + 1.8);
    this.isPlaying = true;
  }

  stopDrone() {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    this.masterGain.gain.linearRampToValueAtTime(0.0001, now + 1.0);
    setTimeout(() => {
      this.oscillators.forEach(o => {
        try {
          o.stop();
          o.disconnect();
        } catch {
          // Already stopped
        }
      });
      this.oscillators = [];
      this.isPlaying = false;
    }, 1100);
  }
}

export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Audio Player State
  const [auraActive, setAuraActive] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track>(TRACKS_CATALOG[0]);
  const [isPlayingTrack, setIsPlayingTrack] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [loadAudioPlayer, setLoadAudioPlayer] = useState(false);
  const tanpuraEngineRef = useRef<AmbientTanpuraEngine | null>(null);
  const audioIframeRef = useRef<HTMLIFrameElement>(null);

  // Gallery & Lightbox State
  const [activeLightboxIndex, setActiveLightboxIndex] = useState<number | null>(null);
  const [showVideoModal, setShowVideoModal] = useState(false);

  // Dynamic Stage Moments Gallery and Site Performance Settings
  const [stageMoments, setStageMoments] = useState<Testimonial[]>(ARCHIVE_TESTIMONIALS);
  const [siteSettings, setSiteSettings] = useState({
    heroPortrait: {
      image: "/sonal-hero-portrait.webp",
      objectPosition: "center 20%",
      scale: 1,
      rotation: 0,
      tagline: "A Voice That Brings Every Celebration to Life."
    },
    riyazPhoto: {
      image: "/sonal-riyaz-academy.webp",
      objectPosition: "center 20%",
      scale: 1,
      rotation: 0,
      title: "Musical Journey & Practice",
      subtitle: "Classical Riyaz"
    },
    livePerformance: {
      title: "The Magic of Live Music",
      subtitle: "Glimpses from stage shows and festival evenings",
      description: "Experience the energy, warmth, and joy that Sonal brings to every live stage performance.",
      youtubeUrl: "https://www.youtube.com/watch?v=RXVnBqGBi9A",
      videoId: "RXVnBqGBi9A",
      channelUrl: "https://www.youtube.com/@SonalMakwana-zb7qc",
      thumbnail: "/sonal-concert-stage.webp"
    },
    featuredSong: {
      title: "Ram Aayenge",
      subtitle: "A soulful devotional rendition sung with deep emotion, classical grace, and devotion by Sonal Makwana.",
      videoId: "1CTF9uM65b8",
      raag: "Bhairavi",
      frequencyHz: 136.1
    }
  });

  useEffect(() => {
    // Dynamically load gallery items updated from admin (with cache: 'no-store' to ensure instant reflection)
    fetch(`/api/gallery?t=${Date.now()}`, { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.items) && data.items.length > 0) {
          const formatted = data.items.map((it: any) => ({
            src: it.image,
            name: it.title,
            designation: it.designation || it.category || 'Live Festive Performance',
            quote: it.quote || '',
            objectPosition: it.objectPosition || 'center 20%',
            scale: it.scale || 1,
            rotation: it.rotation || 0
          }));
          setStageMoments(formatted);
        }
      })
      .catch(() => {});

    // Dynamically load live performance video & featured song settings
    fetch(`/api/settings?t=${Date.now()}`, { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.settings) {
          setSiteSettings(data.settings);
        }
      })
      .catch(() => {});
  }, []);

  // Trilingual Artist Name Display State
  const [currentLangIdx, setCurrentLangIdx] = useState(0);
  const [isAutoCycling, setIsAutoCycling] = useState(true);

  // Auto-cycle through languages smoothly every 4.2s
  useEffect(() => {
    if (!isAutoCycling) return;
    const interval = setInterval(() => {
      setCurrentLangIdx((prev) => (prev + 1) % NAME_LANGUAGES.length);
    }, 4200);
    return () => clearInterval(interval);
  }, [isAutoCycling]);

  // Booking Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    eventType: 'Royal Wedding & Sangeet Gala',
    eventDate: '',
    location: '',
    guestCount: 'Palace Scale (500 - 1,500 Guests)',
    notes: ''
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inquiryCode, setInquiryCode] = useState('');

  // Lenis smooth scroll reference
  const lenisRef = useRef<Lenis | null>(null);

  // Scroll animations with non-bouncy transform
  const { scrollYProgress } = useScroll();
  const heroImageY = useTransform(scrollYProgress, [0, 0.3], [0, 40]);

  useEffect(() => {
    tanpuraEngineRef.current = new AmbientTanpuraEngine();

    // Initialize Lenis Smooth Scroll
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.9,
    });
    lenisRef.current = lenis;

    let animationFrameId: number;
    function raf(time: number) {
      lenis.raf(time);
      animationFrameId = requestAnimationFrame(raf);
    }
    animationFrameId = requestAnimationFrame(raf);

    // Sync header scroll state via Lenis
    lenis.on('scroll', (e: { scroll: number }) => {
      setIsScrolled(e.scroll > 30);
    });

    return () => {
      cancelAnimationFrame(animationFrameId);
      lenis.destroy();
      if (tanpuraEngineRef.current) {
        tanpuraEngineRef.current.stopDrone();
      }
    };
  }, []);

  // Track playback simulation progress (3 min 48 sec = 228 sec)
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlayingTrack) {
      interval = setInterval(() => {
        setAudioProgress(prev => {
          if (prev >= 100) {
            setIsPlayingTrack(false);
            return 0;
          }
          return prev + 0.44;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlayingTrack]);

  // Audio Playback toggle via postMessage to background stream
  const toggleAudioPlayback = () => {
    const nextPlaying = !isPlayingTrack;
    if (!loadAudioPlayer) {
      setLoadAudioPlayer(true);
    }
    setIsPlayingTrack(nextPlaying);
    setTimeout(() => {
      if (audioIframeRef.current?.contentWindow) {
        audioIframeRef.current.contentWindow.postMessage(
          JSON.stringify({
            event: 'command',
            func: nextPlaying ? 'playVideo' : 'pauseVideo',
            args: []
          }),
          '*'
        );
      }
    }, loadAudioPlayer ? 0 : 500);
  };

  const openVideoModal = () => {
    if (isPlayingTrack) {
      toggleAudioPlayback();
    }
    setShowVideoModal(true);
  };

  // Keyboard controls for Lightbox and Video Modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveLightboxIndex(null);
        setShowVideoModal(false);
      }
      if (activeLightboxIndex !== null) {
        if (e.key === 'ArrowRight') {
          setActiveLightboxIndex(prev => (prev !== null && prev < GALLERY_ARCHIVE.length - 1 ? prev + 1 : 0));
        }
        if (e.key === 'ArrowLeft') {
          setActiveLightboxIndex(prev => (prev !== null && prev > 0 ? prev - 1 : GALLERY_ARCHIVE.length - 1));
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeLightboxIndex, showVideoModal]);

  const toggleTanpuraAura = () => {
    if (!tanpuraEngineRef.current) return;
    if (auraActive) {
      tanpuraEngineRef.current.stopDrone();
      setAuraActive(false);
    } else {
      tanpuraEngineRef.current.playDrone(currentTrack.frequencyHz);
      setAuraActive(true);
    }
  };

  const handleTrackChange = (track: Track) => {
    setCurrentTrack(track);
    setIsPlayingTrack(true);
    setAudioProgress(8);
    if (auraActive && tanpuraEngineRef.current) {
      tanpuraEngineRef.current.playDrone(track.frequencyHz);
    }
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const code = `SM-${Math.floor(1000 + Math.random() * 9000)}-${new Date().getFullYear()}`;
      setInquiryCode(code);
      setFormSubmitted(true);
    }, 1000);
  };


  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    if (lenisRef.current) {
      const el = document.getElementById(id);
      if (el) {
        lenisRef.current.scrollTo(el, { offset: -20, duration: 1.25 });
        return;
      }
    }
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0B0705] text-[#E8DDCB] selection:bg-[#E5BE7A]/25 selection:text-[#FFF7ED] font-['Outfit',sans-serif] overflow-x-hidden antialiased">
      {/* Bespoke Responsive Musical Preloader */}
      <MusicalPreloader />
      
      {/* Luxury Font & Handcrafted Indian Texture Injections */}
      <style>{`
        .font-serif-luxury {
          font-family: 'Cormorant Garamond', Georgia, serif;
        }

        .font-serif-devanagari {
          font-family: 'Noto Serif Devanagari', 'Martel', 'Nirmala UI', 'Mangal', serif;
        }

        .font-serif-gujarati {
          font-family: 'Noto Serif Gujarati', 'Shruti', 'Nirmala UI', 'Gujarati Sangam MN', serif;
        }

        /* Sacred Circular Mandala Gentle Living Drift (1.6° every 30s) */
        @keyframes mandalaSlowDrift {
          0% {
            transform: rotate(0deg);
          }
          50% {
            transform: rotate(1.6deg);
          }
          100% {
            transform: rotate(0deg);
          }
        }

        .mandala-alive {
          animation: mandalaSlowDrift 60s ease-in-out infinite;
          transform-origin: 400px 400px;
          will-change: transform;
        }

        /* Ajrakh & Bandhani Inspired Tone-on-Tone Textile Pattern (2.5-3.5% opacity) */
        .bg-indian-textile {
          background-image: url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23E5BE7A' stroke-width='0.75' stroke-opacity='0.032'%3E%3Cpath d='M40 0 L40 80 M0 40 L80 40' /%3E%3Cpolygon points='40,16 64,40 40,64 16,40' /%3E%3Cpolygon points='40,24 56,40 40,56 24,40' /%3E%3Ccircle cx='40' cy='40' r='5' fill='%23E5BE7A' fill-opacity='0.025' /%3E%3Ccircle cx='40' cy='40' r='10' stroke-dasharray='2,2' /%3E%3Ccircle cx='0' cy='0' r='8' /%3E%3Ccircle cx='80' cy='0' r='8' /%3E%3Ccircle cx='0' cy='80' r='8' /%3E%3Ccircle cx='80' cy='80' r='8' /%3E%3Ccircle cx='0' cy='40' r='3' fill='%23E5BE7A' fill-opacity='0.025' /%3E%3Ccircle cx='80' cy='40' r='3' fill='%23E5BE7A' fill-opacity='0.025' /%3E%3Ccircle cx='40' cy='0' r='3' fill='%23E5BE7A' fill-opacity='0.025' /%3E%3Ccircle cx='40' cy='80' r='3' fill='%23E5BE7A' fill-opacity='0.025' /%3E%3Ccircle cx='20' cy='20' r='1.2' fill='%23E5BE7A' fill-opacity='0.035' /%3E%3Ccircle cx='60' cy='20' r='1.2' fill='%23E5BE7A' fill-opacity='0.035' /%3E%3Ccircle cx='20' cy='60' r='1.2' fill='%23E5BE7A' fill-opacity='0.035' /%3E%3Ccircle cx='60' cy='60' r='1.2' fill='%23E5BE7A' fill-opacity='0.035' /%3E%3C/g%3E%3C/svg%3E");
          background-repeat: repeat;
        }

        /* Aged Handmade Cotton Rag Paper with Fine Natural Film Grain */
        .bg-handmade-paper {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 300 300' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='paperGrain'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0.9 0 0 0 0 0.82 0 0 0 0 0.7 0 0 0 0.032 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23paperGrain)'/%3E%3C/svg%3E");
          opacity: 0.95;
        }

        /* Faint Brushed Bronze & Gold Foil Texture around Perimeter Edges */
        .bg-bronze-foil-edges {
          background: 
            radial-gradient(ellipse 92% 84% at 50% 50%, transparent 62%, rgba(11, 7, 5, 0.45) 78%, rgba(145, 95, 45, 0.07) 89%, rgba(130, 80, 32, 0.16) 100%),
            linear-gradient(to right, rgba(145, 95, 45, 0.05) 0%, transparent 8%, transparent 92%, rgba(145, 95, 45, 0.05) 100%),
            linear-gradient(to bottom, rgba(145, 95, 45, 0.06) 0%, transparent 6%, transparent 94%, rgba(145, 95, 45, 0.06) 100%);
          box-shadow: inset 0 0 90px 20px rgba(90, 55, 22, 0.12);
        }

        /* Soft Layered Shadows & Uneven Organic Gradients */
        .organic-shadows {
          background:
            radial-gradient(ellipse 60% 45% at 20% 25%, rgba(22, 14, 10, 0.45) 0%, transparent 70%),
            radial-gradient(ellipse 55% 50% at 82% 70%, rgba(18, 12, 8, 0.4) 0%, transparent 75%),
            radial-gradient(ellipse 70% 35% at 50% 90%, rgba(15, 10, 7, 0.5) 0%, transparent 80%);
        }

        @keyframes lightGoldShimmer {
          0% {
            background-position: -200% center;
          }
          100% {
            background-position: 200% center;
          }
        }

        .gold-shimmer-text {
          background: linear-gradient(
            110deg,
            #F5EBDD 0%,
            #E8D4B0 20%,
            #FFF8E7 40%,
            #FFE29A 48%,
            #FFFFFF 52%,
            #FFE8B5 58%,
            #E8D4B0 76%,
            #F5EBDD 100%
          );
          background-size: 240% auto;
          color: transparent;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: lightGoldShimmer 4.8s ease-in-out infinite;
          display: inline-block;
          padding-top: 0.35em;
          padding-bottom: 0.15em;
          margin-top: -0.35em;
          margin-bottom: -0.15em;
          overflow: visible !important;
          filter: drop-shadow(0 0 20px rgba(229, 190, 122, 0.28));
          will-change: background-position;
        }

        .gold-shimmer-subtle {
          background: linear-gradient(
            110deg,
            #C4B7A5 0%,
            #E5BE7A 35%,
            #FFF4D0 50%,
            #E5BE7A 65%,
            #C4B7A5 100%
          );
          background-size: 240% auto;
          color: transparent;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: lightGoldShimmer 5.5s ease-in-out infinite;
          display: inline-block;
        }

        /* Golden Box & Button Sheen Shimmer Effect */
        @keyframes goldBoxSheen {
          0% {
            transform: translateX(-160%) skewX(-25deg);
          }
          35%, 100% {
            transform: translateX(260%) skewX(-25deg);
          }
        }

        .gold-box-shimmer,
        button[class*="from-[#E5BE7A]"],
        button[class*="bg-[#E5BE7A]"],
        button[class*="bg-[#F5EBDD]"],
        .btn-gold {
          position: relative;
          overflow: hidden !important;
          isolation: isolate;
        }

        .gold-box-shimmer::before,
        button[class*="from-[#E5BE7A]"]::before,
        button[class*="bg-[#E5BE7A]"]::before,
        button[class*="bg-[#F5EBDD]"]::before,
        .btn-gold::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 55%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.45) 50%,
            transparent 100%
          );
          transform: translateX(-160%) skewX(-25deg);
          animation: goldBoxSheen 4.2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          pointer-events: none;
          z-index: 10;
        }

        /* Golden Border Card/Frame Subtle Luster */
        @keyframes goldBorderSheen {
          0%, 100% {
            border-color: rgba(229, 190, 122, 0.25);
            box-shadow: 0 0 15px rgba(229, 190, 122, 0.05);
          }
          50% {
            border-color: rgba(229, 190, 122, 0.65);
            box-shadow: 0 0 25px rgba(229, 190, 122, 0.2);
          }
        }

        .gold-border-shimmer {
          animation: goldBorderSheen 4.5s ease-in-out infinite;
        }

        /* Double-bezel luxury card styling with restrained 2px lift, 0.98 press */
        .luxury-card {
          background: #0E0C0A;
          border: 1px solid rgba(229, 190, 122, 0.16);
          box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.03), 0 20px 40px -15px rgba(0, 0, 0, 0.85);
          position: relative;
          will-change: transform;
        }

        .luxury-card-hover {
          transition: border-color 0.4s cubic-bezier(0.32, 0.72, 0, 1), transform 0.4s cubic-bezier(0.32, 0.72, 0, 1);
        }
        .luxury-card-hover:hover {
          border-color: rgba(229, 190, 122, 0.35);
          transform: translateY(-2px);
        }
        .luxury-card-hover:active {
          transform: translateY(-2px) scale(0.98);
        }

        /* Restrained hairline button underline with 2px lift, 0.98 press */
        .editorial-link {
          position: relative;
          display: inline-flex;
          align-items: center;
          transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1), color 0.3s cubic-bezier(0.32, 0.72, 0, 1);
        }
        .editorial-link:hover {
          transform: translateY(-2px);
        }
        .editorial-link:active {
          transform: translateY(-2px) scale(0.98);
        }
        .editorial-link::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 0%;
          height: 1px;
          background-color: #E5BE7A;
          transition: width 0.35s cubic-bezier(0.32, 0.72, 0, 1);
        }
        .editorial-link:hover::after {
          width: 100%;
        }

        /* Minimal scrollbar */
        ::-webkit-scrollbar {
          width: 5px;
        }
        ::-webkit-scrollbar-track {
          background: #0B0705;
        }
        ::-webkit-scrollbar-thumb {
          background: #231E18;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #3B3227;
        }
      `}</style>

      {/* Handcrafted Indian Luxury Background Layers */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-indian-textile" />
      <div className="fixed inset-0 pointer-events-none z-0 bg-handmade-paper" />
      <div className="fixed inset-0 pointer-events-none z-0 organic-shadows" />
      <div className="fixed inset-0 pointer-events-none z-0 bg-bronze-foil-edges" />
      <DustParticles />

      {/* Floating Navbar (0.05s-0.75s fade in first) */}
      <motion.header 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: LUXURY_EASE, delay: 0.05 }}
        className="fixed top-5 left-0 right-0 z-50 px-4 md:px-8 will-change-transform"
      >
        <div 
          className={`max-w-6xl mx-auto px-5 md:px-8 py-3.5 flex items-center justify-between transition-all duration-400 rounded-none md:rounded-full ${
            isScrolled 
              ? 'bg-[#090807]/90 backdrop-blur-md border border-[#E5BE7A]/25 shadow-2xl shadow-black/90 py-3' 
              : 'bg-[#0E0C0A]/70 backdrop-blur-sm border border-white/[0.08]'
          }`}
        >
          {/* Monogram Brand Mark */}
          <button 
            onClick={() => scrollToSection('hero')}
            className="group text-left focus:outline-none flex items-center gap-3 transition-transform duration-300 hover:-translate-y-[1px] active:scale-[0.98]"
            aria-label="Sonal Makwana Home"
          >
            <div className="w-9 h-9 rounded-full border border-[#E5BE7A]/40 flex items-center justify-center bg-[#14110E] group-hover:border-[#E5BE7A] transition-colors">
              <span className="font-serif-luxury text-sm font-bold text-[#E5BE7A]">SM</span>
            </div>
            <span className="font-serif-luxury text-xl sm:text-2xl tracking-tight text-[#F5EBDD] font-normal leading-none group-hover:text-white transition-colors">
              Sonal Makwana
            </span>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-xs lg:text-[13px] uppercase tracking-[0.16em] text-[#C4B7A5] font-normal">
            {[
              { id: 'artiste', label: 'About' },
              { id: 'soundscapes', label: 'Music' },
              { id: 'repertoire', label: 'Styles' },
              { id: 'concerts', label: 'Live' },
              { id: 'archive', label: 'Gallery' },
              { id: 'booking', label: 'Book Show' }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="hover:text-[#F5EBDD] transition-colors editorial-link py-1 font-medium"
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Right Controls: Book Show Button + Mobile Menu Toggle */}
          <div className="flex items-center gap-4">
            {/* Direct Booking Action */}
            <button
              onClick={() => scrollToSection('booking')}
              className="group hidden sm:flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-[#E5BE7A] to-[#C89B56] text-[#090807] text-xs lg:text-[13px] uppercase tracking-[0.15em] font-semibold rounded-full hover:brightness-110 hover:-translate-y-[2px] active:scale-[0.98] transition-all duration-300 shadow-md shadow-[#E5BE7A]/10"
            >
              <span>Book a Show</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-[6px] transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]" />
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-xs sm:text-sm uppercase tracking-wider text-[#E8DDCB] font-medium p-2 focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-[#E5BE7A]" /> : 'MENU'}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25, ease: LUXURY_EASE }}
            className="fixed inset-0 z-40 bg-[#0B0705]/98 backdrop-blur-xl flex flex-col justify-between p-8 pt-28 md:hidden"
          >
            <div className="space-y-6">
              <div className="flex items-center gap-2.5 text-xs uppercase tracking-[0.2em] text-[#E5BE7A] font-medium">
                <span className="w-2 h-2 bg-[#E5BE7A] rounded-full" />
                <span>Sonal Makwana Official Website</span>
              </div>

              <div className="flex flex-col space-y-4">
                {[
                  { id: 'hero', num: '00', label: 'Welcome' },
                  { id: 'artiste', num: '01', label: 'About Sonal' },
                  { id: 'soundscapes', num: '02', label: 'Music' },
                  { id: 'repertoire', num: '03', label: 'Four Musical Styles' },
                  { id: 'concerts', num: '04', label: 'Live Performances' },
                  { id: 'archive', num: '05', label: 'Gallery' },
                  { id: 'booking', num: '06', label: 'Book a Live Show' }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className="text-left flex items-baseline justify-between border-b border-white/[0.08] pb-3.5 group hover:-translate-y-[1px] active:scale-[0.98] transition-all"
                  >
                    <span className="font-serif-luxury text-2xl sm:text-3xl text-[#F5EBDD] font-light group-hover:text-[#E5BE7A] transition-colors">
                      {item.label}
                    </span>
                    <span className="font-mono text-sm text-[#A39888]">{item.num}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-white/[0.08] flex flex-col gap-3 text-xs sm:text-sm text-[#C4B7A5]">
              <div className="flex items-center justify-between">
                <span>Gujarat, India</span>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    scrollToSection('booking');
                  }}
                  className="text-[#E5BE7A] uppercase tracking-wider font-semibold hover:-translate-y-[1px] active:scale-[0.98] transition-transform"
                >
                  Book a Live Show →
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-white/[0.04] text-xs sm:text-[13px] font-mono">
                <a href="https://wa.me/917798439429" target="_blank" rel="noopener noreferrer" className="text-[#25D366] flex items-center gap-1">
                  <span>WhatsApp: +91 77984 39429</span>
                  <ArrowUpRight className="w-3 h-3" />
                </a>
                <a href="https://www.youtube.com/@SonalMakwana-zb7qc" target="_blank" rel="noopener noreferrer" className="text-[#E5BE7A] flex items-center gap-1">
                  <span>YouTube</span>
                  <ArrowUpRight className="w-3 h-3" />
                </a>
                <a href="https://www.instagram.com/makwanasonal789/" target="_blank" rel="noopener noreferrer" className="text-[#E5BE7A] flex items-center gap-1">
                  <span>Instagram</span>
                  <ArrowUpRight className="w-3 h-3" />
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section 
        id="hero" 
        className="relative min-h-[90vh] flex flex-col justify-center pt-28 md:pt-36 pb-16 px-6 md:px-12 max-w-7xl mx-auto w-full overflow-hidden"
      >
        {/* Sacred Circular Indian Classical Mandala Watermark (6-8% opacity, slowly breathes) */}
        <HeroMandala />

        {/* Central Master Composition: Title, Narrative & Double-Bezel Framed Portrait */}
        <div className="py-6 md:py-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center relative z-10">
          
          {/* Left Column: Artist Title and Introduction */}
          <div className="lg:col-span-7 space-y-6 z-10">

            {/* Grand Artist Title with Trilingual Transitions & Continuous Light Gold Shimmer */}
            <div className="space-y-3">
              <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-[104px] font-normal leading-[0.98] tracking-tight min-h-[2.1em] flex flex-col justify-center overflow-visible">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={NAME_LANGUAGES[currentLangIdx].id}
                    initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -16, filter: "blur(4px)" }}
                    transition={{ duration: 0.6, ease: LUXURY_EASE }}
                    className={`block ${NAME_LANGUAGES[currentLangIdx].fontClass} overflow-visible`}
                  >
                    {/* Top Line: Sonal / સોનલ / सोनल in Big Letters */}
                    <div className="overflow-visible pt-2 pb-1">
                      <span className="block gold-shimmer-text overflow-visible">
                        {NAME_LANGUAGES[currentLangIdx].id === 'en' ? (
                          <>
                            <span id="hero-initial-s" className="inline-block relative">S</span>
                            {NAME_LANGUAGES[currentLangIdx].line1.slice(1)}
                          </>
                        ) : (
                          NAME_LANGUAGES[currentLangIdx].line1
                        )}
                      </span>
                    </div>

                    {/* Bottom Line: Makwana / મકવાણા / मकवाणा in Big Letters */}
                    <div className="overflow-visible pt-1 pb-2">
                      <span className={`block gold-shimmer-text overflow-visible ${NAME_LANGUAGES[currentLangIdx].id === 'en' ? 'italic font-light' : 'font-normal'}`}>
                        {NAME_LANGUAGES[currentLangIdx].line2}
                      </span>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </h1>

              {/* Sub-tagline (reveals at 0.85s) */}
              <motion.p 
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: LUXURY_EASE, delay: 0.85 }}
                className="text-sm sm:text-base uppercase tracking-[0.2em] text-[#E5BE7A] font-light pt-2 will-change-transform"
              >
                A Voice That Brings Every Celebration to Life.
              </motion.p>
            </div>

            {/* Bio Paragraph (reveals at 0.95s) */}
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, ease: LUXURY_EASE, delay: 0.95 }}
              className="text-base sm:text-lg lg:text-xl text-[#D8CDC0] font-light max-w-xl leading-relaxed will-change-transform"
            >
              From peaceful morning bhajans and classical ragas to high-energy Navratri Garba nights, Sonal Makwana brings soul, grace, and heartfelt emotion to every stage she steps on.
            </motion.p>

            {/* Direct Action Buttons - Interactive Last (reveals at 1.35s) */}
            <motion.div 
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: LUXURY_EASE, delay: 1.35 }}
              className="pt-3 flex flex-wrap items-center gap-6 text-xs sm:text-sm uppercase tracking-[0.16em] will-change-transform"
            >
              <button
                onClick={() => scrollToSection('soundscapes')}
                className="group px-7 py-3.5 bg-[#F5EBDD] text-[#090807] font-semibold hover:bg-white hover:-translate-y-[2px] active:scale-[0.98] transition-all duration-300 flex items-center gap-2.5 shadow-lg shadow-black/50"
              >
                <Music className="w-4 h-4 text-[#E5BE7A]" />
                <span>Listen to Music</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-[6px] transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]" />
              </button>

              <button
                onClick={() => scrollToSection('artiste')}
                className="editorial-link text-[#D8CDC0] hover:text-[#F5EBDD] py-2 text-sm sm:text-base tracking-wide transition-colors font-medium"
              >
                About Sonal
              </button>
            </motion.div>
          </div>

          {/* Right Column: Double-Bezel Framed Luxury Portrait (scales 1.03 to 1.0, fades in at 0.6s) */}
          <motion.div 
            style={{ y: heroImageY }}
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.25, ease: LUXURY_EASE, delay: 0.6 }}
            className="lg:col-span-5 relative will-change-transform"
          >
            {/* Outer Architectural Double-Bezel Container */}
            <div className="p-3 bg-[#0E0C0A] border border-[#E5BE7A]/25 shadow-2xl shadow-black relative group luxury-card-hover">
              
              {/* Corner Registration Markings */}
              <div className="absolute top-1 left-1 w-2 h-2 border-t border-l border-[#E5BE7A]/60" />
              <div className="absolute top-1 right-1 w-2 h-2 border-t border-r border-[#E5BE7A]/60" />
              <div className="absolute bottom-1 left-1 w-2 h-2 border-b border-l border-[#E5BE7A]/60" />
              <div className="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-[#E5BE7A]/60" />

              {/* Inner Photographic Frame */}
              <div className="relative aspect-[3/4] overflow-hidden bg-[#14110E] border border-white/10">
                <Image
                  src={siteSettings.heroPortrait?.image || "/sonal-hero-portrait.webp"}
                  alt="Sonal Makwana Official Portrait"
                  fill
                  priority
                  unoptimized
                  sizes="(max-width: 768px) 90vw, (max-width: 1200px) 45vw, 500px"
                  className="object-cover filter contrast-105 brightness-100 group-hover:scale-[1.02] transition-transform duration-700 ease-out will-change-transform"
                  style={{
                    objectPosition: siteSettings.heroPortrait?.objectPosition || "center 20%",
                    transform: `scale(${siteSettings.heroPortrait?.scale || 1}) rotate(${siteSettings.heroPortrait?.rotation || 0}deg)`,
                    transformOrigin: siteSettings.heroPortrait?.objectPosition || "center 20%"
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#090807] via-transparent to-transparent opacity-40 pointer-events-none z-10" />
              </div>
            </div>
          </motion.div>

        </div>

      </section>

      {/* Section 01: About Sonal */}
      <section 
        id="artiste" 
        className="relative py-28 md:py-36 px-6 md:px-12 border-t border-white/[0.08] max-w-7xl mx-auto"
      >
        <LuxuryReveal>
          <div className="flex items-center gap-3 text-xs sm:text-[13px] uppercase tracking-[0.25em] text-[#E5BE7A] font-medium mb-4">
            <span className="font-mono text-sm">[01]</span>
            <span>About Sonal</span>
          </div>
        </LuxuryReveal>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Narrative Column */}
          <div className="lg:col-span-7 space-y-8">
            <LuxuryReveal delay={0.06}>
              <h2 className="font-serif-luxury text-4xl sm:text-5xl md:text-6xl font-light text-[#F5EBDD] leading-tight">
                Singing from the heart, <span className="italic text-[#E5BE7A]">guided by timeless tradition.</span>
              </h2>
            </LuxuryReveal>

            <LuxuryReveal delay={0.12}>
              <div className="space-y-6 text-[#D8CDC0] text-base sm:text-lg font-light leading-relaxed">
                <p className="first-letter:font-serif-luxury first-letter:text-6xl first-letter:text-[#F5EBDD] first-letter:float-left first-letter:mr-3 first-letter:leading-none">
                  Trained in the timeless discipline of Indian classical music, Sonal Makwana has spent years honing her voice through daily riyaz. Her singing carries the depth and purity of traditional ragas, while connecting warmly with listeners across generations.
                </p>
                
                <p>
                  Whether she is singing a peaceful devotional bhajan at dawn or leading thousands of people in joyous Garba circles on festival nights, her voice remains melodious, heartfelt, and full of life. For Sonal, music is not just a performance—it is a way to bring people together in prayer and happiness.
                </p>
              </div>
            </LuxuryReveal>

            {/* Pull Quote Card with Double-Bezel and Gold Accent */}
            <LuxuryReveal delay={0.18}>
              <div className="luxury-card luxury-card-hover p-6 sm:p-7 border-l-2 border-l-[#E5BE7A] space-y-3.5">
                <blockquote className="font-serif-luxury text-xl sm:text-2xl text-[#F5EBDD] italic font-light leading-snug">
                  &ldquo;When music comes from a devoted heart, it reaches straight to the listener&apos;s soul.&rdquo;
                </blockquote>
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.16em] text-[#A39888] pt-2.5 border-t border-white/[0.06]">
                  <span className="text-[#E5BE7A] font-medium">— Sonal Makwana</span>
                  <span>Artiste Philosophy</span>
                </div>
              </div>
            </LuxuryReveal>
          </div>

          {/* Right Photographic Stack */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* Framed Riyaz Photo */}
            <LuxuryReveal delay={0.1}>
              <div className="luxury-card luxury-card-hover p-3">
                <div className="relative aspect-[4/5] overflow-hidden bg-[#14110E]">
                  <Image
                    src={siteSettings.riyazPhoto?.image || "/sonal-riyaz-academy.webp"}
                    alt="Sonal Makwana Sangeet Academy Performance"
                    fill
                    loading="lazy"
                    unoptimized
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 40vw, 450px"
                    className="object-cover filter contrast-105 brightness-95 group-hover:scale-[1.02] transition-transform duration-700 ease-out will-change-transform"
                    style={{
                      objectPosition: siteSettings.riyazPhoto?.objectPosition || "center 20%",
                      transform: `scale(${siteSettings.riyazPhoto?.scale || 1}) rotate(${siteSettings.riyazPhoto?.rotation || 0}deg)`,
                      transformOrigin: siteSettings.riyazPhoto?.objectPosition || "center 20%"
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B0705] via-transparent to-transparent opacity-60 pointer-events-none z-10" />
                </div>
                <div className="flex items-baseline justify-between text-xs sm:text-[13px] text-[#A39888] px-2 pt-3 pb-1">
                  <span className="uppercase tracking-[0.18em] text-xs">{siteSettings.riyazPhoto?.title || "Musical Journey & Practice"}</span>
                  <span className="font-mono text-xs sm:text-[13px] text-[#E5BE7A]">{siteSettings.riyazPhoto?.subtitle || "Classical Riyaz"}</span>
                </div>
              </div>
            </LuxuryReveal>

          </div>

        </div>

        {/* Dedicated "Artist Profile" Subsection (Artiste Dossier) */}
        <div className="mt-14 sm:mt-16 pt-10 sm:pt-12 border-t border-white/[0.08]">
          <LuxuryReveal delay={0.08}>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
              <div>
                <div className="flex items-center gap-3 text-xs sm:text-[13px] uppercase tracking-[0.25em] text-[#E5BE7A] font-medium mb-2.5">
                  <span className="font-mono text-sm">[01.1]</span>
                  <span>Artiste Dossier</span>
                </div>
                <h3 className="font-serif-luxury text-3xl sm:text-4xl text-[#F5EBDD] font-light">
                  Artist Profile
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-[#A39888] font-light tracking-wide max-w-sm">
                Official artistic specifications, repertoire specializations & performance credentials.
              </p>
            </div>
          </LuxuryReveal>

          <LuxuryReveal delay={0.14}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              
              {/* Card 1: Born */}
              <div className="luxury-card luxury-card-hover p-5 sm:p-6 space-y-3 relative group">
                <div className="absolute top-1.5 right-1.5 w-2 h-2 border-t border-r border-[#E5BE7A]/40" />
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#E5BE7A] font-medium">Born</span>
                  <span className="font-mono text-[11px] text-[#8C8072]/70">01</span>
                </div>
                <div className="font-serif-luxury text-xl sm:text-2xl text-[#F5EBDD] font-normal leading-snug">
                  15 January 1986
                </div>
                <p className="text-xs sm:text-[13px] text-[#A39888] font-light pt-2.5 border-t border-white/[0.06]">
                  Vocalist & Cultural Artiste
                </p>
              </div>

              {/* Card 2: Started Singing */}
              <div className="luxury-card luxury-card-hover p-5 sm:p-6 space-y-3 relative group">
                <div className="absolute top-1.5 right-1.5 w-2 h-2 border-t border-r border-[#E5BE7A]/40" />
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#E5BE7A] font-medium">Started Singing</span>
                  <span className="font-mono text-[11px] text-[#8C8072]/70">02</span>
                </div>
                <div className="font-serif-luxury text-xl sm:text-2xl text-[#F5EBDD] font-normal leading-snug">
                  Mid 2015
                </div>
                <p className="text-xs sm:text-[13px] text-[#A39888] font-light pt-2.5 border-t border-white/[0.06]">
                  Over a decade of active riyaz & stage presence
                </p>
              </div>

              {/* Card 3: Height */}
              <div className="luxury-card luxury-card-hover p-5 sm:p-6 space-y-3 relative group">
                <div className="absolute top-1.5 right-1.5 w-2 h-2 border-t border-r border-[#E5BE7A]/40" />
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#E5BE7A] font-medium">Height</span>
                  <span className="font-mono text-[11px] text-[#8C8072]/70">03</span>
                </div>
                <div className="font-serif-luxury text-xl sm:text-2xl text-[#F5EBDD] font-normal leading-snug">
                  5&apos;6&quot;
                </div>
                <p className="text-xs sm:text-[13px] text-[#A39888] font-light pt-2.5 border-t border-white/[0.06]">
                  Stage presence & graceful stature
                </p>
              </div>

              {/* Card 4: Based In */}
              <div className="luxury-card luxury-card-hover p-5 sm:p-6 space-y-3 relative group">
                <div className="absolute top-1.5 right-1.5 w-2 h-2 border-t border-r border-[#E5BE7A]/40" />
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#E5BE7A] font-medium">Based In</span>
                  <span className="font-mono text-[11px] text-[#8C8072]/70">04</span>
                </div>
                <div className="font-serif-luxury text-xl sm:text-2xl text-[#F5EBDD] font-normal leading-snug">
                  Ahmedabad, Gujarat
                </div>
                <p className="text-xs sm:text-[13px] text-[#A39888] font-light pt-2.5 border-t border-white/[0.06]">
                  Available for shows across India & overseas
                </p>
              </div>

              {/* Card 5: Specializes In */}
              <div className="luxury-card luxury-card-hover p-5 sm:p-6 space-y-3 relative group">
                <div className="absolute top-1.5 right-1.5 w-2 h-2 border-t border-r border-[#E5BE7A]/40" />
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#E5BE7A] font-medium">Specializes In</span>
                  <span className="font-mono text-[11px] text-[#8C8072]/70">05</span>
                </div>
                <div className="font-serif-luxury text-lg sm:text-xl text-[#F5EBDD] font-normal leading-snug">
                  Classical <span className="text-[#E5BE7A] mx-1">•</span> Devotional <span className="text-[#E5BE7A] mx-1">•</span> Gujarati Garba <span className="text-[#E5BE7A] mx-1">•</span> Bollywood
                </div>
                <p className="text-xs sm:text-[13px] text-[#A39888] font-light pt-2.5 border-t border-white/[0.06]">
                  Traditional ragas, devotional bhajans & high-energy folk
                </p>
              </div>

              {/* Card 6: Performance Style */}
              <div className="luxury-card luxury-card-hover p-5 sm:p-6 space-y-3 relative group">
                <div className="absolute top-1.5 right-1.5 w-2 h-2 border-t border-r border-[#E5BE7A]/40" />
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#E5BE7A] font-medium">Performance Style</span>
                  <span className="font-mono text-[11px] text-[#8C8072]/70">06</span>
                </div>
                <div className="font-serif-luxury text-lg sm:text-xl text-[#F5EBDD] font-normal leading-snug">
                  Live Stage & Cultural Events
                </div>
                <p className="text-xs sm:text-[13px] text-[#A39888] font-light pt-2.5 border-t border-white/[0.06]">
                  Acoustic depth & dynamic audience resonance
                </p>
              </div>

              {/* Card 7: Languages */}
              <div className="luxury-card luxury-card-hover p-5 sm:p-6 space-y-3 relative group">
                <div className="absolute top-1.5 right-1.5 w-2 h-2 border-t border-r border-[#E5BE7A]/40" />
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#E5BE7A] font-medium">Languages</span>
                  <span className="font-mono text-[11px] text-[#8C8072]/70">07</span>
                </div>
                <div className="font-serif-luxury text-xl sm:text-2xl text-[#F5EBDD] font-normal leading-snug">
                  Gujarati <span className="text-[#E5BE7A] mx-1">•</span> Hindi
                </div>
                <p className="text-xs sm:text-[13px] text-[#A39888] font-light pt-2.5 border-t border-white/[0.06]">
                  Fluent lyrical expression & devotional poetry
                </p>
              </div>

              {/* Card 8: Live Performances */}
              <div className="luxury-card luxury-card-hover p-5 sm:p-6 space-y-3 relative group">
                <div className="absolute top-1.5 right-1.5 w-2 h-2 border-t border-r border-[#E5BE7A]/40" />
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#E5BE7A] font-medium">Live Performances</span>
                  <span className="font-mono text-[11px] text-[#8C8072]/70">08</span>
                </div>
                <div className="font-serif-luxury text-lg sm:text-xl text-[#F5EBDD] font-normal leading-snug">
                  Weddings <span className="text-[#E5BE7A] mx-1">•</span> Navratri <span className="text-[#E5BE7A] mx-1">•</span> Bhajan Sandhya <span className="text-[#E5BE7A] mx-1">•</span> Stage Shows
                </div>
                <p className="text-xs sm:text-[13px] text-[#A39888] font-light pt-2.5 border-t border-white/[0.06]">
                  Curated sets for grand celebrations & intimate baithaks
                </p>
              </div>

            </div>
          </LuxuryReveal>
        </div>
      </section>

      {/* Section 02: Music */}
      <section 
        id="soundscapes" 
        className="relative py-28 md:py-36 px-6 md:px-12 border-t border-white/[0.08] max-w-7xl mx-auto"
      >
        <LuxuryReveal>
          <div className="flex items-center gap-3 text-xs sm:text-[13px] uppercase tracking-[0.25em] text-[#E5BE7A] font-medium mb-4">
            <span className="font-mono text-sm">[02]</span>
            <span>Music</span>
          </div>

          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-6 pb-10 border-b border-white/[0.08]">
            <div>
              <h2 className="font-serif-luxury text-4xl sm:text-5xl font-light text-[#F5EBDD]">
                Featured Song
              </h2>
              <p className="text-xs sm:text-sm uppercase tracking-[0.16em] text-[#C4B7A5] mt-1 font-light">
                Listen to Sonal's voice
              </p>
            </div>
            <div className="text-xs sm:text-sm text-[#C4B7A5] max-w-md font-light leading-relaxed">
              Experience the devotional warmth, melody, and spiritual purity in Sonal Makwana's rendition.
            </div>
          </div>
        </LuxuryReveal>

        {/* Centered Luxury Master Deck (No Tracklist) */}
        <div className="mt-12 max-w-xl mx-auto">
          <LuxuryReveal delay={0.08}>
            <div className="luxury-card luxury-card-hover p-8 sm:p-10 space-y-8 relative overflow-hidden">
              {/* Top Deck Info */}
              <div className="flex items-center justify-between text-xs sm:text-[13px] font-mono border-b border-white/[0.08] pb-4">
                <span className="text-[#E5BE7A] uppercase tracking-wider font-medium">
                  Featured Devotional Song
                </span>
                <span className="text-[#E5BE7A] px-3 py-1 border border-[#E5BE7A]/30 text-xs font-mono bg-[#E5BE7A]/5 font-medium">
                  Bhakti Sangeet
                </span>
              </div>

              {/* Vinyl Disc & Rotating Visualizer */}
              <div className="text-center space-y-6 py-4">
                <div className="relative w-44 h-44 mx-auto flex items-center justify-center">
                  
                  {/* Vinyl Ring Simulation */}
                  <div 
                    className={`w-44 h-44 rounded-full border-2 border-white/10 p-1 flex items-center justify-center bg-gradient-to-tr from-[#14110E] via-[#231E18] to-[#14110E] shadow-2xl ${
                      isPlayingTrack ? 'animate-spin' : ''
                    }`}
                    style={{ animationDuration: '6s' }}
                  >
                    <div className="w-32 h-32 rounded-full border border-white/10 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-[#E5BE7A]/20 border border-[#E5BE7A]/40 flex items-center justify-center text-[11px] font-mono text-[#E5BE7A] tracking-widest font-bold">
                        SM AUDIO
                      </div>
                    </div>
                  </div>

                  {/* Central Play/Pause Action Button */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button
                      onClick={toggleAudioPlayback}
                      className="w-14 h-14 bg-[#E5BE7A] text-[#090807] rounded-full flex items-center justify-center hover:bg-white hover:scale-105 active:scale-[0.98] transition-all duration-300 shadow-2xl shadow-black/90 focus:outline-none z-10"
                      aria-label={isPlayingTrack ? "Pause Ram Aayenge" : "Play Ram Aayenge"}
                    >
                      {isPlayingTrack ? (
                        <Pause className="w-6 h-6 fill-current" />
                      ) : (
                        <Play className="w-6 h-6 fill-current ml-0.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Title & Metadata */}
                <div className="space-y-2">
                  <h3 className="font-serif-luxury text-3xl sm:text-4xl text-[#F5EBDD] font-normal tracking-wide">
                    {siteSettings.featuredSong?.title || "Ram Aayenge"}
                  </h3>
                  <div className="text-xs sm:text-sm tracking-widest text-[#E5BE7A] uppercase font-medium">
                    Sonal Makwana
                  </div>
                  <div className="text-xs sm:text-[13px] text-[#A39888] font-mono">
                    {siteSettings.featuredSong?.raag || "Devotional Bhajan · Bhakti Rasa"}
                  </div>
                </div>
              </div>

              {/* Progress Bar & Timing */}
              <div className="space-y-2 pt-2">
                <div className="w-full h-1.5 bg-white/10 overflow-hidden relative">
                  <div 
                    className="h-full bg-gradient-to-r from-[#C89B56] to-[#E5BE7A] transition-all duration-300"
                    style={{ width: `${audioProgress}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs font-mono text-[#A39888]">
                  <span className="flex items-center gap-1.5">
                    {isPlayingTrack && (
                      <span className="w-2 h-2 rounded-full bg-[#E5BE7A] animate-ping inline-block" />
                    )}
                    {isPlayingTrack ? 'Playing Audio' : 'Ready'}
                  </span>
                  <span>03:48</span>
                </div>
              </div>

              {/* Narrative Explanation */}
              <p className="text-xs sm:text-sm text-[#D8CDC0] font-light leading-relaxed border-t border-white/[0.08] pt-4 text-center">
                {siteSettings.featuredSong?.subtitle || "A soulful devotional rendition sung with deep emotion, classical grace, and devotion by Sonal Makwana."}
              </p>

              {/* Tanpura Drone Control Button */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={toggleTanpuraAura}
                  className="flex items-center gap-2 text-xs sm:text-sm text-[#E5BE7A] hover:text-white hover:-translate-y-[1px] active:scale-[0.98] transition-all duration-300 font-medium"
                >
                  <Sliders className="w-4 h-4" />
                  <span>{auraActive ? 'Mute Tanpura Drone' : 'Play Tanpura Drone'}</span>
                </button>
                <span className="text-xs font-mono text-[#A39888]">Acoustic Swar</span>
              </div>
            </div>
          </LuxuryReveal>
        </div>
      </section>

      {/* Section 03: Four Musical Styles */}
      <section 
        id="repertoire" 
        className="relative py-28 md:py-36 px-6 md:px-12 border-t border-white/[0.08] max-w-7xl mx-auto"
      >
        <LuxuryReveal>
          <div className="flex items-center gap-3 text-xs sm:text-[13px] uppercase tracking-[0.25em] text-[#E5BE7A] font-medium mb-4">
            <span className="font-mono text-sm">[03]</span>
            <span>Four Musical Styles</span>
          </div>

          <div className="max-w-3xl space-y-3 mb-14">
            <h2 className="font-serif-luxury text-4xl sm:text-5xl font-light text-[#F5EBDD]">
              Music for Every Celebration
            </h2>
            <p className="text-sm sm:text-base text-[#D8CDC0] font-light leading-relaxed">
              From traditional family gatherings to energetic festival grounds, Sonal brings the right emotion, rhythm, and melody to make every event unforgettable.
            </p>
          </div>
        </LuxuryReveal>

        {/* 2x2 Clean Double-Bezel Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {REPERTOIRE_PILLARS.map((pillar, idx) => (
            <LuxuryReveal key={pillar.id} delay={idx * 0.08}>
              <div 
                className="luxury-card luxury-card-hover p-8 sm:p-10 space-y-6 group h-full flex flex-col justify-between"
              >
                <div className="space-y-6">
                  {/* Pillar Top Meta */}
                  <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
                    <span className="font-mono text-xs sm:text-[13px] text-[#E5BE7A] font-medium">
                      STYLE [{pillar.id}]
                    </span>
                    <span className="text-xs uppercase tracking-[0.16em] px-3 py-1 border border-[#E5BE7A]/30 text-[#E5BE7A] font-medium">
                      {pillar.tag}
                    </span>
                  </div>

                  {/* Title & Tradition */}
                  <div className="space-y-1.5">
                    <h3 className="font-serif-luxury text-2xl sm:text-3xl text-[#F5EBDD] font-normal group-hover:text-white transition-colors">
                      {pillar.title}
                    </h3>
                    <span className="text-xs sm:text-sm uppercase tracking-[0.18em] text-[#E5BE7A] block font-medium">
                      {pillar.tradition}
                    </span>
                  </div>

                  {/* Narrative */}
                  <p className="text-sm sm:text-base text-[#D8CDC0] font-light leading-relaxed">
                    {pillar.narrative}
                  </p>
                </div>

                {/* Footer Accent Metric */}
                <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs sm:text-sm text-[#A39888] font-mono">
                  <span>{pillar.accent}</span>
                  <span className="text-[#E5BE7A] group-hover:translate-x-[6px] transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]">→</span>
                </div>
              </div>
            </LuxuryReveal>
          ))}
        </div>
      </section>

      {/* Section 04: Live Performances */}
      <section 
        id="concerts" 
        className="relative py-28 md:py-36 px-6 md:px-12 border-t border-white/[0.08] max-w-7xl mx-auto overflow-hidden"
      >
        <LuxuryReveal>
          <div className="flex items-center gap-3 text-xs sm:text-[13px] uppercase tracking-[0.25em] text-[#E5BE7A] font-medium mb-4">
            <span className="font-mono text-sm">[04]</span>
            <span>Live Performances</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-6 pb-10 border-b border-white/[0.08]">
            <div>
              <h2 className="font-serif-luxury text-4xl sm:text-5xl font-light text-[#F5EBDD]">
                {siteSettings.livePerformance?.title || "The Magic of Live Music"}
              </h2>
              <p className="text-xs sm:text-sm uppercase tracking-[0.16em] text-[#C4B7A5] mt-1 font-light">
                {siteSettings.livePerformance?.subtitle || "Glimpses from stage shows and festival evenings"}
              </p>
            </div>
            <div className="text-xs sm:text-sm text-[#C4B7A5] max-w-md font-light leading-relaxed">
              {siteSettings.livePerformance?.description || "Experience the energy, warmth, and joy that Sonal brings to every live stage performance."}
            </div>
          </div>
        </LuxuryReveal>

        {/* Featured Video Frame with Letterbox Aspect */}
        <LuxuryReveal delay={0.1}>
          <div 
            onClick={openVideoModal}
            className="mt-12 luxury-card luxury-card-hover p-2.5 cursor-pointer group relative overflow-hidden active:scale-[0.98]"
          >
            <div className="relative aspect-[21/9] w-full overflow-hidden bg-[#14110E]">
              <Image
                src={siteSettings.livePerformance?.thumbnail?.replace(/\.(png|jpg)$/i, '.webp') || "/sonal-concert-stage.webp"}
                alt="Sonal Makwana Live Concert Showcase"
                fill
                loading="lazy"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
                className="object-cover filter contrast-110 brightness-85 group-hover:scale-[1.01] transition-transform duration-700 will-change-transform"
              />
              
              {/* Center Play Reel Button */}
              <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 bg-[#F5EBDD] text-[#090807] rounded-full flex items-center justify-center group-hover:scale-105 transition-transform duration-300 shadow-2xl">
                  <Play className="w-6 h-6 fill-current ml-0.5 text-[#C89B56]" />
                </div>
                <span className="text-xs sm:text-sm uppercase tracking-[0.2em] text-[#F5EBDD] mt-4 font-medium">
                  Watch Live Performance Video
                </span>
                <span className="text-xs text-[#E5BE7A] font-mono mt-1 font-medium">
                  Live Stage Glimpse · Sonal Makwana
                </span>
              </div>

              {/* Bottom Meta Overlay */}
              <div className="absolute bottom-4 left-6 right-6 hidden sm:flex items-baseline justify-between text-xs uppercase tracking-[0.16em] text-white/90 font-mono bg-black/70 backdrop-blur-sm px-4 py-2.5 border border-white/10">
                <span>Traditional Musical Ensemble</span>
                <span className="text-[#E5BE7A] font-medium">Sonal Makwana Live in Concert</span>
              </div>
            </div>
          </div>
        </LuxuryReveal>
      </section>

      {/* Section 05: Gallery */}
      <section 
        id="archive" 
        className="relative py-28 md:py-36 px-6 md:px-12 border-t border-white/[0.08] max-w-7xl mx-auto"
      >
        <LuxuryReveal>
          <div className="flex items-center gap-3 text-xs sm:text-[13px] uppercase tracking-[0.25em] text-[#E5BE7A] font-medium mb-4">
            <span className="font-mono text-sm">[05]</span>
            <span>Gallery</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-6 pb-12 border-b border-white/[0.08]">
            <div>
              <h2 className="font-serif-luxury text-4xl sm:text-5xl font-light text-[#F5EBDD]">
                Moments on Stage
              </h2>
              <p className="text-xs sm:text-sm uppercase tracking-[0.16em] text-[#C4B7A5] mt-1 font-light">
                Glimpses from concerts, festivals, and celebrations
              </p>
            </div>
            <div className="text-xs sm:text-sm text-[#C4B7A5] font-mono uppercase tracking-wider hidden sm:block">
              Interactive 3D Stage Showcase
            </div>
          </div>
        </LuxuryReveal>

        {/* 3D Stacked Circular Stage Carousel */}
        <div className="mt-12">
          <CircularTestimonials
            testimonials={stageMoments}
            autoplay={true}
            onImageClick={(idx) => setActiveLightboxIndex(idx)}
            colors={{
              name: "#F5EBDD",
              designation: "#E5BE7A",
              testimony: "#C4B7A5",
              arrowBackground: "#14110E",
              arrowForeground: "#E5BE7A",
              arrowHoverBackground: "#E5BE7A",
            }}
          />
        </div>
      </section>

      {/* Section 06: Book a Live Show */}
      <section 
        id="booking" 
        className="relative py-28 md:py-36 px-6 md:px-12 border-t border-white/[0.08] max-w-7xl mx-auto"
      >
        <LuxuryReveal>
          <div className="flex items-center gap-3 text-xs sm:text-[13px] uppercase tracking-[0.25em] text-[#E5BE7A] font-medium mb-4">
            <span className="font-mono text-sm">[06]</span>
            <span>Book a Live Show</span>
          </div>
        </LuxuryReveal>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Narrative Column */}
          <div className="lg:col-span-5 space-y-6">
            <LuxuryReveal delay={0.06}>
              <h2 className="font-serif-luxury text-4xl sm:text-5xl font-light text-[#F5EBDD] leading-tight">
                Invite Sonal to Sing at Your Event.
              </h2>
              <p className="text-sm sm:text-base text-[#D8CDC0] font-light leading-relaxed">
                Now accepting bookings for weddings, family sangeet nights, Navratri festival celebrations, and devotional satsangs.
              </p>
            </LuxuryReveal>

            <LuxuryReveal delay={0.12}>
              <div className="luxury-card luxury-card-hover p-6 sm:p-7 space-y-5 text-xs text-[#8C8072]">
                <div className="space-y-1">
                  <span className="block text-xs sm:text-[13px] uppercase tracking-[0.16em] text-[#E5BE7A] font-medium">Direct Calls & WhatsApp</span>
                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <a 
                      href="tel:+917798439429" 
                      className="inline-flex items-center gap-2 text-[#F5EBDD] font-mono text-base sm:text-lg hover:text-[#E5BE7A] transition-colors"
                      title="Direct Call"
                    >
                      <span>+91 77984 39429</span>
                    </a>
                    <span className="text-white/20">|</span>
                    <a 
                      href="https://wa.me/917798439429" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1 border border-[#25D366]/40 text-[#25D366] text-xs font-mono uppercase tracking-wider rounded hover:bg-[#25D366]/10 transition-colors font-medium"
                      title="Chat directly on WhatsApp"
                    >
                      <span>WhatsApp</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="block text-xs sm:text-[13px] uppercase tracking-[0.16em] text-[#E5BE7A] font-medium">Email Address</span>
                  <a 
                    href="mailto:sonalmehul15@gmail.com" 
                    className="text-[#F5EBDD] text-sm sm:text-base hover:text-[#E5BE7A] transition-colors block font-mono"
                  >
                    sonalmehul15@gmail.com
                  </a>
                </div>

                <div className="space-y-1.5 pt-1 border-t border-white/[0.08]">
                  <span className="block text-xs sm:text-[13px] uppercase tracking-[0.16em] text-[#E5BE7A] font-medium">Official Social Media</span>
                  <div className="flex flex-wrap items-center gap-4 pt-1">
                    <a
                      href="https://www.youtube.com/@SonalMakwana-zb7qc"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-[#D8CDC0] hover:text-[#F5EBDD] transition-colors editorial-link font-medium"
                    >
                      <span>YouTube Channel</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-[#E5BE7A]" />
                    </a>
                    <a
                      href="https://www.instagram.com/makwanasonal789/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-[#D8CDC0] hover:text-[#F5EBDD] transition-colors editorial-link font-medium"
                    >
                      <span>Instagram (@makwanasonal789)</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-[#E5BE7A]" />
                    </a>
                  </div>
                </div>

                <div className="text-xs sm:text-[13px] text-[#E5BE7A] pt-2 border-t border-white/[0.08] flex items-center gap-2 font-medium">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>Prompt response for event planners, temple committees, and family hosts.</span>
                </div>
              </div>
            </LuxuryReveal>
          </div>

          {/* Right Booking Form */}
          <div className="lg:col-span-7">
            <LuxuryReveal delay={0.1}>
              <div className="luxury-card luxury-card-hover p-8 sm:p-12">
                {formSubmitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, ease: LUXURY_EASE }}
                    className="py-10 space-y-5 text-center"
                  >
                    <div className="w-12 h-12 border border-[#E5BE7A] rounded-full flex items-center justify-center mx-auto text-[#E5BE7A] bg-[#14110E]">
                      <Check className="w-5 h-5" />
                    </div>
                    
                    <div className="space-y-1">
                      <h3 className="font-serif-luxury text-3xl text-[#F5EBDD]">
                        Inquiry Received
                      </h3>
                      <p className="text-xs sm:text-sm uppercase tracking-wider text-[#E5BE7A] font-mono font-medium">
                        Reference ID: {inquiryCode}
                      </p>
                    </div>

                    <p className="text-sm text-[#D8CDC0] max-w-md mx-auto leading-relaxed">
                      Thank you, <span className="text-[#F5EBDD] font-medium">{formData.name}</span>. We will check availability for your event date ({formData.eventDate || 'Upcoming Date'}) and respond promptly within 24 hours.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-4 pt-3">
                      <a
                        href={`https://wa.me/917798439429?text=${encodeURIComponent(
                          `Hello Sonal Makwana, I submitted a booking inquiry ${inquiryCode} for ${formData.eventType} on ${formData.eventDate || 'Upcoming Date'}. Name: ${formData.name}.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 border border-[#25D366]/50 bg-[#25D366]/10 text-[#25D366] text-xs sm:text-sm font-mono uppercase tracking-wider rounded hover:bg-[#25D366]/20 hover:-translate-y-[1px] active:scale-[0.98] transition-all font-medium"
                      >
                        <span>Direct WhatsApp (+91 77984 39429)</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </a>

                      <button
                        onClick={() => setFormSubmitted(false)}
                        className="text-xs sm:text-sm uppercase tracking-wider text-[#E5BE7A] hover:text-white transition-colors editorial-link py-2 font-medium"
                      >
                        Submit Another Inquiry
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <form onSubmit={handleBookingSubmit} className="space-y-6">
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs sm:text-[13px] uppercase tracking-[0.16em] text-[#C4B7A5] font-medium block">
                          Your Name / Organizer *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Rajesh Patel / Shree Ram Samiti"
                          value={formData.name}
                          onChange={e => setFormData({ ...formData, name: e.target.value })}
                          className="w-full bg-[#14110E] border border-white/15 focus:border-[#E5BE7A] p-3.5 text-sm sm:text-base text-[#F5EBDD] placeholder:text-white/40 focus:outline-none transition-colors"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs sm:text-[13px] uppercase tracking-[0.16em] text-[#C4B7A5] font-medium block">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="yourname@gmail.com"
                          value={formData.email}
                          onChange={e => setFormData({ ...formData, email: e.target.value })}
                          className="w-full bg-[#14110E] border border-white/15 focus:border-[#E5BE7A] p-3.5 text-sm sm:text-base text-[#F5EBDD] placeholder:text-white/40 focus:outline-none transition-colors"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs sm:text-[13px] uppercase tracking-[0.16em] text-[#C4B7A5] font-medium block">
                          WhatsApp / Phone Number *
                        </label>
                        <input
                          type="tel"
                          required
                          placeholder="e.g. +91 98765 43210"
                          value={formData.phone}
                          onChange={e => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full bg-[#14110E] border border-white/15 focus:border-[#E5BE7A] p-3.5 text-sm sm:text-base text-[#F5EBDD] placeholder:text-white/40 focus:outline-none transition-colors"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs sm:text-[13px] uppercase tracking-[0.16em] text-[#C4B7A5] font-medium block">
                          Event Type *
                        </label>
                        <select
                          value={formData.eventType}
                          onChange={e => setFormData({ ...formData, eventType: e.target.value })}
                          className="w-full bg-[#14110E] border border-white/15 focus:border-[#E5BE7A] p-3.5 text-sm sm:text-base text-[#F5EBDD] focus:outline-none transition-colors"
                        >
                          <option value="Wedding & Sangeet">Wedding & Sangeet Celebration</option>
                          <option value="Navratri & Raas Garba">Navratri & Raas Garba</option>
                          <option value="Devotional Bhajan & Santvani">Devotional Bhajan & Santvani</option>
                          <option value="Classical & Semi-Classical Baithak">Classical & Semi-Classical Baithak</option>
                          <option value="Cultural & Community Event">Cultural & Community Event</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs sm:text-[13px] uppercase tracking-[0.16em] text-[#C4B7A5] font-medium block">
                          Event Date
                        </label>
                        <input
                          type="date"
                          value={formData.eventDate}
                          onChange={e => setFormData({ ...formData, eventDate: e.target.value })}
                          className="w-full bg-[#14110E] border border-white/15 focus:border-[#E5BE7A] p-3.5 text-sm sm:text-base text-[#F5EBDD] focus:outline-none transition-colors"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs sm:text-[13px] uppercase tracking-[0.16em] text-[#C4B7A5] font-medium block">
                          City / Venue Location
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Ahmedabad, Surat, Rajkot, Mumbai"
                          value={formData.location}
                          onChange={e => setFormData({ ...formData, location: e.target.value })}
                          className="w-full bg-[#14110E] border border-white/15 focus:border-[#E5BE7A] p-3.5 text-sm sm:text-base text-[#F5EBDD] placeholder:text-white/40 focus:outline-none transition-colors"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs sm:text-[13px] uppercase tracking-[0.16em] text-[#C4B7A5] font-medium block">
                        Event Details & Preferred Songs
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Tell us about your event, timing, or any specific songs you would like Sonal to sing..."
                        value={formData.notes}
                        onChange={e => setFormData({ ...formData, notes: e.target.value })}
                        className="w-full bg-[#14110E] border border-white/15 focus:border-[#E5BE7A] p-3.5 text-sm sm:text-base text-[#F5EBDD] placeholder:text-white/40 focus:outline-none transition-colors resize-none"
                      />
                    </div>

                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <span className="text-xs sm:text-sm text-[#A39888] text-center sm:text-left">
                        We usually respond within 24 hours.
                      </span>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full sm:w-auto px-9 py-4 bg-gradient-to-r from-[#E5BE7A] to-[#C89B56] text-[#090807] text-xs sm:text-sm uppercase tracking-[0.16em] font-semibold hover:brightness-110 hover:-translate-y-[2px] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2.5 disabled:opacity-50 shadow-md shadow-[#E5BE7A]/10"
                      >
                        <span>{isSubmitting ? 'Sending...' : 'Send Booking Inquiry'}</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-[6px] transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]" />
                      </button>
                    </div>

                  </form>
                )}
              </div>
            </LuxuryReveal>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="relative w-full border-t border-white/[0.08] overflow-hidden pt-20 pb-12">
        {/* Monumental Watermark Sliding Left Slowly Behind Footer Elements */}
        <div className="absolute inset-0 flex items-center pointer-events-none select-none overflow-hidden -z-0">
          <motion.div
            initial={{ x: "0%" }}
            animate={{ x: "-50%" }}
            transition={{
              duration: 40,
              repeat: Infinity,
              ease: "linear",
            }}
            className="flex items-center whitespace-nowrap will-change-transform"
          >
            <div className="flex items-center shrink-0">
              <span className="font-serif-luxury text-[32vw] sm:text-[22vw] lg:text-[18vw] font-normal tracking-[0.06em] uppercase leading-none text-transparent bg-clip-text bg-gradient-to-b from-[#F5EBDD]/[0.07] via-[#E5BE7A]/[0.04] to-transparent pr-12 sm:pr-24">
                SONAL MAKWANA
              </span>
              <span className="font-serif-luxury text-[32vw] sm:text-[22vw] lg:text-[18vw] font-normal tracking-[0.06em] uppercase leading-none text-transparent bg-clip-text bg-gradient-to-b from-[#F5EBDD]/[0.07] via-[#E5BE7A]/[0.04] to-transparent pr-12 sm:pr-24">
                SONAL MAKWANA
              </span>
            </div>
            <div className="flex items-center shrink-0">
              <span className="font-serif-luxury text-[32vw] sm:text-[22vw] lg:text-[18vw] font-normal tracking-[0.06em] uppercase leading-none text-transparent bg-clip-text bg-gradient-to-b from-[#F5EBDD]/[0.07] via-[#E5BE7A]/[0.04] to-transparent pr-12 sm:pr-24">
                SONAL MAKWANA
              </span>
              <span className="font-serif-luxury text-[32vw] sm:text-[22vw] lg:text-[18vw] font-normal tracking-[0.06em] uppercase leading-none text-transparent bg-clip-text bg-gradient-to-b from-[#F5EBDD]/[0.07] via-[#E5BE7A]/[0.04] to-transparent pr-12 sm:pr-24">
                SONAL MAKWANA
              </span>
            </div>
          </motion.div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row items-baseline justify-between gap-8 pb-12">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-serif-luxury text-3xl sm:text-4xl text-[#F5EBDD]">Sonal Makwana</span>
              </div>
              <span className="text-xs sm:text-[13px] uppercase tracking-[0.2em] text-[#A39888] block">
                A Voice That Brings Every Celebration to Life · Gujarat, India
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-6 sm:gap-8 text-xs sm:text-sm text-[#C4B7A5] uppercase tracking-wider font-normal">
              <button onClick={() => scrollToSection('artiste')} className="hover:text-white hover:-translate-y-[1px] active:scale-[0.98] transition-all">About</button>
              <button onClick={() => scrollToSection('soundscapes')} className="hover:text-white hover:-translate-y-[1px] active:scale-[0.98] transition-all">Music</button>
              <button onClick={() => scrollToSection('repertoire')} className="hover:text-white hover:-translate-y-[1px] active:scale-[0.98] transition-all">Styles</button>
              <button onClick={() => scrollToSection('concerts')} className="hover:text-white hover:-translate-y-[1px] active:scale-[0.98] transition-all">Live</button>
              <button onClick={() => scrollToSection('archive')} className="hover:text-white hover:-translate-y-[1px] active:scale-[0.98] transition-all">Gallery</button>
              <button onClick={() => scrollToSection('booking')} className="hover:text-white hover:-translate-y-[1px] active:scale-[0.98] transition-all">Book Show</button>
              <span className="hidden lg:inline text-white/20">|</span>
              <a 
                href="https://www.youtube.com/@SonalMakwana-zb7qc" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-[#E5BE7A] hover:text-white hover:-translate-y-[1px] active:scale-[0.98] transition-all flex items-center gap-1 font-mono text-xs sm:text-[13px] font-medium"
              >
                <span>YouTube</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
              <a 
                href="https://www.instagram.com/makwanasonal789/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-[#E5BE7A] hover:text-white hover:-translate-y-[1px] active:scale-[0.98] transition-all flex items-center gap-1 font-mono text-xs sm:text-[13px] font-medium"
              >
                <span>Instagram</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          <div className="pt-8 border-t border-white/[0.08] flex flex-col sm:flex-row items-baseline justify-between gap-4 text-xs sm:text-[13px] text-[#A39888] font-mono">
            <div className="flex flex-wrap items-center gap-3">
              <span>© {new Date().getFullYear()} Sonal Makwana.</span>
              <span className="text-white/20">·</span>
              <a href="tel:+917798439429" className="hover:text-[#E5BE7A] transition-colors">+91 77984 39429</a>
              <span className="text-white/20">·</span>
              <a href="https://wa.me/917798439429" target="_blank" rel="noopener noreferrer" className="hover:text-[#25D366] transition-colors">WhatsApp</a>
              <span className="text-white/20">·</span>
              <a href="mailto:sonalmehul15@gmail.com" className="hover:text-[#E5BE7A] transition-colors">sonalmehul15@gmail.com</a>
            </div>
            <div className="flex items-center gap-4">
              <span>Gujarat, India</span>
              <button
                onClick={() => scrollToSection('hero')}
                className="text-[#E5BE7A] hover:text-white flex items-center gap-1 hover:-translate-y-[1px] active:scale-[0.98] transition-all font-semibold"
              >
                <span>TOP</span>
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {activeLightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: LUXURY_EASE }}
            className="fixed inset-0 z-50 bg-[#0B0705]/98 flex items-center justify-center p-4 md:p-12 select-none"
          >
            <button
              onClick={() => setActiveLightboxIndex(null)}
              className="absolute top-6 right-6 z-50 text-xs sm:text-sm uppercase tracking-wider text-[#C4B7A5] hover:text-white transition-colors p-2 flex items-center gap-1.5 hover:-translate-y-[1px] active:scale-[0.98] font-medium"
              aria-label="Close Lightbox"
            >
              <span>Close</span>
              <X className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActiveLightboxIndex(prev => (prev !== null && prev > 0 ? prev - 1 : GALLERY_ARCHIVE.length - 1))}
              className="absolute left-6 z-50 text-xs sm:text-sm uppercase tracking-wider text-[#C4B7A5] hover:text-white transition-colors p-3 hidden sm:flex items-center gap-1 hover:-translate-y-[1px] active:scale-[0.98] font-medium"
              aria-label="Previous Image"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>PREV</span>
            </button>

            <button
              onClick={() => setActiveLightboxIndex(prev => (prev !== null && prev < GALLERY_ARCHIVE.length - 1 ? prev + 1 : 0))}
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
                  src={stageMoments[activeLightboxIndex]?.src || GALLERY_ARCHIVE[0].image}
                  alt={stageMoments[activeLightboxIndex]?.name || 'Stage Photo'}
                  className="w-full h-full object-cover transition-transform duration-300"
                  style={{
                    objectPosition: stageMoments[activeLightboxIndex]?.objectPosition || 'center 20%',
                    transform: `scale(${stageMoments[activeLightboxIndex]?.scale || 1}) rotate(${stageMoments[activeLightboxIndex]?.rotation || 0}deg)`,
                    transformOrigin: stageMoments[activeLightboxIndex]?.objectPosition || 'center 20%'
                  }}
                />
              </div>

              <div className="w-full md:w-2/5 space-y-4">
                <span className="font-mono text-xs sm:text-sm text-[#E5BE7A] font-medium">
                  PHOTO [{String(activeLightboxIndex + 1).padStart(2, '0')} / {String(stageMoments.length).padStart(2, '0')}]
                </span>

                <h3 className="font-serif-luxury text-2xl sm:text-3xl text-[#F5EBDD]">
                  {stageMoments[activeLightboxIndex]?.name || 'Stage Performance'}
                </h3>

                <div className="text-xs sm:text-sm text-[#E5BE7A] font-mono uppercase tracking-wider font-medium">
                  Occasion: {stageMoments[activeLightboxIndex]?.designation || 'Live Concert'}
                </div>

                <p className="text-sm text-[#D8CDC0] font-light leading-relaxed pt-3 border-t border-white/[0.08]">
                  {stageMoments[activeLightboxIndex]?.quote || 'Live stage performance moment by Sonal Makwana.'}
                </p>

                <div className="pt-4 flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-[#A39888] font-mono">
                    Stage Gallery
                  </span>
                  <button
                    onClick={() => setActiveLightboxIndex(null)}
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

      {/* Video Modal with Prominent Close Controls */}
      <AnimatePresence>
        {showVideoModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: LUXURY_EASE }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowVideoModal(false);
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
                    {siteSettings.livePerformance?.title || "Live Concert Showcase Reel"}
                  </span>
                </div>
                <button
                  onClick={() => setShowVideoModal(false)}
                  className="px-4 py-1.5 bg-[#E5BE7A] hover:bg-white text-[#090807] font-semibold text-xs sm:text-sm uppercase tracking-wider rounded flex items-center gap-1.5 transition-all shadow-md active:scale-95"
                >
                  <X className="w-4 h-4" />
                  <span>Close [Esc]</span>
                </button>
              </div>

              {/* 16:9 Video Player */}
              <div className="aspect-[16/9] w-full overflow-hidden bg-black border border-white/15 shadow-2xl">
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube-nocookie.com/embed/${siteSettings.livePerformance?.videoId || "RXVnBqGBi9A"}?autoplay=1&controls=1&rel=0`}
                  title={siteSettings.livePerformance?.title || "Sonal Makwana Live Concert Showcase Reel"}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              {/* Modal Footer with Channel Links and Return Button */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-2 text-xs sm:text-sm">
                <div>
                  <span className="font-serif-luxury text-xl sm:text-2xl text-[#F5EBDD] block">
                    {siteSettings.livePerformance?.title || "Sonal Makwana Live Performance"}
                  </span>
                  <span className="text-xs sm:text-sm uppercase tracking-wider text-[#A39888]">
                    {siteSettings.livePerformance?.subtitle || "Classical · Devotional · Garba · Folk Raas"}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowVideoModal(false)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 border border-white/20 text-[#C4B7A5] hover:text-white hover:border-[#E5BE7A] text-xs sm:text-[13px] uppercase tracking-wider font-mono transition-colors font-medium"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Return to Site</span>
                  </button>
                  <a
                    href={siteSettings.livePerformance?.channelUrl || "https://www.youtube.com/@SonalMakwana-zb7qc"}
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

      {/* Hidden YouTube audio player stream for Featured Song - Lazy Loaded on Demand */}
      {loadAudioPlayer && (
        <iframe
          ref={audioIframeRef}
          id="youtube-audio-stream"
          title="Featured Song Audio Stream"
          className="opacity-0 pointer-events-none fixed -top-[2000px] -left-[2000px] w-10 h-10 -z-50"
          src={`https://www.youtube-nocookie.com/embed/${siteSettings.featuredSong?.videoId || "1CTF9uM65b8"}?enablejsapi=1&controls=0&rel=0&playsinline=1`}
          allow="autoplay"
        />
      )}

    </div>
  );
}
