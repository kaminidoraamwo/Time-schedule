import { useState, useCallback, useRef } from 'react';

export const useSound = () => {
    const [isMuted, setIsMuted] = useState(false);
    const audioContextRef = useRef<AudioContext | null>(null);

    // Initialize AudioContext on user interaction (required by browsers)
    const initAudio = useCallback(() => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        if (audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume();
        }
    }, []);

    const playTone = useCallback((frequency: number, type: OscillatorType, duration: number, volume: number = 0.1) => {
        if (isMuted || !audioContextRef.current) return;

        const ctx = audioContextRef.current;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(frequency, ctx.currentTime);

        gain.gain.setValueAtTime(volume, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + duration);
    }, [isMuted]);

    const playChime = useCallback(() => {
        // "Pon" sound (Low, soft)
        playTone(440, 'sine', 0.5, 0.1); // A4
    }, [playTone]);

    const playFinish = useCallback(() => {
        // "Pirorin" sound (High, bright sequence)
        if (isMuted || !audioContextRef.current) return;



        // First note
        setTimeout(() => playTone(880, 'sine', 0.1, 0.1), 0); // A5
        // Second note
        setTimeout(() => playTone(1108, 'sine', 0.3, 0.1), 100); // C#6
    }, [playTone, isMuted]);

    const toggleMute = useCallback(() => {
        setIsMuted(prev => !prev);
    }, []);

    return {
        isMuted,
        toggleMute,
        playChime,
        playFinish,
        initAudio
    };
};
