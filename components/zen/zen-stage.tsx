'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { BackLink } from '@/components/back-link';
import { CircleButton } from '@/components/circle-button';
import { getTracks, type Track } from '@/lib/music';
import { useAudio } from '@/lib/audio-context';
import { ZenVisualizer } from './zen-visualizer';
import { ZenDock } from './zen-dock';
import { DEFAULT_ZEN_CONFIG, loadZenConfig, saveZenConfig, type ZenConfig } from './zen-config';

// Writings-index palette — the picker mirrors that page's typography and rows.
const PICKER_FG = '#EDEAE0';
const PICKER_RULE = 'rgba(237,234,224,0.15)';

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

      {/* Exit — the sitewide BACK disc, auto-hiding with the rest of the chrome
          (only while a source is playing; the picker mounts its own BackLink) */}
      <div className={`fixed top-[calc(1.25rem+var(--sat))] left-[calc(1.25rem+var(--sal))] z-40 transition-opacity duration-500 ${!showPicker && chromeShown ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <CircleButton label="BACK" arcText="BACK TO HOME" href="/" />
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

      {/* Source picker — "Lounge" landing, styled like the writings index:
          small mono label up top, numbered font-sans rows staggering in. */}
      {showPicker && (
        <div className="fixed inset-0 z-10 overflow-y-auto px-8 md:px-16 py-10" style={{ color: PICKER_FG }}>
          <BackLink />
          <span className="fixed top-[calc(1.5rem+var(--sat))] left-1/2 -translate-x-1/2 z-10 text-sm font-sans opacity-90">Lounge</span>

          <div className="relative z-10 mx-auto w-full max-w-4xl pt-28">
            <p className="mb-16 font-mono uppercase tracking-[0.25em] text-xs">play something</p>

            <ul className="divide-y" style={{ borderColor: PICKER_RULE }}>
              {/* My Playlist — the curated songs */}
              <li className="animate-row-in" style={{ animationDelay: '0ms' }}>
                <button onClick={playSongs} className="group flex w-full items-baseline gap-6 py-8 text-left">
                  <span className="shrink-0 font-pixel text-sm" style={{ opacity: 0.5 }}>01</span>
                  <span className="font-sans text-4xl md:text-6xl tracking-tight transition-opacity group-hover:opacity-70">My Playlist</span>
                </button>
              </li>

              {/* Pick Your Own — share / upload your own audio */}
              <li className="animate-row-in" style={{ animationDelay: '45ms' }}>
                <label className="group flex w-full items-baseline gap-6 py-8 cursor-pointer">
                  <span className="shrink-0 font-pixel text-sm" style={{ opacity: 0.5 }}>02</span>
                  <span className="font-sans text-4xl md:text-6xl tracking-tight transition-opacity group-hover:opacity-70">Pick Your Own</span>
                  <input type="file" accept="audio/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) playFile(f); }} />
                </label>
              </li>

              {/* Lo-Fi World Radio */}
              <li className="animate-row-in" style={{ animationDelay: '90ms' }}>
                <button onClick={() => { setAlbumUrl(null); playElement(RADIO[0].url, `Radio · ${RADIO[0].name}`); }} className="group flex w-full items-baseline gap-6 py-8 text-left">
                  <span className="shrink-0 font-pixel text-sm" style={{ opacity: 0.5 }}>03</span>
                  <span className="font-sans text-4xl md:text-6xl tracking-tight transition-opacity group-hover:opacity-70">Lo-Fi World Radio</span>
                </button>
              </li>
            </ul>

            {error && <p className="text-red-400 text-sm mt-6">{error}</p>}
          </div>

          {/* Lawn illustration — pinned to the viewport bottom. On mobile it sits
              IN FRONT of the menu (z-20); on desktop behind it (z-0).
              The mobile width is set so the art clears the third row: this
              artwork is 3:2 where the previous one was ~1.93:1, and since
              height is width/aspect, the old 175vw would stand ~100px taller
              and bury "Lo-Fi World Radio". 136vw ≈ 175 × (1.50/1.93) keeps the
              height the layout was tuned for. */}
          <img
            src="/zen/me-and-my-boys.webp"
            alt="Me and my boys hanging out in the lawn, sharing earbuds plugged into a cassette player"
            className="pointer-events-none select-none fixed bottom-0 left-1/2 -translate-x-1/2 max-w-none w-[136vw] md:w-[min(1000px,80vw)] z-20 md:z-0"
          />
        </div>
      )}
    </main>
  );
}
