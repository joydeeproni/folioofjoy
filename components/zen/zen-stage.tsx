'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { X, Settings } from 'lucide-react';
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

const BTN =
  'px-4 py-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-sans transition-colors text-left';

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

  const useStream = useCallback((stream: MediaStream, label: string) => {
    const ctx = ensureCtx();
    disconnectCurrent();
    streamRef.current = stream;
    const node = ctx.createMediaStreamSource(stream);
    node.connect(analyserRef.current!);
    connectedRef.current = node;
    setAlbumUrl(null);
    setSourceLabel(label);
    setShowPicker(false);
    setError(null);
  }, [ensureCtx, disconnectCurrent]);

  const useMic = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      useStream(stream, 'Microphone');
    } catch { setError('Microphone permission was denied.'); }
  }, [useStream]);

  const useSystem = useCallback(async () => {
    try {
      const md = navigator.mediaDevices as MediaDevices & {
        getDisplayMedia: (c: { video: boolean; audio: boolean }) => Promise<MediaStream>;
      };
      const stream = await md.getDisplayMedia({ video: true, audio: true });
      if (!stream.getAudioTracks().length) {
        stream.getTracks().forEach((t) => t.stop());
        setError('No system audio shared — pick a tab/window and tick "Share tab audio".');
        return;
      }
      stream.getVideoTracks().forEach((t) => t.stop());
      useStream(stream, 'System audio');
    } catch { setError('System-audio capture was cancelled or is unsupported here.'); }
  }, [useStream]);

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

  return (
    <main className="fixed inset-0 bg-black overflow-hidden">
      <ZenVisualizer getAnalyser={getAnalyser} imageUrl={albumUrl} config={config} />
      <audio ref={audioElRef} crossOrigin="anonymous" />

      {/* Exit — auto-hiding */}
      <div className={`fixed top-6 left-6 z-20 transition-opacity duration-500 ${chromeShown ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <Link href="/" aria-label="Back home" className="flex items-center justify-center w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur">
          <X className="w-5 h-5" />
        </Link>
      </div>

      {/* Top-right chrome: source label, change, settings — auto-hiding */}
      <div className={`fixed top-6 right-6 z-20 flex items-center gap-3 transition-opacity duration-500 ${chromeShown ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
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

      {/* Source picker — no blur; the slow plasma shows through behind it */}
      {showPicker && (
        <div
          className="fixed inset-0 z-10 flex items-center justify-center"
          onClick={() => { if (sourceLabel) setShowPicker(false); }}
        >
          <div className="w-full max-w-md px-8" onClick={(e) => e.stopPropagation()}>
            <p className="font-pixel text-4xl mb-8 text-center text-white">zen</p>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={playSongs} className={BTN}>Our songs</button>
              <label className={`${BTN} cursor-pointer`}>
                Upload file
                <input type="file" accept="audio/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) playFile(f); }} />
              </label>
              <button onClick={useMic} className={BTN}>Microphone</button>
              <button onClick={useSystem} className={BTN}>System audio</button>
            </div>
            <p className="text-xs font-mono uppercase tracking-widest text-white/40 mt-6 mb-2">Radio</p>
            <div className="grid grid-cols-2 gap-3">
              {RADIO.map((r) => (
                <button key={r.url} onClick={() => { setAlbumUrl(null); playElement(r.url, `Radio · ${r.name}`); }} className={BTN}>{r.name}</button>
              ))}
            </div>
            {error && <p className="text-red-400 text-sm mt-4 text-center">{error}</p>}
          </div>
        </div>
      )}
    </main>
  );
}
