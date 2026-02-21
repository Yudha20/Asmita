import { motion, useMotionValue, useTransform } from 'motion/react';
import { Copy } from 'lucide-react';

interface MedalProps {
  onClick?: () => void;
  isFlipped?: boolean;
}

export function Medal({ onClick, isFlipped = false }: MedalProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [10, -10]);

  return (
    <div className="relative flex justify-center w-full h-full min-h-[60vh] items-start pt-[20vh] md:pt-[25vh]">
      {/* The Hanging Assembly */}
      <motion.div
        initial={{ y: "-100vh" }}
        animate={{ y: 0 }}
        style={{ x, rotate }}
        drag
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={0.6}
        whileDrag={{ cursor: "grabbing" }}
        onClick={onClick}
        transition={{
          // Separate transitions for different properties
          y: {
            type: "spring",
            stiffness: 40,
            damping: 10,
            mass: 3,
            delay: 0.2
          },
          default: {
            type: "spring",
            stiffness: 5,   // Even softer spring
            damping: 0.3,   // Very low damping for long, graceful swings
            mass: 2,
            restDelta: 0.001
          }
        }}
        className="relative flex flex-col items-center cursor-grab active:cursor-grabbing touch-none origin-top"
      >
        {/* Ribbon - Soft Velvet Texture */}
        <div className="absolute bottom-[calc(100%-8px)] w-16 md:w-20 h-[150vh] bg-gradient-to-b from-rose-900 via-rose-700 to-rose-900 shadow-sm flex justify-center overflow-hidden">
          {/* Silk sheen effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12" />
          <div className="w-0.5 h-full bg-rose-950/20 mx-1" />
          <div className="w-0.5 h-full bg-rose-950/20 mx-1" />
        </div>

        {/* The Medal Itself */}
        <motion.div
          initial={{ rotate: 0 }}
          animate={{ 
            rotate: [0, -3, 2, -1, 0],
            rotateY: isFlipped ? 180 : 0
          }}
          transition={{
            rotate: {
              duration: 3,
              times: [0, 0.3, 0.6, 0.85, 1],
              ease: "easeInOut",
              delay: 0.8
            },
            rotateY: {
              duration: 0.8,
              ease: "easeInOut"
            }
          }}
          style={{ transformStyle: "preserve-3d" }}
          className="relative z-20 -mt-2"
        >
          {/* FRONT FACE */}
          <div style={{ backfaceVisibility: "hidden" }} className="flex flex-col items-center">
            {/* Metal Loop */}
            <div className="w-4 h-4 md:w-5 md:h-5 mx-auto border-[3px] border-rose-300 rounded-full -mb-3 relative z-0 bg-rose-800" />

            {/* Main Body - Rose Gold Aesthetic */}
            <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full shadow-[0_0_30px_rgba(251,113,133,0.2),0_10px_30px_-10px_rgba(244,63,94,0.2)] flex items-center justify-center bg-rose-50">
              
              {/* 1. Outer Rim - Soft Rose Gold */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-rose-400 to-rose-700 shadow-sm" />
              
              {/* 2. Main Ring - Polished Rose Gold */}
              <div className="absolute inset-1 rounded-full bg-[conic-gradient(from_45deg,#fda4af,#fff1f2,#fda4af,#fff1f2,#fda4af)] shadow-inner" />

              {/* 3. Inner Ring - Soft Pink Enamel feel */}
              <div className="absolute inset-4 rounded-full bg-gradient-to-br from-rose-50 to-rose-100 shadow-sm flex items-center justify-center border border-rose-200">
                  {/* Removed dotted pattern */}
              </div>

              {/* 4. Center Face (Inset) */}
              <div className="relative w-44 h-44 md:w-56 md:h-56 bg-white rounded-full flex flex-col items-center justify-center shadow-[inset_0_2px_10px_rgba(251,113,133,0.1)] overflow-hidden border-4 border-rose-100">
                
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
                    animate={{ rotate: 360 }}
                    transition={{
                      repeat: Infinity,
                      duration: 60,
                      ease: "linear"
                    }}
                  >
                    {/* Abstract Floral Gem SVG */}
                    <svg width="140" height="140" viewBox="0 0 100 100" className="w-32 h-32 md:w-44 md:h-44 opacity-90">
                      <defs>
                        <linearGradient id="petalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#fecdd3" />
                          <stop offset="100%" stopColor="#fb7185" />
                        </linearGradient>
                        <filter id="glow">
                          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                          <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                          </feMerge>
                        </filter>
                      </defs>
                      
                      {/* Petals */}
                      <g filter="url(#glow)">
                        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
                          <path
                            key={i}
                            d="M50 50 Q 65 20 50 10 Q 35 20 50 50"
                            fill="url(#petalGradient)"
                            transform={`rotate(${angle} 50 50)`}
                            className="opacity-80"
                          />
                        ))}
                      </g>
                      
                      {/* Center Gem */}
                      <circle cx="50" cy="50" r="12" fill="#fff1f2" stroke="#fda4af" strokeWidth="1" />
                      <circle cx="50" cy="50" r="8" fill="#f43f5e" opacity="0.2" />
                    </svg>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </div>

          {/* BACK FACE */}
          <div style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }} className="absolute inset-0 flex flex-col items-center">
            {/* Metal Loop (Back) */}
            <div className="w-4 h-4 md:w-5 md:h-5 mx-auto border-[3px] border-rose-300 rounded-full -mb-3 relative z-0 bg-rose-800" />

            {/* Main Body (Back) */}
            <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full shadow-[0_0_30px_rgba(251,113,133,0.2),0_10px_30px_-10px_rgba(244,63,94,0.2)] flex items-center justify-center bg-rose-50">
              
              {/* 1. Outer Rim */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-bl from-rose-400 to-rose-700 shadow-sm" />
              
              {/* 2. Main Ring */}
              <div className="absolute inset-1 rounded-full bg-[conic-gradient(from_225deg,#fda4af,#fff1f2,#fda4af,#fff1f2,#fda4af)] shadow-inner" />

              {/* 3. Inner Ring */}
              <div className="absolute inset-4 rounded-full bg-gradient-to-bl from-rose-50 to-rose-100 shadow-sm flex items-center justify-center border border-rose-200">
              </div>

              {/* 4. Center Face (Inset) - The Code */}
              <div className="relative w-44 h-44 md:w-56 md:h-56 bg-white rounded-full flex flex-col items-center justify-center shadow-[inset_0_2px_10px_rgba(251,113,133,0.1)] overflow-hidden border-4 border-rose-100 p-5">
                <div className="flex flex-col items-center justify-center text-center space-y-2 w-full">
                  <p className="font-sans text-rose-900 text-sm md:text-base font-bold tracking-wide whitespace-nowrap">
                    Amazon Gift Card
                  </p>
                  <div className="w-12 h-0.5 bg-rose-200 rounded-full my-1.5" />
                  
                  <div className="flex items-center gap-2 bg-rose-50 px-3 py-1.5 rounded-full border border-rose-100 max-w-full">
                    <span className="font-mono text-rose-600 text-[11px] md:text-xs font-bold tracking-[0.25em] leading-tight whitespace-nowrap">
                      C6MG-TVKGMP-YCCB
                    </span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText("C6MG-TVKGMP-YCCB");
                      }}
                      className="p-1 rounded-full hover:bg-rose-100 text-rose-400 hover:text-rose-600 transition-colors"
                      title="Copy code"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
