'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { X, Play } from 'lucide-react';
import { getTracks, type Track } from '@/lib/music';
import { useAudio } from '@/lib/audio-context';
import { ZenVisualizer } from './zen-visualizer';
import { ZenDock } from './zen-dock';
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
  const [error, setError] = useState<string | null>(null);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [albumUrl, setAlbumUrl] = useState<string | null>(null);
  const [config, setConfig] = useState<ZenConfig>(DEFAULT_ZEN_CONFIG);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const analyserLRef = useRef<AnalyserNode | null>(null);
  const analyserRRef = useRef<AnalyserNode | null>(null);
  const splitterRef = useRef<ChannelSplitterNode | null>(null);
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const elNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const connectedRef = useRef<AudioNode | null>(null);
  const tracksRef = useRef<Track[]>([]);

  const getAnalyser = useCallback(() => analyserRef.current, []);
  const getStereo = useCallback(() => ({ left: analyserLRef.current, right: analyserRRef.current }), []);

  // Load any saved visualizer config after mount (SSR-safe).
  useEffect(() => { setConfig(loadZenConfig()); }, []);

  // Hide the global music pill / theme toggle while in Zen (no distraction).
  useEffect(() => {
    setPlayerVisible(false);
    return () => setPlayerVisible(true);
  }, [setPlayerVisible]);

  useEffect(() => { tracksRef.current = getTracks(); }, []);

  // Keep the transport UI in sync with the underlying <audio> element.
  useEffect(() => {
    const el = audioElRef.current;
    if (!el) return;
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    el.addEventListener('play', onPlay);
    el.addEventListener('pause', onPause);
    return () => { el.removeEventListener('play', onPlay); el.removeEventListener('pause', onPause); };
  }, []);

  const togglePlay = useCallback(() => {
    const el = audioElRef.current;
    if (!el) return;
    if (el.paused) el.play().catch(() => {}); else el.pause();
  }, []);

  const toggleMute = useCallback(() => {
    const el = audioElRef.current;
    if (!el) return;
    el.muted = !el.muted;
    setIsMuted(el.muted);
  }, []);

  const ensureCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      const Ctx = window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new Ctx();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      analyser.smoothingTimeConstant = 0.82;
      // Per-channel monitors: split the stereo signal so the L/R gauges read
      // the actual left and right levels independently.
      const splitter = ctx.createChannelSplitter(2);
      const aL = ctx.createAnalyser(); aL.fftSize = 512; aL.smoothingTimeConstant = 0.75;
      const aR = ctx.createAnalyser(); aR.fftSize = 512; aR.smoothingTimeConstant = 0.75;
      splitter.connect(aL, 0);
      splitter.connect(aR, 1);
      audioCtxRef.current = ctx;
      analyserRef.current = analyser;
      splitterRef.current = splitter;
      analyserLRef.current = aL;
      analyserRRef.current = aR;
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
      elNodeRef.current.connect(splitterRef.current!);
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

  // Source dropdown in the dock: switch source without returning to the picker.
  const selectSource = useCallback((kind: 'playlist' | 'file' | 'radio') => {
    if (kind === 'playlist') playSongs();
    else if (kind === 'radio') { setAlbumUrl(null); playElement(RADIO[0].url, `Radio · ${RADIO[0].name}`); }
    else fileInputRef.current?.click();
  }, [playSongs, playElement]);

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
  const chromeShown = controlsVisible;
  // On the landing screen the plasma is a subtle dark-grey wash; once a source
  // is playing the saved/vivid config takes over.
  const vizConfig = showPicker ? { ...config, mode: 'plasma', color: '#222222' } : config;

  return (
    <main className="fixed inset-0 bg-black overflow-hidden">
      <ZenVisualizer getAnalyser={getAnalyser} imageUrl={albumUrl} config={vizConfig} />
      <audio ref={audioElRef} crossOrigin="anonymous" />
      <input ref={fileInputRef} type="file" accept="audio/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) playFile(f); }} />

      {/* Exit — auto-hiding (only while a source is playing; the picker has its own header) */}
      <div className={`fixed top-6 left-6 z-40 transition-opacity duration-500 ${!showPicker && chromeShown ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <Link href="/" aria-label="Back home" className="flex items-center justify-center w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur">
          <X className="w-5 h-5" />
        </Link>
      </div>

      {/* Bottom dock — transport + visualizer controls (only while a source is active) */}
      {!showPicker && (
        <ZenDock
          sourceLabel={sourceLabel}
          isPlaying={isPlaying}
          isMuted={isMuted}
          hasAudio={sourceLabel !== null}
          onTogglePlay={togglePlay}
          onToggleMute={toggleMute}
          onChange={() => setShowPicker(true)}
          config={config}
          onChangeConfig={patchConfig}
          onSave={() => saveZenConfig(config)}
          onReset={() => { setConfig(DEFAULT_ZEN_CONFIG); saveZenConfig(DEFAULT_ZEN_CONFIG); }}
          visible={chromeShown}
          getAnalyser={getAnalyser}
          getStereo={getStereo}
          onSelectSource={selectSource}
        />
      )}

      {/* Source picker — "Lounge" landing: caption, three big options, lawn illustration */}
      {showPicker && (
        <div className="fixed inset-0 z-10 flex flex-col overflow-hidden">
          {/* Top nav */}
          <header className="relative z-10 flex items-center justify-between px-8 py-6 text-sm font-sans text-white">
            <Link href="/" className="underline decoration-transparent underline-offset-4 transition-colors duration-200 hover:text-[#2CA152] hover:decoration-[#2CA152]">Back</Link>
            <span className="absolute left-1/2 -translate-x-1/2 opacity-90">Lounge</span>
            <span aria-hidden className="w-10" />
          </header>

          <div className="relative flex-1 flex flex-col items-center justify-start md:justify-center overflow-hidden pt-[5vh] md:pt-0">
            {/* Caption + menu — top on mobile so the options clear the artwork; centred on desktop. */}
            <div className="relative z-10 w-full max-w-4xl px-6">
              <p className="text-center font-mono text-xs uppercase tracking-[0.25em] text-white/50 mb-5">
                me and my boys are hanging out in the lawn, waiting for you to play something
              </p>

              <nav className="divide-y" style={{ borderColor: 'rgba(237,234,224,0.15)' }}>
                {/* My Playlist — the curated songs */}
                <button onClick={playSongs} className="group relative flex w-full items-center justify-center py-8">
                  <Play className="absolute left-1 w-7 h-7 fill-current text-[#2CA152] opacity-0 transition-opacity group-hover:opacity-100" />
                  <span className="font-pixel text-4xl md:text-6xl text-white transition-colors group-hover:text-[#2CA152]">My Playlist</span>
                </button>

                {/* Pick Your Own — share / upload your own audio */}
                <label className="group relative flex w-full items-center justify-center py-8 cursor-pointer">
                  <Play className="absolute left-1 w-7 h-7 fill-current text-[#2CA152] opacity-0 transition-opacity group-hover:opacity-100" />
                  <span className="font-pixel text-4xl md:text-6xl text-white transition-colors group-hover:text-[#2CA152]">Pick Your Own</span>
                  <input type="file" accept="audio/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) playFile(f); }} />
                </label>

                {/* Lo-Fi World Radio */}
                <button onClick={() => { setAlbumUrl(null); playElement(RADIO[0].url, `Radio · ${RADIO[0].name}`); }} className="group relative flex w-full items-center justify-center py-8">
                  <Play className="absolute left-1 w-7 h-7 fill-current text-[#2CA152] opacity-0 transition-opacity group-hover:opacity-100" />
                  <span className="font-pixel text-4xl md:text-6xl text-white transition-colors group-hover:text-[#2CA152]">Lo-Fi World Radio</span>
                </button>
              </nav>

              {error && <p className="text-red-400 text-sm mt-6 text-center">{error}</p>}
            </div>

            {/* Lawn illustration — pinned to the bottom. On mobile it sits IN FRONT
                of the menu (z-20) and is sized so it rises just far enough to mask
                the bottom of the last option a touch; on desktop it's behind the
                centred menu (z-0). Big + edge-cropped on mobile. */}
            <img
              src="/zen/me-and-my-boys.svg"
              alt="Me and my boys hanging out in the lawn with a record player"
              className="pointer-events-none select-none absolute bottom-0 left-1/2 -translate-x-1/2 max-w-none w-[175vw] md:w-[min(1000px,80vw)] z-20 md:z-0"
            />
          </div>
        </div>
      )}
    </main>
  );
}
