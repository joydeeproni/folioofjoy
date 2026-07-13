'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { X, Settings, Play } from 'lucide-react';
import { getTracks, type Track } from '@/lib/music';
import { useAudio } from '@/lib/audio-context';
import { ZenVisualizer } from './zen-visualizer';
import { ZenControls } from './zen-controls';
import { DEFAULT_ZEN_CONFIG, loadZenConfig, saveZenConfig, type ZenConfig } from './zen-config';

const RADIO = [
  { name: 'bigFM Lo-Fi Focus', url: 'https://stream.bigfm.de/exlofifocus/mp3-192/' },
  { name: 'StreamAfrica Lo-Fi', url: 'https://play.streamafrica.net/lofiradio' },
  { name: 'Laut.fm Lo-Fi', url: 'https://lofi.stream.laut.fm/lofi' },
  { name: 'Klassik Beats', url: 'https://stream.klassikradio.de/beats-national/mp3-192/' },
];

export function ZenStage() {
  const { setPlayerVisible } = useAudio();
  const [sourceLabel, setSourceLabel] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(true);
  const [showControls, setShowControls] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [albumUrl, setAlbumUrl] = useState<string | null>(null);
  const [config, setConfig] = useState<ZenConfig>(DEFAULT_ZEN_CONFIG);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const elNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const connectedRef = useRef<AudioNode | null>(null);
  const tracksRef = useRef<Track[]>([]);

  const getAnalyser = useCallback(() => analyserRef.current, []);

  // Load any saved visualizer config after mount (SSR-safe).
  useEffect(() => { setConfig(loadZenConfig()); }, []);

  // Hide the global music pill / theme toggle while in Zen (no distraction).
  useEffect(() => {
    setPlayerVisible(false);
    return () => setPlayerVisible(true);
  }, [setPlayerVisible]);

  useEffect(() => { tracksRef.current = getTracks(); }, []);

  const ensureCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      const Ctx = window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new Ctx();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      analyser.smoothingTimeConstant = 0.82;
      audioCtxRef.current = ctx;
      analyserRef.current = analyser;
    }
    if (audioCtxRef.current.state === 'suspended') void audioCtxRef.current.resume();
    return audioCtxRef.current;
  }, []);

  const disconnectCurrent = useCallback(() => {
    if (connectedRef.current) { try { connectedRef.current.disconnect(); } catch {} connectedRef.current = null; }
    if (streamRef.current) { streamRef.current.getTracks().forEach((t) => t.stop()); streamRef.current = null; }
    if (audioElRef.current) audioElRef.current.pause();
  }, []);

  const playElement = useCallback((url: string, label: string, onEnded?: () => void) => {
    const ctx = ensureCtx();
    disconnectCurrent();
    const el = audioElRef.current!;
    el.crossOrigin = 'anonymous';
    el.src = url;
    el.onended = onEnded ?? null;
    if (!elNodeRef.current) {
      elNodeRef.current = ctx.createMediaElementSource(el);
      elNodeRef.current.connect(ctx.destination);
    }
    elNodeRef.current.connect(analyserRef.current!);
    connectedRef.current = elNodeRef.current;
    el.play().catch(() => setError('Could not play — autoplay blocked or the stream is unavailable.'));
    setSourceLabel(label);
    setShowPicker(false);
    setError(null);
  }, [ensureCtx, disconnectCurrent]);

  const playSongs = useCallback(() => {
    const tracks = tracksRef.current;
    if (!tracks.length) { setError('No songs available.'); return; }
    let i = 0;
    const playAt = (idx: number) => {
      i = ((idx % tracks.length) + tracks.length) % tracks.length;
      const tr = tracks[i];
      setAlbumUrl(tr.album?.images?.[0]?.url ?? null);
      if (tr.preview_url) playElement(tr.preview_url, `Our songs · ${tr.name}`, () => playAt(i + 1));
    };
    playAt(0);
  }, [playElement]);

  const playFile = useCallback((file: File) => {
    setAlbumUrl(null);
    playElement(URL.createObjectURL(file), `File · ${file.name}`);
  }, [playElement]);

  useEffect(() => () => {
    disconnectCurrent();
    void audioCtxRef.current?.close();
  }, [disconnectCurrent]);

  // Auto-hide the chrome when idle.
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const show = () => {
      setControlsVisible(true);
      clearTimeout(timer);
      timer = setTimeout(() => setControlsVisible(false), 2500);
    };
    show();
    window.addEventListener('mousemove', show);
    window.addEventListener('touchstart', show);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('mousemove', show);
      window.removeEventListener('touchstart', show);
    };
  }, []);

  const patchConfig = (patch: Partial<ZenConfig>) => setConfig((c) => ({ ...c, ...patch }));
  const chromeShown = controlsVisible || showControls;
  // On the landing screen the plasma is a subtle dark-grey wash; once a source
  // is playing the saved/vivid config takes over.
  const vizConfig = showPicker ? { ...config, mode: 'plasma', color: '#222222' } : config;

  return (
    <main className="fixed inset-0 bg-black overflow-hidden">
      <ZenVisualizer getAnalyser={getAnalyser} imageUrl={albumUrl} config={vizConfig} />
      <audio ref={audioElRef} crossOrigin="anonymous" />

      {/* Exit — auto-hiding (only while a source is playing; the picker has its own header) */}
      <div className={`fixed top-6 left-6 z-20 transition-opacity duration-500 ${!showPicker && chromeShown ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <Link href="/" aria-label="Back home" className="flex items-center justify-center w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur">
          <X className="w-5 h-5" />
        </Link>
      </div>

      {/* Top-right chrome: source label, change, settings — auto-hiding */}
      <div className={`fixed top-6 right-6 z-20 flex items-center gap-3 transition-opacity duration-500 ${!showPicker && chromeShown ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        {sourceLabel && !showPicker && (
          <>
            <span className="text-xs font-mono uppercase tracking-widest text-white/60">{sourceLabel}</span>
            <button onClick={() => setShowPicker(true)} className="text-xs font-mono uppercase tracking-widest text-white/60 hover:text-white underline underline-offset-4">change</button>
          </>
        )}
        <button onClick={() => setShowControls((v) => !v)} aria-label="Visualizer settings" className="flex items-center justify-center w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur">
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* Controls panel */}
      {showControls && (
        <div className="fixed top-20 right-6 z-30">
          <ZenControls
            config={config}
            onChange={patchConfig}
            onSave={() => saveZenConfig(config)}
            onReset={() => { setConfig(DEFAULT_ZEN_CONFIG); saveZenConfig(DEFAULT_ZEN_CONFIG); }}
            onClose={() => setShowControls(false)}
          />
        </div>
      )}

      {/* Source picker — "Lounge" landing: caption, three big options, lawn illustration */}
      {showPicker && (
        <div className="fixed inset-0 z-10 flex flex-col overflow-hidden">
          {/* Top nav */}
          <header className="relative z-10 flex items-center justify-between px-8 py-6 text-sm font-sans text-white">
            <Link href="/" className="opacity-90 hover:opacity-100 transition-opacity">Back</Link>
            <span className="absolute left-1/2 -translate-x-1/2 opacity-90">Lounge</span>
            <span aria-hidden className="w-10" />
          </header>

          <div className="relative flex-1">
            {/* Lawn illustration — pinned bottom-centre, behind the menu */}
            <img
              src="/zen/me-and-my-boys.svg"
              alt="Me and my boys hanging out in the lawn with a record player"
              className="pointer-events-none select-none absolute bottom-0 left-1/2 -translate-x-1/2 w-[min(1000px,82vw)] max-w-none"
            />

            {/* Caption + menu */}
            <div className="relative z-10 mx-auto w-full max-w-[980px] px-6 pt-[5vh]">
              <p className="text-center font-mono text-xs uppercase tracking-[0.25em] text-white/50 mb-16">
                me and my boys are hanging out in the lawn, waiting for you to play something
              </p>

              <nav className="divide-y" style={{ borderColor: 'rgba(237,234,224,0.15)' }}>
                {/* Let me play something — upload your own audio */}
                <label className="group relative flex w-full items-center justify-center py-8 cursor-pointer">
                  <Play className="absolute left-1 w-7 h-7 fill-current text-[#2CA152] opacity-0 transition-opacity group-hover:opacity-100" />
                  <span className="font-pixel text-4xl md:text-6xl text-white transition-colors group-hover:text-[#2CA152]">Let me play something</span>
                  <input type="file" accept="audio/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) playFile(f); }} />
                </label>

                {/* Show me your playlist — the curated songs */}
                <button onClick={playSongs} className="group relative flex w-full items-center justify-center py-8">
                  <Play className="absolute left-1 w-7 h-7 fill-current text-[#2CA152] opacity-0 transition-opacity group-hover:opacity-100" />
                  <span className="font-pixel text-4xl md:text-6xl text-white transition-colors group-hover:text-[#2CA152]">Show me your playlist</span>
                </button>

                {/* Just play some lo-fi radio */}
                <button onClick={() => { setAlbumUrl(null); playElement(RADIO[0].url, `Radio · ${RADIO[0].name}`); }} className="group relative flex w-full items-center justify-center py-8">
                  <Play className="absolute left-1 w-7 h-7 fill-current text-[#2CA152] opacity-0 transition-opacity group-hover:opacity-100" />
                  <span className="font-pixel text-4xl md:text-6xl text-white transition-colors group-hover:text-[#2CA152]">Just play some lo-fi radio</span>
                </button>
              </nav>

              {error && <p className="text-red-400 text-sm mt-6 text-center">{error}</p>}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
