/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Medal } from './components/Medal';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { useState } from 'react';

export default function App() {
  const [clickCount, setClickCount] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const FLIP_EVERY = 9;

  const handleMedalClick = () => {
    if (isFlipped) {
      setIsFlipped(false);
      setClickCount(0);
      return;
    }

    const newCount = clickCount + 1;
    if (newCount % FLIP_EVERY === 0) {
      setIsFlipped(true);
      setClickCount(0); // Reset count so we can flip back after another 9 clicks
      return;
    }

    setClickCount(newCount);

    // Default confetti action for other clicks (front side only)
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 50 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
      // Since particles fall down, start a bit higher than random
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }, colors: ['#fb7185', '#fda4af', '#ffe4e6', '#f43f5e'] });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }, colors: ['#fb7185', '#fda4af', '#ffe4e6', '#f43f5e'] });
    }, 250);
  };

  return (
    <div className="min-h-screen w-full bg-[#fff1f2] flex flex-col items-center overflow-hidden selection:bg-rose-200 selection:text-rose-900">
      
      {/* Background Pattern - Soft warm glow */}
      <div className="absolute inset-0" 
           style={{ 
             background: 'radial-gradient(circle at 50% 30%, #fff1f2 0%, #ffe4e6 100%)',
           }} 
      />

      {/* Subtle Dotted Pattern */}
      <div className="absolute inset-0 opacity-[0.25]" 
           style={{ 
             backgroundImage: 'radial-gradient(#fb7185 1px, transparent 1px)', 
             backgroundSize: '24px 24px' 
           }} 
      />
      
      <main className="relative z-10 flex-1 w-full flex flex-col items-center">
        <div className="flex-1 w-full">
          <Medal
            onClick={handleMedalClick}
            onPullReveal={() => {
              setIsFlipped(prev => !prev);
              setClickCount(0);
            }}
            isFlipped={isFlipped}
          />
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="pb-10 -mt-10 text-center space-y-4 px-4"
        >
          <p className="font-recoleta font-bold text-rose-900 text-2xl md:text-3xl tracking-wide leading-tight">
            {isFlipped ? (
              <>
                Here is your Amazon gift card,<br/>
                <span>from me.</span>
              </>
            ) : (
              <>
                Until you get your real one,<br/>
                <span>here's one from me.</span>
              </>
            )}
          </p>
          {!isFlipped ? (
            <>
              <p className="font-sansflex text-rose-800/60 font-bold text-sm md:text-base tracking-[0.2em] uppercase pt-1">
                — Yudha
              </p>

              <p className="font-sansflex text-xs md:text-sm text-rose-800/60 tracking-wide font-medium">
                PS: Click on the medal for a surprise
              </p>
            </>
          ) : null}
        </motion.div>
      </main>
    </div>
  );
}
