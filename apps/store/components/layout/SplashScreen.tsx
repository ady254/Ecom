'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * World-Class High-Definition Crystal Chime ("Ting" sound effect)
 * Engineered with Web Audio API dual-stage synthesis (2093Hz C7 + 4186Hz C8 overtones)
 * for a luxurious, pristine, high-frequency bell sound like Unstop / Apple / Stripe.
 */
function playCrystalTingSound(volumeMultiplier = 1.0) {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();

    const triggerAudio = () => {
      const now = ctx.currentTime;

      // Master Gain
      const master = ctx.createGain();
      master.gain.setValueAtTime(0.7 * volumeMultiplier, now);

      // Primary High Crystal Note (C7 - 2093Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(2093.00, now);
      gain1.gain.setValueAtTime(0.5, now);
      gain1.gain.exponentialRampToValueAtTime(0.00001, now + 1.8);

      // High Shimmer Octave (C8 - 4186Hz)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(4186.01, now);
      gain2.gain.setValueAtTime(0.25, now);
      gain2.gain.exponentialRampToValueAtTime(0.00001, now + 1.2);

      // Warm Metallic Body (G6 - 1567.98Hz)
      const osc3 = ctx.createOscillator();
      const gain3 = ctx.createGain();
      osc3.type = 'triangle';
      osc3.frequency.setValueAtTime(1567.98, now);
      gain3.gain.setValueAtTime(0.15, now);
      gain3.gain.exponentialRampToValueAtTime(0.00001, now + 0.9);

      // Reverb-like Highpass Filter
      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(1200, now);

      osc1.connect(gain1);
      osc2.connect(gain2);
      osc3.connect(gain3);

      gain1.connect(filter);
      gain2.connect(filter);
      gain3.connect(filter);

      filter.connect(master);
      master.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc3.start(now);

      osc1.stop(now + 2.0);
      osc2.stop(now + 2.0);
      osc3.stop(now + 2.0);
    };

    if (ctx.state === 'suspended') {
      ctx.resume().then(triggerAudio).catch(() => {});
    } else {
      triggerAudio();
    }
  } catch (err) {
    console.debug('Audio playback omitted by browser policy:', err);
  }
}

const FULL_TEXT = 'Welcome to MINARA Gifting Store';

