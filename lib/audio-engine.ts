'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

export interface EQGains {
  bass: number;
  mid: number;
  treble: number;
}

export interface AudioEngine {
  audioRef: React.RefObject<HTMLAudioElement | null>;
  analyserRef: React.RefObject<AnalyserNode | null>;
  freqData: Uint8Array;
  timeData: Uint8Array;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  eq: EQGains;
  setVolume: (v: number) => void;
  setEQ: (patch: Partial<EQGains>) => void;
  play: () => Promise<void>;
  pause: () => void;
  togglePlayPause: () => void;
  seek: (t: number) => void;
  loadAndPlay: (url: string) => Promise<void>;
}

const FFT_SIZE = 2048;

export function useAudioEngine(): AudioEngine {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const bassFilterRef = useRef<BiquadFilterNode | null>(null);
  const midFilterRef = useRef<BiquadFilterNode | null>(null);
  const trebleFilterRef = useRef<BiquadFilterNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const freqDataRef = useRef<Uint8Array>(new Uint8Array(FFT_SIZE / 2));
  const timeDataRef = useRef<Uint8Array>(new Uint8Array(FFT_SIZE));

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.85);
  const [eq, setEQState] = useState<EQGains>({ bass: 0, mid: 0, treble: 0 });

  // Lazy-init the WebAudio graph on first interaction.
  const ensureGraph = useCallback(() => {
    if (typeof window === 'undefined') return;
    if (ctxRef.current) return;
    const audio = audioRef.current;
    if (!audio) return;

    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    const source = ctx.createMediaElementSource(audio);

    const bass = ctx.createBiquadFilter();
    bass.type = 'lowshelf';
    bass.frequency.value = 200;
    bass.gain.value = 0;

    const mid = ctx.createBiquadFilter();
    mid.type = 'peaking';
    mid.frequency.value = 1000;
    mid.Q.value = 0.7;
    mid.gain.value = 0;

    const treble = ctx.createBiquadFilter();
    treble.type = 'highshelf';
    treble.frequency.value = 4000;
    treble.gain.value = 0;

    const gain = ctx.createGain();
    gain.gain.value = volume;

    const analyser = ctx.createAnalyser();
    analyser.fftSize = FFT_SIZE;
    analyser.smoothingTimeConstant = 0.78;

    source.connect(bass);
    bass.connect(mid);
    mid.connect(treble);
    treble.connect(gain);
    gain.connect(analyser);
    analyser.connect(ctx.destination);

    ctxRef.current = ctx;
    sourceRef.current = source;
    bassFilterRef.current = bass;
    midFilterRef.current = mid;
    trebleFilterRef.current = treble;
    gainRef.current = gain;
    analyserRef.current = analyser;
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTime = () => setCurrentTime(audio.currentTime);
    const onMeta = () => setDuration(audio.duration || 30);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('loadedmetadata', onMeta);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('loadedmetadata', onMeta);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
    };
  }, []);

  const play = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;
    ensureGraph();
    if (ctxRef.current?.state === 'suspended') {
      await ctxRef.current.resume();
    }
    try {
      await audio.play();
    } catch (e) {
      console.error('[audio] play error', e);
    }
  }, [ensureGraph]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const togglePlayPause = useCallback(() => {
    if (isPlaying) pause();
    else play();
  }, [isPlaying, play, pause]);

  const seek = useCallback((t: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, Math.min(audio.duration || 30, t));
  }, []);

  const loadAndPlay = useCallback(
    async (url: string) => {
      const audio = audioRef.current;
      if (!audio) return;
      audio.src = url;
      audio.load();
      await play();
    },
    [play]
  );

  const setVolume = useCallback((v: number) => {
    const clamped = Math.max(0, Math.min(1, v));
    setVolumeState(clamped);
    if (gainRef.current) gainRef.current.gain.value = clamped;
  }, []);

  const setEQ = useCallback((patch: Partial<EQGains>) => {
    setEQState((prev) => {
      const next = { ...prev, ...patch };
      if (bassFilterRef.current) bassFilterRef.current.gain.value = next.bass;
      if (midFilterRef.current) midFilterRef.current.gain.value = next.mid;
      if (trebleFilterRef.current) trebleFilterRef.current.gain.value = next.treble;
      return next;
    });
  }, []);

  return {
    audioRef,
    analyserRef,
    freqData: freqDataRef.current,
    timeData: timeDataRef.current,
    isPlaying,
    currentTime,
    duration,
    volume,
    eq,
    setVolume,
    setEQ,
    play,
    pause,
    togglePlayPause,
    seek,
    loadAndPlay,
  };
}
