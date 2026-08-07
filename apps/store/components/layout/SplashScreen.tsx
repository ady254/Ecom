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
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
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
    const hasSeen = sessionStorage.getItem('minara_splash_seen_v3');
    
    if (!hasSeen) {
      setIsVisible(true);
      sessionStorage.setItem('minara_splash_seen_v3', 'true');

      // Global listeners to unlock Web Audio context on any subtle user interaction
      const unlockAudioEvents = ['pointerdown', 'touchstart', 'mousemove', 'keydown', 'scroll'];
      const preWarmAudio = () => {
        try {
          const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
          if (AudioCtx) {
            const tempCtx = new AudioCtx();
            if (tempCtx.state === 'suspended') tempCtx.resume();
          }
        } catch {}
      };
      unlockAudioEvents.forEach((evt) => window.addEventListener(evt, preWarmAudio, { once: true }));

      // Typing Effect Logic
      const typingInterval = setInterval(() => {
        if (typingIndexRef.current < FULL_TEXT.length) {
          setTypedText(FULL_TEXT.slice(0, typingIndexRef.current + 1));
          typingIndexRef.current += 1;
        } else {
          setIsTypingDone(true);
          clearInterval(typingInterval);

          // AUTOMATIC CHIME SOUND: Automatically plays right when the typing finishes & splash screen reveals!
          setTimeout(() => {
            playCrystalTingSound(1.2);
          }, 200);
        }
      }, 45); // 45ms per character for silky smooth typing speed

      // Auto-dismiss splash screen after presentation completes (~3.2s total)
      const dismissTimer = setTimeout(() => {
        setIsVisible(false);
      }, 3200);

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
          exit={{ opacity: 0, scale: 1.04, filter: 'blur(12px)' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#07162c] text-white overflow-hidden select-none pointer-events-none"
        >
          {/* Ambient Lighting Layers */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#1a3a5c]/40 via-[#07162c]/90 to-[#030a14]" />
          
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.12, 0.2, 0.12] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="pointer-events-none absolute w-[600px] h-[600px] rounded-full bg-[#CFA96A] opacity-15 blur-[120px]"
          />

          {/* Golden House Ornament & Glowing Emblem */}
          <motion.div
            initial={{ scale: 0.6, opacity: 0, y: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="relative mb-6 flex items-center justify-center"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border border-[#CFA96A]/40 bg-[#CFA96A]/10 backdrop-blur-md flex items-center justify-center shadow-[0_0_50px_rgba(207,169,106,0.3)]">
              <span className="text-[#CFA96A] text-2xl sm:text-3xl font-light leading-none">✦</span>
            </div>
            <div className="absolute inset-0 rounded-full border border-[#CFA96A]/20 animate-ping opacity-25" />
          </motion.div>

          {/* MINARA Logo Heading */}
          <motion.div
            initial={{ opacity: 0, y: 12, letterSpacing: '0.2em' }}
            animate={{ opacity: 1, y: 0, letterSpacing: '0.35em' }}
            transition={{ duration: 1.0, ease: 'easeOut', delay: 0.2 }}
            className="text-center px-4 mb-3"
          >
            <h1
              className="text-3xl sm:text-5xl md:text-6xl font-light text-[#CFA96A] tracking-[0.35em] pl-3"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              MINARA
            </h1>
          </motion.div>

          {/* Typing Effect: "Welcome to MINARA Gifting Store" */}
          <div className="h-8 sm:h-10 flex items-center justify-center px-4 text-center">
            <span
              className="text-base sm:text-xl md:text-2xl font-light text-white/90 tracking-wide"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {typedText}
            </span>
            {/* Blinking Cursor */}
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut' }}
              className="inline-block w-[2px] h-5 sm:h-6 bg-[#CFA96A] ml-1.5 rounded-full"
            />
          </div>

          {/* Subtext Fade-in after typing */}
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: isTypingDone ? 1 : 0, y: isTypingDone ? 0 : 8 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="mt-3 font-heading italic text-white/60 text-xs sm:text-sm md:text-base tracking-wider text-center max-w-xs sm:max-w-md px-4"
          >
            Gifts rooted in faith, made with love — delivered across India.
          </motion.p>

          {/* Top Progress Line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/5">
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 3.2, ease: 'linear' }}
              className="h-full bg-gradient-to-r from-transparent via-[#CFA96A] to-transparent"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
