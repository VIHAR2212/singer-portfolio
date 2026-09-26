'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  X, 
  RotateCcw, 
  RotateCw, 
  Plus, 
  Minus, 
  Check, 
  Maximize2, 
  Crop, 
  RefreshCw,
  Sliders,
  Move
} from 'lucide-react';

export interface ImageCropperModalProps {
  isOpen: boolean;
  imageSrc: string;
  onClose: () => void;
  onCropComplete: (croppedDataUrl: string, blob: Blob) => Promise<void> | void;
  onRetake?: () => void;
  initialAspectRatio?: number; // e.g. 4/3 for gallery plate
  title?: string;
}

export type AspectRatioOption = {
  label: string;
  ratio: number | null; // null for free
  desc: string;
};

const ASPECT_RATIOS: AspectRatioOption[] = [
  { label: '4:3', ratio: 4 / 3, desc: 'Stage Plate' },
  { label: '16:9', ratio: 16 / 9, desc: 'Landscape' },
  { label: '1:1', ratio: 1, desc: 'Square' },
  { label: '3:2', ratio: 3 / 2, desc: 'Classic' },
  { label: '3:4', ratio: 3 / 4, desc: 'Portrait' },
];

export default function ImageCropperModal({
  isOpen,
  imageSrc,
  onClose,
  onCropComplete,
  onRetake,
  initialAspectRatio = 4 / 3,
  title = 'Drag the image to adjust'
}: ImageCropperModalProps) {
  const [selectedRatio, setSelectedRatio] = useState<number>(initialAspectRatio);
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [initialDragOffset, setInitialDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isProcessing, setIsProcessing] = useState(false);
  const [showGrid, setShowGrid] = useState(true);

  // Pinch-to-zoom state for mobile
  const [initialPinchDistance, setInitialPinchDistance] = useState<number | null>(null);
  const [initialPinchZoom, setInitialPinchZoom] = useState<number>(1);

  // References
  const containerRef = useRef<HTMLDivElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  // Frame dimensions calculated from container & aspect ratio
  const [frameSize, setFrameSize] = useState<{ width: number; height: number }>({ width: 500, height: 375 });

  // Reset transforms when a new image is loaded
  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setRotation(0);
      setOffset({ x: 0, y: 0 });
      setImgLoaded(false);
    }
  }, [isOpen, imageSrc]);

  // Recalculate frame size based on container and aspect ratio
  const updateFrameDimensions = useCallback(() => {
    if (!containerRef.current) return;
    const { clientWidth, clientHeight } = containerRef.current;
    
    // Available space with padding for controls
    const maxW = Math.min(clientWidth * 0.88, 680);
    const maxH = Math.min(clientHeight * 0.72, 520);

    let w = maxW;
    let h = w / selectedRatio;

    if (h > maxH) {
      h = maxH;
      w = h * selectedRatio;
    }

    setFrameSize({ width: Math.round(w), height: Math.round(h) });
  }, [selectedRatio]);

  useEffect(() => {
    updateFrameDimensions();
    window.addEventListener('resize', updateFrameDimensions);
    return () => window.removeEventListener('resize', updateFrameDimensions);
  }, [updateFrameDimensions]);

  // Handle image load
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
    setImgLoaded(true);
    setOffset({ x: 0, y: 0 });
    setZoom(1);
  };

  // Base scale calculation so image nicely fills the frame at 1x
  const getBaseScale = () => {
    if (!naturalSize.width || !naturalSize.height || !frameSize.width || !frameSize.height) return 1;
    const isRotatedQuarter = rotation % 180 !== 0;
    const nw = isRotatedQuarter ? naturalSize.height : naturalSize.width;
    const nh = isRotatedQuarter ? naturalSize.width : naturalSize.height;

    // Minimum scale to cover the frame
    return Math.max(frameSize.width / nw, frameSize.height / nh);
  };

  const baseScale = getBaseScale();
  const currentRenderedW = naturalSize.width * baseScale * zoom;
  const currentRenderedH = naturalSize.height * baseScale * zoom;

  // Drag handlers (Mouse)
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setInitialDragOffset({ x: offset.x, y: offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    setOffset({
      x: initialDragOffset.x + dx,
      y: initialDragOffset.y + dy
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handlers for mobile (Drag + Pinch Zoom)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
      setInitialDragOffset({ x: offset.x, y: offset.y });
      setInitialPinchDistance(null);
    } else if (e.touches.length === 2) {
      setIsDragging(false);
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      setInitialPinchDistance(dist);
      setInitialPinchZoom(zoom);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging) {
      const dx = e.touches[0].clientX - dragStart.x;
      const dy = e.touches[0].clientY - dragStart.y;
      setOffset({
        x: initialDragOffset.x + dx,
        y: initialDragOffset.y + dy
      });
    } else if (e.touches.length === 2 && initialPinchDistance !== null) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const ratio = dist / initialPinchDistance;
      const nextZoom = Math.min(Math.max(initialPinchZoom * ratio, 0.8), 4);
      setZoom(parseFloat(nextZoom.toFixed(2)));
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setInitialPinchDistance(null);
  };

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomStep = 0.08;
    const delta = e.deltaY < 0 ? zoomStep : -zoomStep;
    setZoom((prev) => {
      const next = Math.min(Math.max(prev + delta, 0.8), 4);
      return parseFloat(next.toFixed(2));
    });
  };

  // Quick zoom buttons (+ / -)
  const handleZoomIn = () => {
    setZoom((prev) => Math.min(parseFloat((prev + 0.15).toFixed(2)), 4));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(parseFloat((prev - 0.15).toFixed(2)), 0.8));
  };

  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setOffset({ x: 0, y: 0 });
  };

  const handleRotate = (direction: 'cw' | 'ccw') => {
    setRotation((prev) => {
      const step = direction === 'cw' ? 90 : -90;
      return (prev + step + 360) % 360;
    });
  };

  // Perform High-Quality Canvas Crop
  const handleApplyCrop = async () => {
    if (!imageRef.current || !imgLoaded) return;
    setIsProcessing(true);

    try {
      // Create high-resolution output canvas
      // Target resolution: 1200px width for supreme clarity, height matching aspect ratio
      const outputW = 1200;
      const outputH = Math.round(outputW / selectedRatio);

      const canvas = document.createElement('canvas');
      canvas.width = outputW;
      canvas.height = outputH;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Canvas 2D context not available');
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Ratio between canvas pixels and screen frame pixels
      const k = outputW / frameSize.width;

      // Center of output canvas
      ctx.save();
      ctx.translate(outputW / 2 + offset.x * k, outputH / 2 + offset.y * k);
      ctx.rotate((rotation * Math.PI) / 180);

      // Render image centered on canvas
      const drawW = currentRenderedW * k;
      const drawH = currentRenderedH * k;

      ctx.drawImage(
        imageRef.current,
        -drawW / 2,
        -drawH / 2,
        drawW,
        drawH
      );

      ctx.restore();

      // Export as Blob & Data URL
      canvas.toBlob(
        async (blob) => {
          if (!blob) {
            setIsProcessing(false);
            return;
          }
          const croppedDataUrl = canvas.toDataURL('image/webp', 0.92);
          await onCropComplete(croppedDataUrl, blob);
          setIsProcessing(false);
        },
        'image/webp',
        0.92
      );
    } catch (err) {
      console.error('Failed to crop canvas image:', err);
      // Fallback: If tainted canvas or error, pass through original
      setIsProcessing(false);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col select-none touch-none overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* ========================================================================= */}
      {/* TOP HEADER BAR (Matching user reference: X, "Drag the image to adjust", Retake) */}
      {/* ========================================================================= */}
      <div className="h-16 px-4 sm:px-6 bg-zinc-950/80 border-b border-zinc-800/80 flex items-center justify-between shrink-0 z-20">
        
        {/* Left: Close / Cancel */}
        <button
          type="button"
          onClick={onClose}
          className="p-2 -ml-2 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800/60 active:scale-95 transition-all"
          title="Cancel"
          aria-label="Close"
        >
          <X className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Center: Title & Hint */}
        <div className="text-center px-2">
          <h2 className="text-sm sm:text-base font-semibold text-zinc-100 flex items-center justify-center gap-1.5">
            <span>{title}</span>
          </h2>
          <p className="text-[11px] text-zinc-400 hidden sm:block">
            Pan, zoom, and frame inside the rectangular border
          </p>
        </div>

        {/* Right: Retake / Replace Button */}
        {onRetake ? (
          <button
            type="button"
            onClick={onRetake}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-200 hover:text-white bg-zinc-800/80 hover:bg-zinc-700 active:scale-95 transition-all border border-zinc-700/60"
            title="Choose a different image"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retake</span>
          </button>
        ) : (
          <div className="w-10" />
        )}
      </div>

      {/* ========================================================================= */}
      {/* CENTER WORKSPACE: RECTANGULAR VIEWPORT WITH DARK MASK */}
      {/* ========================================================================= */}
      <div 
        ref={containerRef}
        className="relative flex-1 w-full h-full flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
      >
        {/* Hidden Natural Sized Image for Loading */}
        <img
          ref={imageRef}
          src={imageSrc}
          alt="Cropper Target"
          crossOrigin="anonymous"
          onLoad={handleImageLoad}
          className="hidden pointer-events-none"
        />

        {/* The Transformed Image (Position + Zoom + Rotation) */}
        {imgLoaded && (
          <div
            className="absolute pointer-events-none will-change-transform"
            style={{
              width: currentRenderedW,
              height: currentRenderedH,
              transform: `translate(${offset.x}px, ${offset.y}px) rotate(${rotation}deg)`,
              transition: isDragging ? 'none' : 'transform 0.08s ease-out'
            }}
          >
            <img
              src={imageSrc}
              alt="Crop Preview"
              crossOrigin="anonymous"
              className="w-full h-full object-cover select-none pointer-events-none shadow-2xl"
              draggable={false}
            />
          </div>
        )}

        {/* ========================================================================= */}
        {/* RECTANGULAR FRAME & SURROUNDING DARK MASK */}
        {/* ========================================================================= */}
        <div 
          className="relative pointer-events-none z-10"
          style={{
            width: frameSize.width,
            height: frameSize.height,
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.75)' // Rectangular Cutout Mask
          }}
        >
          {/* Crisp Rectangular Border */}
          <div className="absolute inset-0 border-2 border-white/80 shadow-[0_0_15px_rgba(0,0,0,0.8)]" />

          {/* L-Shaped Luxury Corner Brackets */}
          <div className="absolute -top-[2px] -left-[2px] w-5 h-5 border-t-4 border-l-4 border-[#E5BE7A]" />
          <div className="absolute -top-[2px] -right-[2px] w-5 h-5 border-t-4 border-r-4 border-[#E5BE7A]" />
          <div className="absolute -bottom-[2px] -left-[2px] w-5 h-5 border-b-4 border-l-4 border-[#E5BE7A]" />
          <div className="absolute -bottom-[2px] -right-[2px] w-5 h-5 border-b-4 border-r-4 border-[#E5BE7A]" />

          {/* Rule of Thirds Grid (Visible when showGrid is true or while dragging) */}
          {showGrid && (
            <div className={`absolute inset-0 pointer-events-none transition-opacity duration-200 ${isDragging ? 'opacity-80' : 'opacity-40'}`}>
              {/* Horizontal 33% and 66% lines */}
              <div className="absolute top-1/3 left-0 right-0 border-b border-white/30 border-dashed" />
              <div className="absolute top-2/3 left-0 right-0 border-b border-white/30 border-dashed" />
              {/* Vertical 33% and 66% lines */}
              <div className="absolute left-1/3 top-0 bottom-0 border-r border-white/30 border-dashed" />
              <div className="absolute left-2/3 top-0 bottom-0 border-r border-white/30 border-dashed" />
            </div>
          )}

          {/* Frame Label Badge */}
          <div className="absolute top-3 left-3 bg-black/75 px-2 py-0.5 rounded text-[10px] font-mono text-zinc-300 border border-zinc-700/60 backdrop-blur-sm">
            {ASPECT_RATIOS.find((r) => r.ratio === selectedRatio)?.label || 'Frame'}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* FLOATING ZOOM CONTROLS (+ / -) ON THE RIGHT (Exact match to User Reference) */}
        {/* ========================================================================= */}
        <div 
          className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-20 flex flex-col bg-zinc-900/90 border border-zinc-700/80 rounded-full shadow-2xl backdrop-blur-md overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={handleZoomIn}
            disabled={zoom >= 4}
            className="p-3 text-zinc-200 hover:text-white hover:bg-zinc-800 disabled:opacity-30 active:scale-95 transition-all"
            title="Zoom In"
            aria-label="Zoom in"
          >
            <Plus className="w-5 h-5" />
          </button>
          <div className="h-[1px] w-full bg-zinc-800" />
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={zoom <= 0.8}
            className="p-3 text-zinc-200 hover:text-white hover:bg-zinc-800 disabled:opacity-30 active:scale-95 transition-all"
            title="Zoom Out"
            aria-label="Zoom out"
          >
            <Minus className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Orientation & Reset Toolbar (Top Right of Workspace) */}
        <div 
          className="absolute top-4 right-4 sm:right-6 z-20 flex items-center gap-1.5 bg-zinc-900/80 border border-zinc-800 rounded-lg p-1 backdrop-blur-md"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => handleRotate('cw')}
            className="p-1.5 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded transition-colors"
            title="Rotate 90° Clockwise"
          >
            <RotateCw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="px-2 py-1 text-[11px] font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 rounded transition-colors"
            title="Reset position and zoom"
          >
            Reset
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* BOTTOM CONTROLS & CONFIRMATION BAR */}
      {/* ========================================================================= */}
      <div className="px-4 sm:px-6 py-3.5 bg-zinc-950/90 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 z-20">
        
        {/* Left: Aspect Ratio Selectors */}
        <div className="flex items-center gap-1 bg-zinc-900/80 p-1 rounded-lg border border-zinc-800">
          {ASPECT_RATIOS.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => setSelectedRatio(item.ratio!)}
              className={`px-2.5 py-1 text-xs rounded font-medium transition-all ${
                selectedRatio === item.ratio
                  ? 'bg-zinc-100 text-zinc-950 font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span>{item.label}</span>
              <span className="hidden md:inline text-[10px] ml-1 opacity-70">({item.desc})</span>
            </button>
          ))}
        </div>

        {/* Center: Zoom Slider */}
        <div className="flex items-center gap-3 w-full sm:w-64 max-w-xs">
          <span className="text-[11px] text-zinc-400 font-mono shrink-0">
            {Math.round(zoom * 100)}%
          </span>
          <input
            type="range"
            min={0.8}
            max={4}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            className="w-full accent-[#E5BE7A] h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
          />
        </div>

        {/* Right: Empty spacer to balance layout */}
        <div className="hidden sm:block w-24" />
      </div>

      {/* ========================================================================= */}
      {/* FLOATING GREEN CHECKMARK BUTTON (Exact match to User Reference Image 2) */}
      {/* ========================================================================= */}
      <button
        type="button"
        onClick={handleApplyCrop}
        disabled={isProcessing}
        className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-30 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-emerald-500 hover:bg-emerald-400 active:scale-90 text-white shadow-[0_8px_25px_rgba(16,185,129,0.45)] border-2 border-emerald-300 flex items-center justify-center transition-all duration-200 cursor-pointer disabled:opacity-50"
        title="Apply Crop & Confirm"
        aria-label="Confirm Crop"
      >
        {isProcessing ? (
          <RefreshCw className="w-6 h-6 sm:w-7 sm:h-7 animate-spin text-white" />
        ) : (
          <Check className="w-7 h-7 sm:w-8 sm:h-8 stroke-[3] text-white" />
        )}
      </button>

    </div>
  );
}
