import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

const SoundContext = createContext();

export const useSound = () => useContext(SoundContext);

export const SoundContextProvider = ({ children }) => {
  const [muted, setMuted] = useState(false);
  const audioCtxRef = useRef(null);

  // Initialize Audio Context on first user interaction to comply with browser autoplay policies
  const initAudio = () => {
    if (!audioCtxRef.current) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtxRef.current = new AudioContext();
    } else if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const playTone = (frequency, duration, type = 'square', startTime = 0) => {
    if (muted || !audioCtxRef.current) return;
    
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime + startTime);

    gain.gain.setValueAtTime(0.1, ctx.currentTime + startTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime + startTime);
    osc.stop(ctx.currentTime + startTime + duration);
  };

  // --- PRESETS (HARMONIZED IN C MAJOR) ---

  const playCountdown = (isGo = false) => {
    initAudio(); 
    if (isGo) {
      // "GO!" - C Major Chord (C5 - E5 - G5)
      // Using 'triangle' for a sound that bridges 8-bit and clean bell
      playTone(523.25, 0.6, 'triangle', 0);   // C5
      playTone(659.25, 0.6, 'triangle', 0.1); // E5
      playTone(783.99, 0.8, 'triangle', 0.2); // G5 (Longer trail)
    } else {
      // Countdown Numbers - Climbing up the scale
      // G4 -> A4 -> B4 leading to C5
      // Using 'square' but very short for a "tick" feel, or 'triangle' for soft.
      // Let's use 'triangle' to match the bell.
      playTone(392.00, 0.1, 'triangle'); // G4 (High enough to cut through)
    }
  };

  const playStopAlarm = () => {
    initAudio();
    if (muted || !audioCtxRef.current) return;
    
    // "Little Bell" / Campanita Effect (Matches C Major Key)
    const ctx = audioCtxRef.current;
    
    // Fundamental: C6 (Two octaves above Middle C) - Very bright
    const fundamental = 1046.5; 

    // Helper to create a partial (harmonic) with "Gamey" decay
    const playPartial = (freqMultiplier, gainValue, duration) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        // Mixed Sine/Triangle for a "16-bit Console Bell" feel
        osc.type = freqMultiplier === 1 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(fundamental * freqMultiplier, ctx.currentTime);
        
        gainNode.gain.setValueAtTime(0, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(gainValue, ctx.currentTime + 0.01); 
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        osc.start();
        osc.stop(ctx.currentTime + duration);
    };

    // 1. Fundamental (The Body)
    playPartial(1.0, 0.3, 1.5);

    // 2. The Shine (Harmonic)
    playPartial(2.0, 0.1, 1.0);

    // 3. The Sparkle (High detail)
    playPartial(3.0, 0.05, 0.5);
  };

  const playClick = () => {
    initAudio();
    playTone(300, 0.05, 'triangle');
  };

  const playTick = (timeLeft) => {
      initAudio();
      if (muted || !audioCtxRef.current) return;
      
      const ctx = audioCtxRef.current;
      const t = ctx.currentTime;
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // "Subtle Focus" Effect
      // Users found previous clicks too distracting. 
      // Goal: Barely perceptible "pock" sound. Clean sine wave, low pitch, low volume.
      
      const isSuspense = timeLeft <= 10;
      const isTick = timeLeft % 2 === 0;

      // Frequencies: Low and warm (Wooden feel)
      // Tick: 400Hz, Tock: 300Hz (Much lower than before)
      const baseFreq = isSuspense ? 600 : (isTick ? 400 : 300); 
      
      osc.type = 'sine'; // Sine is the smoothest/softest wave
      
      // Pitch Envelope: Very slight drop to give it a "round" shape without being a "chirp"
      osc.frequency.setValueAtTime(baseFreq, t);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.8, t + 0.05);

      // Volume Envelope: VERY QUIET and Smooth
      // Peak volume reduced significantly (0.05)
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(isSuspense ? 0.1 : 0.05, t + 0.01); // Soft attack
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1); // Smooth release, no sudden stop

      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(t);
      osc.stop(t + 0.1);
  };


  const toggleMute = () => {
    setMuted(prev => !prev);
  };

  return (
    <SoundContext.Provider value={{ muted, toggleMute, playCountdown, playStopAlarm, playClick, playTick }}>
      {children}
    </SoundContext.Provider>
  );
};
