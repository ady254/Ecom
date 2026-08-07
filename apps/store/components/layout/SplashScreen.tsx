'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Synthesizes a luxury crystal bell "ting" chime using Web Audio API.
 * Frequency tuned to ~1568Hz (G6) with harmonic overtones and smooth exponential decay.
 */
function playLuxuryChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;

    // Primary fundamental oscillator (Crystal Chime G6)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(1567.98, now); // G6 note
    gain1.gain.setValueAtTime(0.25, now);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

    // Harmonic overtone oscillator (Ethereal shimmer G7)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(3135.96, now); // G7 octave overtone
    gain2.gain.setValueAtTime(0.12, now);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);

    // Subtle metallic resonance
    const osc3 = ctx.createOscillator();
    const gain3 = ctx.createGain();
    osc3.type = 'triangle';
    osc3.frequency.setValueAtTime(2349.32, now); // D7 note
    gain3.gain.setValueAtTime(0.05, now);
    gain3.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);

    // Master volume & bandpass filter for clarity
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2000, now);
    filter.Q.setValueAtTime(1.2, now);

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(1.0, now);

    osc1.connect(gain1);
    osc2.connect(gain2);
    osc3.connect(gain3);

    gain1.connect(filter);
    gain2.connect(filter);
    gain3.connect(filter);

    filter.connect(masterGain);
    masterGain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc3.start(now);

    osc1.stop(now + 1.3);
    osc2.stop(now + 1.3);
    osc3.stop(now + 1.3);
  } catch (err) {
    // Ignore autoplay restriction failures gracefully
    console.debug('Audio chime playback omitted by browser policy:', err);
  }
}

export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if splash screen was already shown in this session
    const hasSeenSplash = sessionStorage.getItem('minara_seen_splash');
    
    if (!hasSeenSplash) {
      setIsVisible(true);
      sessionStorage.setItem('minara_seen_splash', 'true');

      // Play the signature "ting" sound after a small delay matching reveal animation
      const soundTimer = setTimeout(() => {
        playLuxuryChime();
      }, 250);

      // Auto dismiss after 2.4 seconds
      const hideTimer = setTimeout(() => {
        setIsVisible(false);
      }, 2400);

      return () => {
        clearTimeout(soundTimer);
        clearTimeout(hideTimer);
      };
    }
  }, []);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.03, filter: 'blur(8px)' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#0a192f] text-white overflow-hidden select-none"
        >
          {/* Ambient Gold Radial Glow */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute w-[500px] h-[500px] rounded-full bg-[#CFA96A] opacity-10 blur-3xl"
          />

          {/* Golden Geometric Ornament */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0, rotate: -45 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="mb-6 flex items-center justify-center gap-3"
          >
            <span className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[#CFA96A]/60" />
            <span className="text-[#CFA96A] text-lg leading-none">✦</span>
            <span className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[#CFA96A]/60" />
          </motion.div>

          {/* Brand Name with expanding letterSpacing effect */}
          <motion.div
            initial={{ opacity: 0, y: 15, letterSpacing: '0.15em' }}
            animate={{ opacity: 1, y: 0, letterSpacing: '0.35em' }}
            transition={{ duration: 1.1, ease: 'easeOut', delay: 0.15 }}
            className="text-center px-4"
          >
            <h1
              className="text-4xl sm:text-6xl md:text-7xl font-light text-[#CFA96A] tracking-[0.3em] pl-3"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              MINARA
            </h1>
          </motion.div>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45 }}
            className="mt-4 font-heading italic text-white/75 text-sm sm:text-base md:text-lg tracking-wider text-center max-w-xs sm:max-w-md px-4"
          >
            Gifts rooted in faith, made with love
          </motion.p>

          {/* Minimal shimmer progress bar */}
          <div className="absolute bottom-12 w-36 sm:w-48 h-[2px] bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ duration: 1.8, ease: 'easeInOut', repeat: Infinity }}
              className="w-full h-full bg-gradient-to-r from-transparent via-[#CFA96A] to-transparent"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