export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(false);
  const [typedText, setTypedText] = useState('');
  const [isTypingDone, setIsTypingDone] = useState(false);
  const typingIndexRef = useRef(0);

  useEffect(() => {
    // Show splash screen on first visit (or per session)
    const hasSeen = sessionStorage.getItem('minara_splash_seen_v4');

    if (!hasSeen) {
      setIsVisible(true);
      sessionStorage.setItem('minara_splash_seen_v4', 'true');

      // Global listeners to unlock Web Audio context on any user interaction
      const unlockAudioEvents = ['pointerdown', 'touchstart', 'mousemove', 'keydown', 'scroll'];
      const preWarmAudio = () => {
        try {
          const AudioCtx =
            window.AudioContext ||
            (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
          if (AudioCtx) {
            const tempCtx = new AudioCtx();
            if (tempCtx.state === 'suspended') tempCtx.resume();
          }
        } catch {}
      };
      unlockAudioEvents.forEach((evt) => window.addEventListener(evt, preWarmAudio, { once: true }));

      // Sound trigger
      setTimeout(() => {
        playCrystalTingSound(1.2);
      }, 300);

      // Typing Effect Logic
      const typingInterval = setInterval(() => {
        if (typingIndexRef.current < FULL_TEXT.length) {
          setTypedText(FULL_TEXT.slice(0, typingIndexRef.current + 1));
          typingIndexRef.current += 1;
        } else {
          setIsTypingDone(true);
          clearInterval(typingInterval);
        }
      }, 40);

      // Auto-dismiss splash screen after presentation completes (~3.4s total)
      const dismissTimer = setTimeout(() => {
        setIsVisible(false);
      }, 3400);

      return () => {
        clearTimeout(dismissTimer);
        clearInterval(typingInterval);
        unlockAudioEvents.forEach((evt) => window.removeEventListener(evt, preWarmAudio));
      };
    }
  }, []);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#040d1a] text-white overflow-hidden select-none pointer-events-none px-4"
        >
          {/* Ambient Lighting Layers */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#0b254a]/60 via-[#040d1a]/95 to-[#020710]" />

          {/* Tropical Palm Leaf Shadows Overlay (Matching Reference Image) */}
          <motion.div
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 0.22, scale: 1.0 }}
            transition={{ duration: 2.5, ease: 'easeOut' }}
            className="absolute inset-0 pointer-events-none mix-blend-overlay overflow-hidden"
          >
            <svg
              className="absolute -left-16 -top-20 w-[550px] sm:w-[700px] md:w-[900px] h-auto text-[#000000] opacity-90 blur-[1px]"
              viewBox="0 0 500 500"
              fill="currentColor"
            >
              <path d="M250,50 C180,120 120,220 80,320 C140,290 200,240 250,180 C230,240 200,310 150,380 C210,340 260,280 300,210 C300,280 280,350 240,420 C290,360 330,290 350,210 C370,270 370,350 350,430 C380,350 390,270 380,190 C420,240 440,310 450,380 C440,300 410,210 350,140 C320,100 280,70 250,50 Z" />
            </svg>
            <svg
              className="absolute -right-20 -bottom-20 w-[500px] sm:w-[650px] md:w-[850px] h-auto text-[#000000] opacity-80 blur-[2px] transform rotate-180"
              viewBox="0 0 500 500"
              fill="currentColor"
            >
              <path d="M250,50 C180,120 120,220 80,320 C140,290 200,240 250,180 C230,240 200,310 150,380 C210,340 260,280 300,210 C300,280 280,350 240,420 C290,360 330,290 350,210 C370,270 370,350 350,430 C380,350 390,270 380,190 C420,240 440,310 450,380 C440,300 410,210 350,140 C320,100 280,70 250,50 Z" />
            </svg>
          </motion.div>

          {/* Soft Golden Background Aura */}
          <motion.div
            animate={{ scale: [0.9, 1.15, 0.95], opacity: [0.2, 0.35, 0.2] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
            className="pointer-events-none absolute w-[320px] sm:w-[500px] md:w-[650px] h-[320px] sm:h-[500px] md:h-[650px] rounded-full bg-[#CFA96A] opacity-25 blur-[120px]"
          />

          {/* MAIN LUXURY GIFT BAG CENTERPIECE */}
          <motion.div
            initial={{ scale: 0.82, opacity: 0, y: 35 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex flex-col items-center justify-center my-auto z-10"
          >
            {/* Shopping Bag Handles (Rope Curves) */}
            <div className="relative w-28 sm:w-36 md:w-44 h-14 sm:h-18 md:h-22 -mb-2 z-20 flex justify-center">
              <svg
                viewBox="0 0 160 80"
                className="w-full h-full text-[#CFA96A] drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]"
                fill="none"
              >
                {/* Left Rope Loop */}
                <path
                  d="M45,80 C45,20 70,10 80,10 C90,10 115,20 115,80"
                  stroke="url(#goldRopeGradient)"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
                {/* Inner Highlight Loop */}
                <path
                  d="M48,80 C48,24 71,15 80,15 C89,15 112,24 112,80"
                  stroke="#FFE6B3"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  opacity="0.8"
                />
                <defs>
                  <linearGradient id="goldRopeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F5D796" />
                    <stop offset="50%" stopColor="#CFA96A" />
                    <stop offset="100%" stopColor="#8A6B32" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* Luxury Navy Shopping Bag Body */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="relative w-[270px] sm:w-[350px] md:w-[410px] h-[310px] sm:h-[390px] md:h-[450px] bg-gradient-to-b from-[#0a203e] via-[#081a33] to-[#040e1d] rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-between border border-[#CFA96A]/35 shadow-[0_30px_70px_-15px_rgba(0,0,0,0.85),0_0_40px_rgba(207,169,106,0.15)] overflow-hidden"
            >
              {/* Bag Top Fold Crease & Metallic Trim */}
              <div className="absolute top-0 left-0 right-0 h-8 bg-[#0d2a52]/50 border-b border-[#CFA96A]/20 flex items-center justify-between px-6">
                <div className="w-2.5 h-2.5 rounded-full bg-[#CFA96A]/60 shadow-[0_0_8px_#CFA96A]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#CFA96A]/60 shadow-[0_0_8px_#CFA96A]" />
              </div>

              {/* Shimmer Light Reflection Effect */}
              <motion.div
                initial={{ x: '-150%' }}
                animate={{ x: '250%' }}
                transition={{ duration: 2.8, repeat: Infinity, repeatDelay: 1.5, ease: 'easeInOut' }}
                className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 pointer-events-none"
              />

              {/* CENTER LOGO & BRANDING INSIDE BAG */}
              <div className="flex-1 flex flex-col items-center justify-center mt-4">
                {/* Circular Gold Frame holding MINARA Logo */}
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="relative p-1.5 rounded-full bg-gradient-to-tr from-[#8A6B32] via-[#F5D796] to-[#CFA96A] shadow-[0_0_35px_rgba(207,169,106,0.4)] mb-4 sm:mb-5"
                >
                  <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-full bg-[#051429] p-2 flex items-center justify-center border border-[#051429] overflow-hidden shadow-inner">
                    <img
                      src="/logo.jpeg"
                      alt="MINARA Logo"
                      className="w-full h-full object-cover rounded-full shadow-md transform hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  {/* Outer Pulsing Gold Ring */}
                  <div className="absolute -inset-1 rounded-full border border-[#CFA96A]/30 animate-ping opacity-30 pointer-events-none" />
                </motion.div>

                {/* Brand Name Title */}
                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.4 }}
                  className="text-2xl sm:text-4xl md:text-5xl font-light text-transparent bg-clip-text bg-gradient-to-r from-[#F5D796] via-[#CFA96A] to-[#E6BE75] tracking-[0.28em] pl-2 text-center"
                  style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                >
                  MINARA
                </motion.h1>

                {/* Tagline */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.9 }}
                  transition={{ duration: 0.7, delay: 0.55 }}
                  className="text-[10px] sm:text-xs md:text-sm font-medium tracking-[0.38em] text-[#CFA96A]/90 uppercase mt-1.5 sm:mt-2 text-center"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  Luxury Gifting, Reimagined
                </motion.p>
              </div>

              {/* Bag Base Crease / Subtle Bottom Accent */}
              <div className="w-full border-t border-[#CFA96A]/15 pt-3 flex items-center justify-center">
                <span className="text-[9px] sm:text-[11px] text-[#CFA96A]/60 tracking-[0.25em] uppercase font-light">
                  ✦ Premium Collection ✦
                </span>
              </div>
            </motion.div>

            {/* Realistic Drop Shadow beneath the bag */}
            <div className="w-[230px] sm:w-[300px] md:w-[360px] h-4 bg-black/70 rounded-full blur-md -mt-2 opacity-80" />
          </motion.div>

          {/* Typing Effect / Welcome Banner */}
          <div className="relative z-10 mt-5 sm:mt-7 text-center h-8 flex items-center justify-center">
            <span
              className="text-sm sm:text-lg md:text-xl font-light text-white/90 tracking-wide drop-shadow-sm"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {typedText}
            </span>
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, ease: 'easeInOut' }}
              className="inline-block w-[2px] h-4 sm:h-5 bg-[#CFA96A] ml-1.5 rounded-full"
            />
          </div>

          {/* Bottom Luxury Progress Bar */}
          <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/5">
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 3.4, ease: 'linear' }}
              className="h-full bg-gradient-to-r from-transparent via-[#CFA96A] to-transparent shadow-[0_0_12px_#CFA96A]"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
