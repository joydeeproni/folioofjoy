'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
} from 'react';
import { getTracks, type Track } from '@/lib/music';
import { themeForTrack, accessibleTheme, DEFAULT_THEME, type ThemeColors } from '@/lib/color';
import { CassetteButton } from '@/components/cassette-button';

interface AudioContextValue {
  tracks: Track[];
  currentTrack: Track | null;
  loading: boolean;
  error: string | null;
  isPlaying: boolean;
  isMuted: boolean;
  currentTime: number;
  audioDuration: number;
  theme: ThemeColors;
  gateOpen: boolean;
  restartKey: number;
  dimmed: boolean;
  playerVisible: boolean;
  accessibleMode: boolean;
  toggleAccessibleMode: () => void;
  playTrack: (track: Track) => void;
  togglePlayPause: () => void;
  toggleMute: () => void;
  playNext: () => void;
  playPrevious: () => void;
  startMusic: () => void;
  getAnalyser: () => AnalyserNode | null;
  triggerRestart: () => void;
  setDimmed: (dimmed: boolean) => void;
  setPlayerVisible: (visible: boolean) => void;
  loungeOpen: boolean;
  openLounge: () => void;
  closeLounge: () => void;
}

const AudioCtx = createContext<AudioContextValue | null>(null);

export function useAudio(): AudioContextValue {
  const ctx = useContext(AudioCtx);
  if (!ctx) throw new Error('useAudio must be used within AudioProvider');
  return ctx;
}

