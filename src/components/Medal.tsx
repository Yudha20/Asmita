import { motion, useMotionValue, useTransform, animate } from 'motion/react';
import { Copy, Check } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import copy from 'copy-to-clipboard';

interface MedalProps {
  onClick?: () => void;
  onPullReveal?: () => void;
  isFlipped?: boolean;
}

export function Medal({ onClick, onPullReveal, isFlipped = false }: MedalProps) {
  const giftCode = "C6MG-TVKGMP-YCCB";
  const [hasCopied, setHasCopied] = useState(false);
  const [isMotifDragging, setIsMotifDragging] = useState(false);
  const motifWrapRef = useRef<HTMLDivElement | null>(null);
  const lastDetentRef = useRef<number | null>(null);
  const spinControlRef = useRef<ReturnType<typeof animate> | null>(null);
  const dragMovedRef = useRef(false);
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
  const motifPointerStartRef = useRef<{ x: number; y: number } | null>(null);
  const motifMovedRef = useRef(false);
  const copyInFlightRef = useRef(false);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset copy state whenever the medal flips
  useEffect(() => {
    setHasCopied(false);
    if (copyTimeoutRef.current) {
      clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = null;
    }
  }, [isFlipped]);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [10, -10]);
  const motifRotation = useMotionValue(0);

  useEffect(() => {
    if (isMotifDragging) {
      spinControlRef.current?.stop();
      spinControlRef.current = null;
      return;
    }

    const current = motifRotation.get();
    spinControlRef.current?.stop();
    spinControlRef.current = animate(motifRotation, current + 360, {
      duration: 60,
      ease: 'linear',
      repeat: Infinity,
    });

    return () => {
      spinControlRef.current?.stop();
      spinControlRef.current = null;
    };
  }, [isMotifDragging, motifRotation]);
  const copyCode = async (): Promise<boolean> => {
    // Start with the synchronous path to keep user-gesture context.
    try {
      if (copy(giftCode)) {
        return true;
      }
    } catch (err) {
      console.warn("copy-to-clipboard failed", err);
    }

    // Prefer the modern Clipboard API when available, but fall back on failure.
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(giftCode);
        return true;
      } catch (err) {
        console.warn("Clipboard API failed", err);
      }
    }

    return execCommandFallback();
  };

  const execCommandFallback = (): boolean => {
    const textarea = document.createElement("textarea");
    textarea.value = giftCode;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "absolute";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);

    // Select text specifically for iOS compatibility
    textarea.select();
    textarea.setSelectionRange(0, 99999);

    try {
      return document.execCommand("copy");
    } catch (error) {
      console.error("Fallback copy failed", error);
      return false;
    } finally {
      document.body.removeChild(textarea);
    }
  };

  const handleCopyAndReturn = () => {
    if (hasCopied || copyInFlightRef.current) {
      return;
    }
    copyInFlightRef.current = true;

    void (async () => {
      const didCopy = await copyCode();
      if (!didCopy) {
        copyInFlightRef.current = false;
        return;
      }

      setHasCopied(true);
      if (navigator.vibrate) {
        navigator.vibrate(20);
      }

      // Allow the user to see the "COPIED" state and ensure the copy
      // completes smoothly without focus loss, then trigger flip
      copyTimeoutRef.current = setTimeout(() => {
        onClick?.();
        setHasCopied(false);
        copyInFlightRef.current = false;
        copyTimeoutRef.current = null;
      }, 400);
    })();
  };

  const handleMotifPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (isFlipped) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    setIsMotifDragging(true);
    motifMovedRef.current = false;
    motifPointerStartRef.current = { x: event.clientX, y: event.clientY };
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  };

  const handleMotifPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (motifPointerStartRef.current) {
      const dx = event.clientX - motifPointerStartRef.current.x;
      const dy = event.clientY - motifPointerStartRef.current.y;
      const distance = Math.hypot(dx, dy);
      const isTap = distance <= 6 && !motifMovedRef.current;
      if (isTap) {
        if (navigator.vibrate) {
          navigator.vibrate(10);
        }
        onClick?.();
      }
    }
    setIsMotifDragging(false);
    motifPointerStartRef.current = null;
    motifMovedRef.current = false;
    (event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId);
  };

  const handleMotifPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (isFlipped || !isMotifDragging || !motifWrapRef.current) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    const rect = motifWrapRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const angleRad = Math.atan2(centerY - event.clientY, event.clientX - centerX);
    const angleDeg = (angleRad * 180) / Math.PI;
    const normalizedAngle = (angleDeg + 360) % 360;
    if (motifPointerStartRef.current) {
      const dx = event.clientX - motifPointerStartRef.current.x;
      const dy = event.clientY - motifPointerStartRef.current.y;
      if (Math.hypot(dx, dy) > 6) {
        motifMovedRef.current = true;
      }
    }
    const detent = Math.round(normalizedAngle / 30) % 12;
    const snappedAngle = detent * 30;

    motifRotation.set(snappedAngle);

    if (detent !== lastDetentRef.current) {
      lastDetentRef.current = detent;
      if (navigator.vibrate) {
        navigator.vibrate(10);
      }
    }
  };

  return (
    <div className="relative flex justify-center w-full h-full min-h-[52vh] items-start pt-[12vh] md:pt-[20vh]">
      {/* The Hanging Assembly */}
      <motion.div
        initial={{ y: "-100vh" }}
        animate={{ y: 0 }}
        transition={{
          y: {
            type: "spring",
            stiffness: 40,
            damping: 10,
            mass: 3,
            delay: 0.2
          }
        }}
      >
        <motion.div
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          style={{ x, y, rotate, transformStyle: "preserve-3d" }}
          drag
          dragConstraints={{ left: 0, right: 0, top: 0, bottom: 240 }}
          dragElastic={0.8}
          dragMomentum={false}
          whileDrag={{ cursor: "grabbing" }}
          onPointerDown={(event) => {
            pointerStartRef.current = { x: event.clientX, y: event.clientY };
            dragMovedRef.current = false;
          }}
          onPointerUp={(event) => {
            if (!pointerStartRef.current) {
              return;
            }
            const dx = event.clientX - pointerStartRef.current.x;
            const dy = event.clientY - pointerStartRef.current.y;
            const distance = Math.hypot(dx, dy);
            const isTap = distance <= 6 && !dragMovedRef.current;
            pointerStartRef.current = null;
            if (isTap) {
              if (navigator.vibrate) {
                navigator.vibrate(10);
              }
              onClick?.();
            }
          }}
          onDragStart={() => {
            dragMovedRef.current = false;
          }}
          onDrag={(_, info) => {
            if (Math.abs(info.offset.x) + Math.abs(info.offset.y) > 6) {
              dragMovedRef.current = true;
            }
          }}
          onDragEnd={(_, info) => {
            if (info.offset.y >= 240) {
              onPullReveal?.();
            }
            animate(y, 0, {
              type: "spring",
              stiffness: 180,
              damping: 12,
              mass: 0.9
            });
            pointerStartRef.current = null;
          }}
          transition={{
            default: {
              type: "spring",
              stiffness: 5,   // Even softer spring
              damping: 0.3,   // Very low damping for long, graceful swings
              mass: 2,
              restDelta: 0.001
            },
            rotateY: {
              duration: 0.8,
              ease: "easeInOut"
            }
          }}
          className="relative flex flex-col items-center cursor-grab active:cursor-grabbing touch-none origin-top"
        >
          {/* Ribbon - Rich Velvet with Woven Texture */}
          <div className="absolute bottom-[calc(100%-8px)] w-16 md:w-20 h-[150vh] bg-gradient-to-b from-rose-900 via-rose-700 to-rose-900 shadow-[2px_0_8px_rgba(0,0,0,0.15),-2px_0_8px_rgba(0,0,0,0.15)] flex justify-center overflow-hidden">
            {/* Woven crosshatch texture */}
            <div className="absolute inset-0 opacity-[0.10]" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 3px, #fff 3px, #fff 4px), repeating-linear-gradient(-45deg, transparent, transparent 3px, #fff 3px, #fff 4px)', backgroundSize: '8px 8px' }} />
            {/* Vertical silk grain */}
            <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'repeating-linear-gradient(180deg, transparent, transparent 1px, rgba(255,255,255,0.4) 1px, transparent 2px)', backgroundSize: '100% 3px' }} />
            {/* Horizontal weave bands */}
            <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 10px, rgba(255,255,255,0.3) 10px, transparent 11px)', backgroundSize: '100% 12px' }} />
            {/* Center silk sheen */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.14] to-transparent" />
            {/* Gold edge trims */}
            <div className="absolute left-0 top-0 w-[2px] h-full bg-gradient-to-b from-amber-300/40 via-amber-200/25 to-amber-300/40" />
            <div className="absolute right-0 top-0 w-[2px] h-full bg-gradient-to-b from-amber-300/40 via-amber-200/25 to-amber-300/40" />
            {/* Inner gold accent lines */}
            <div className="absolute left-[3px] top-0 w-px h-full bg-amber-400/10" />
            <div className="absolute right-[3px] top-0 w-px h-full bg-amber-400/10" />
            {/* Center crease lines */}
            <div className="w-px h-full bg-rose-950/[0.18]" />
            <div className="w-2 h-full" />
            <div className="w-px h-full bg-rose-950/[0.18]" />
            {/* Animated shimmer sweep */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.18] to-transparent"
              style={{ height: '30%' }}
              initial={{ top: '-30%' }}
              animate={{ top: '130%' }}
              transition={{ duration: 3, delay: 3, repeat: Infinity, repeatDelay: 8, ease: 'easeInOut' }}
            />
          </div>

          {/* The Medal Itself */}
          <motion.div
            initial={{ rotate: 0 }}
            animate={{
              rotate: [0, -3, 2, -1, 0]
            }}
            transition={{
              rotate: {
                duration: 3,
                times: [0, 0.3, 0.6, 0.85, 1],
                ease: "easeInOut",
                delay: 0.8
              }
            }}
            style={{ transformStyle: "preserve-3d" }}
            className="relative z-20 -mt-2"
          >
            {/* FRONT FACE */}
            <div style={{ backfaceVisibility: "hidden" }} className="flex flex-col items-center">
              {/* Metal Loop — more ornate bail */}
              <div className="relative w-5 h-5 md:w-6 md:h-6 mx-auto -mb-3 z-0">
                <div className="absolute inset-0 rounded-full border-[3px] border-rose-300 bg-gradient-to-b from-rose-700 to-rose-900" />
                <div className="absolute inset-[3px] rounded-full bg-gradient-to-b from-rose-800 to-rose-950" />
                {/* Bail highlight */}
                <div className="absolute top-[2px] left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-rose-200/60" />
              </div>

              {/* Main Body - Rose Gold Aesthetic */}
              <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full shadow-[0_0_40px_rgba(251,113,133,0.25),0_0_80px_rgba(244,63,94,0.1),0_10px_30px_-10px_rgba(244,63,94,0.25)] flex items-center justify-center bg-rose-50">

                {/* 1. Outer Rim - Rich Rose Gold with beveled edge */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-rose-300 via-rose-500 to-rose-800 shadow-sm" />
                {/* Beveled highlight on top — very subtle */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/5 to-transparent" style={{ clipPath: 'inset(0 0 50% 0 round 9999px)' }} />

                {/* 2. Main Ring - Polished Rose Gold conic */}
                <div className="absolute inset-[3px] rounded-full bg-[conic-gradient(from_0deg,#fda4af,#fff1f2,#e11d48_20%,#fff1f2,#fda4af,#fff1f2,#e11d48_70%,#fff1f2,#fda4af)] shadow-inner" />

                {/* 4. Inner Ring — enamel with decorative border */}
                <div className="absolute inset-4 rounded-full bg-gradient-to-br from-rose-50 via-white to-rose-100 shadow-[inset_0_1px_3px_rgba(136,19,55,0.1)] border border-rose-200" />



                {/* 6. Center Face (Inset) */}
                <div className="relative w-44 h-44 md:w-56 md:h-56 bg-[radial-gradient(circle_at_center,#ffffff_0%,#fff1f2_45%,#ffffff_100%)] rounded-full flex flex-col items-center justify-center shadow-[inset_0_0_14px_rgba(251,113,133,0.12)] overflow-hidden border-4 border-rose-100/80">

                  {/* Shimmer Effect - One time */}
                  <motion.div
                    initial={{ x: "-150%", rotate: 45 }}
                    animate={{ x: "150%", rotate: 45 }}
                    transition={{
                      duration: 1.5,
                      ease: "easeInOut",
                      delay: 2.5
                    }}
                    className="absolute top-0 left-0 w-full h-full bg-white/80 blur-md"
                    style={{ height: '300%', top: '-100%' }}
                  />

                  {/* Central Element: Elegant Floral/Gem Motif */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8, duration: 0.8, type: "spring" }}
                    className="relative z-10 text-rose-400 flex items-center justify-center"
                  >
                    {/* Rotating Container */}
                    <motion.div
                      ref={motifWrapRef}
                      style={{ rotate: motifRotation }}
                      onPointerDown={handleMotifPointerDown}
                      onPointerMove={handleMotifPointerMove}
                      onPointerUp={handleMotifPointerUp}
                      onPointerCancel={handleMotifPointerUp}
                      className="touch-none select-none"
                    >
                      {/* Enhanced Floral Gem SVG */}
                      <svg width="140" height="140" viewBox="0 0 100 100" className="w-32 h-32 md:w-44 md:h-44 opacity-90">
                        <defs>
                          <linearGradient id="petalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#fecdd3" />
                            <stop offset="100%" stopColor="#fb7185" />
                          </linearGradient>
                          <linearGradient id="innerPetalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#ffe4e6" />
                            <stop offset="100%" stopColor="#fda4af" />
                          </linearGradient>
                          <radialGradient id="gemGrad" cx="40%" cy="40%">
                            <stop offset="0%" stopColor="#fff1f2" />
                            <stop offset="50%" stopColor="#fecdd3" />
                            <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.3" />
                          </radialGradient>
                          <filter id="glow">
                            <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
                            <feMerge>
                              <feMergeNode in="coloredBlur" />
                              <feMergeNode in="SourceGraphic" />
                            </feMerge>
                          </filter>
                          <filter id="softGlow">
                            <feGaussianBlur stdDeviation="3" result="blur" />
                            <feMerge>
                              <feMergeNode in="blur" />
                              <feMergeNode in="SourceGraphic" />
                            </feMerge>
                          </filter>
                        </defs>

                        {/* Outer decorative ring of tiny dots */}
                        {Array.from({ length: 24 }).map((_, i) => {
                          const a = (i * 15) * (Math.PI / 180);
                          return <circle key={`ring-${i}`} cx={50 + 44 * Math.cos(a)} cy={50 + 44 * Math.sin(a)} r="0.8" fill="#fda4af" opacity="0.5" />;
                        })}

                        {/* Outer Petals */}
                        <g filter="url(#glow)">
                          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
                            <path
                              key={`op-${i}`}
                              d="M50 50 Q 65 20 50 10 Q 35 20 50 50"
                              fill="url(#petalGradient)"
                              transform={`rotate(${angle} 50 50)`}
                              className="opacity-80"
                            />
                          ))}
                        </g>

                        {/* Inner Petals — offset 22.5° */}
                        <g filter="url(#softGlow)">
                          {[22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5].map((angle, i) => (
                            <path
                              key={`ip-${i}`}
                              d="M50 50 Q 58 35 50 28 Q 42 35 50 50"
                              fill="url(#innerPetalGrad)"
                              transform={`rotate(${angle} 50 50)`}
                              opacity="0.6"
                            />
                          ))}
                        </g>

                        {/* Center Gem — multi-layer */}
                        <circle cx="50" cy="50" r="14" fill="url(#gemGrad)" stroke="#fda4af" strokeWidth="0.8" />
                        <circle cx="50" cy="50" r="10" fill="none" stroke="#fecdd3" strokeWidth="0.5" />
                        <circle cx="50" cy="50" r="6" fill="#f43f5e" opacity="0.15" />
                        {/* Gem highlight */}
                        <ellipse cx="47" cy="47" rx="3" ry="2" fill="white" opacity="0.4" />
                      </svg>
                    </motion.div>
                  </motion.div>
                </div>
              </div>
            </div>

            {/* BACK FACE */}
            <div style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }} className="absolute inset-0 flex flex-col items-center">
              {/* Metal Loop (Back) */}
              <div className="relative w-5 h-5 md:w-6 md:h-6 mx-auto -mb-3 z-0">
                <div className="absolute inset-0 rounded-full border-[3px] border-rose-300 bg-gradient-to-b from-rose-700 to-rose-900" />
                <div className="absolute inset-[3px] rounded-full bg-gradient-to-b from-rose-800 to-rose-950" />
              </div>

              {/* Main Body (Back) */}
              <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full shadow-[0_0_40px_rgba(251,113,133,0.25),0_0_80px_rgba(244,63,94,0.1),0_10px_30px_-10px_rgba(244,63,94,0.25)] flex items-center justify-center bg-rose-50">

                {/* 1. Outer Rim */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-bl from-rose-300 via-rose-500 to-rose-800 shadow-sm" />
                {/* Beveled highlight — very subtle */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-t from-white/[0.03] to-transparent" style={{ clipPath: 'inset(50% 0 0 0 round 9999px)' }} />

                {/* 2. Main Ring */}
                <div className="absolute inset-[3px] rounded-full bg-[conic-gradient(from_180deg,#fda4af,#fff1f2,#e11d48_20%,#fff1f2,#fda4af,#fff1f2,#e11d48_70%,#fff1f2,#fda4af)] shadow-inner" />

                {/* 4. Inner Ring */}
                <div className="absolute inset-4 rounded-full bg-gradient-to-bl from-rose-50 via-white to-rose-100 shadow-[inset_0_1px_3px_rgba(136,19,55,0.1)] border border-rose-200" />

                {/* 5. Starburst decorative pattern */}
                <div className="absolute inset-5 rounded-full flex items-center justify-center">
                  <svg viewBox="0 0 200 200" className="w-full h-full opacity-[0.08]">
                    {Array.from({ length: 12 }).map((_, i) => {
                      const angle = i * 30;
                      return (
                        <line
                          key={`ray-${i}`}
                          x1="100" y1="100"
                          x2={100 + 85 * Math.cos(angle * Math.PI / 180)}
                          y2={100 + 85 * Math.sin(angle * Math.PI / 180)}
                          stroke="#881337"
                          strokeWidth="0.5"
                        />
                      );
                    })}
                  </svg>
                </div>

                {/* 6. Center Face (Inset) - The Code — entire circle is tappable */}
                <div
                  className="relative w-44 h-44 md:w-56 md:h-56 bg-[radial-gradient(circle_at_center,#ffffff_0%,#fff1f2_45%,#ffffff_100%)] rounded-full flex flex-col items-center justify-center shadow-[inset_0_0_14px_rgba(251,113,133,0.12)] overflow-hidden border-4 border-rose-100/80 p-5 cursor-pointer"
                  onPointerDownCapture={(e) => e.stopPropagation()}
                  onPointerUpCapture={(e) => e.stopPropagation()}
                  onClickCapture={(e) => e.stopPropagation()}
                  onPointerDown={(e) => e.stopPropagation()}
                  onPointerUp={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleCopyAndReturn();
                  }}
                  onTouchEnd={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleCopyAndReturn();
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleCopyAndReturn();
                  }}
                  role="button"
                  tabIndex={0}
                  title="Copy code and return"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      e.stopPropagation();
                      handleCopyAndReturn();
                    }
                  }}
                >
                  <div className="flex flex-col items-center justify-center text-center w-full">
                    <div
                      className="flex items-center justify-center gap-3 max-w-[95%] flex-nowrap"
                    >
                      <span className="font-mono text-rose-600 text-[12px] md:text-[14px] font-bold tracking-[0.1em] leading-tight whitespace-nowrap">
                        {hasCopied ? "COPIED!" : giftCode}
                      </span>
                      <span className="text-rose-500">
                        {hasCopied ? <Check size={18} /> : <Copy size={16} />}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