export function AudioProvider({ children }: { children: ReactNode }) {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [theme, setTheme] = useState<ThemeColors>(DEFAULT_THEME);
  // The intro gate was removed — the page renders immediately and audio stays
  // muted by default until the visitor enters Lounge Mode (or unmutes the pill).
  const gateOpen = false;
  const [restartKey, setRestartKey] = useState(0);
  const [dimmed, setDimmed] = useState(false);
  const [playerVisible, setPlayerVisible] = useState(true);
  const [accessibleMode, setAccessibleMode] = useState(false);
  const [loungeOpen, setLoungeOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Web Audio graph for the Winamp-style visualizers. Created lazily on the
  // first user gesture (createMediaElementSource can only run once per element).
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  const ensureAnalyser = useCallback((): AnalyserNode | null => {
    if (!audioRef.current) return null;
    try {
      if (!audioCtxRef.current) {
        const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new Ctx();
      }
      if (audioCtxRef.current.state === 'suspended') void audioCtxRef.current.resume();
      if (!sourceRef.current) {
        sourceRef.current = audioCtxRef.current.createMediaElementSource(audioRef.current);
        const analyser = audioCtxRef.current.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.8;
        sourceRef.current.connect(analyser);
        analyser.connect(audioCtxRef.current.destination);
        analyserRef.current = analyser;
      }
    } catch {
      return analyserRef.current;
    }
    return analyserRef.current;
  }, []);

  const getAnalyser = useCallback(() => analyserRef.current, []);

  // Hydration-safe: read storage after mount
  useEffect(() => {
    try {
      if (sessionStorage.getItem('audio-muted') === 'false') setIsMuted(false);
      if (localStorage.getItem('a11y-mode') === 'true') setAccessibleMode(true);
    } catch {}
  }, []);

  // We need a ref for tracks/currentTrack so the ended handler always sees fresh values
  const tracksRef = useRef(tracks);
  tracksRef.current = tracks;
  const currentTrackRef = useRef(currentTrack);
  currentTrackRef.current = currentTrack;

  // Load tracks on mount
  useEffect(() => {
    const localTracks = getTracks();
    setTracks(localTracks);
    if (localTracks.length > 0) setCurrentTrack(localTracks[0]);
    setLoading(false);
  }, []);

  // Theme = the playing track's curated palette (one per track, wraps), unless
  // the accessible high-contrast theme is toggled on.
  useEffect(() => {
    if (accessibleMode) { setTheme(accessibleTheme()); return; }
    // Stay on the dark default until a track is actually playing — otherwise
    // the site (and the mobile browser chrome) picks up track 0's purple.
    if (!currentTrack) { setTheme(DEFAULT_THEME); return; }
    const idx = tracks.findIndex((t) => t.id === currentTrack.id);
    setTheme(themeForTrack(idx < 0 ? 0 : idx));
  }, [currentTrack, tracks, accessibleMode]);

  // Publish theme tokens as CSS variables so any element can reference them,
  // and sync the mobile browser-chrome color (status bar / address bar) so it
  // blends with the page instead of showing a black crop.
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--theme-bg', theme.background);
    root.style.setProperty('--theme-fg', theme.foreground);
    root.style.setProperty('--theme-highlight', theme.accent);
    root.style.backgroundColor = theme.background;
    document.body.style.backgroundColor = theme.background;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme.background);
  }, [theme]);

  // Persist the accessibility preference across sessions.
  useEffect(() => {
    try { localStorage.setItem('a11y-mode', String(accessibleMode)); } catch {}
  }, [accessibleMode]);

  const toggleAccessibleMode = useCallback(() => setAccessibleMode((m) => !m), []);

  // Play next track (defined before event listener effect)
  const playNextRef = useRef<() => void>(() => {});

  const playTrack = useCallback(async (track: Track) => {
    setCurrentTrack(track);
    setCurrentTime(0);
    setAudioDuration(0);
    setRestartKey((k) => k + 1);
    if (audioRef.current && track.preview_url) {
      audioRef.current.src = track.preview_url;
      try { await audioRef.current.play(); setIsPlaying(true); } catch { setIsPlaying(false); }
    } else { setIsPlaying(false); }
  }, []);

  const playNext = useCallback(() => {
    const t = tracksRef.current;
    const ct = currentTrackRef.current;
    const ci = t.findIndex((tr) => tr.id === ct?.id) ?? -1;
    if (t[(ci + 1) % t.length]) playTrack(t[(ci + 1) % t.length]);
  }, [playTrack]);

  const playPrevious = useCallback(() => {
    const t = tracksRef.current;
    const ct = currentTrackRef.current;
    const ci = t.findIndex((tr) => tr.id === ct?.id) ?? -1;
    if (t[(ci - 1 + t.length) % t.length]) playTrack(t[(ci - 1 + t.length) % t.length]);
  }, [playTrack]);

  playNextRef.current = playNext;

  // Audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const captureDuration = () => {
      if (audio.duration && isFinite(audio.duration)) setAudioDuration(audio.duration);
    };
    const handleTimeUpdate = () => { setCurrentTime(audio.currentTime); captureDuration(); };
    const handleEnded = () => { setIsPlaying(false); playNextRef.current(); };
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', captureDuration);
    audio.addEventListener('loadedmetadata', captureDuration);
    audio.addEventListener('ended', handleEnded);
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', captureDuration);
      audio.removeEventListener('loadedmetadata', captureDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  // Entering Lounge Mode starts the music audibly. Runs inside the click gesture,
  // so unmuted playback and the AudioContext are both allowed by the browser.
  const startMusic = useCallback(() => {
    const ct = currentTrackRef.current;
    if (!audioRef.current || !ct?.preview_url) return;
    ensureAnalyser();
    audioRef.current.muted = false;
    setIsMuted(false);
    try { sessionStorage.setItem('audio-muted', 'false'); } catch {}
    if (!audioRef.current.src) audioRef.current.src = ct.preview_url;
    audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
  }, [ensureAnalyser]);

  // Lounge Mode: the pattern experience behind the music circle. Opening it
  // also starts the music (inside the click gesture, so playback is allowed).
  const openLounge = useCallback(() => { setLoungeOpen(true); startMusic(); }, [startMusic]);
  const closeLounge = useCallback(() => { setLoungeOpen(false); }, []);

  const togglePlayPause = useCallback(() => {
    const ct = currentTrackRef.current;
    if (!audioRef.current || !ct?.preview_url) return;
    if (isPlaying) { audioRef.current.pause(); setIsPlaying(false); }
    else {
      ensureAnalyser();
      if (!audioRef.current.src) audioRef.current.src = ct.preview_url;
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  }, [isPlaying, ensureAnalyser]);

  const toggleMute = useCallback(() => {
    if (audioRef.current) {
      if (isMuted) ensureAnalyser();
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
      try { sessionStorage.setItem('audio-muted', String(isMuted)); } catch {}
    }
  }, [isMuted, ensureAnalyser]);

  const triggerRestart = useCallback(() => { setRestartKey((k) => k + 1); }, []);

  const value: AudioContextValue = {
    tracks, currentTrack, loading, error,
    isPlaying, isMuted, currentTime, audioDuration,
    theme, gateOpen, restartKey, dimmed, playerVisible,
    accessibleMode, toggleAccessibleMode,
    playTrack, togglePlayPause, toggleMute, playNext, playPrevious,
    startMusic, getAnalyser, triggerRestart,
    setDimmed, setPlayerVisible,
    loungeOpen, openLounge, closeLounge,
  };

  return (
    <AudioCtx.Provider value={value}>
      <audio ref={audioRef} crossOrigin="anonymous" muted={isMuted} />
      {children}
    </AudioCtx.Provider>
  );
}

export function AudioUI() {
  const { playerVisible } = useAudio();

  // Avoid SSR mismatch — render nothing on the server
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <>
      {playerVisible && <CassetteButton />}
    </>
  );
}
