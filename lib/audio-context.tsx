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
import { extractDominantColor, DEFAULT_THEME, type ThemeColors } from '@/lib/color';
import { AudioGate } from '@/components/audio-gate';
import { FloatingPill } from '@/components/floating-pill';

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
  playTrack: (track: Track) => void;
  togglePlayPause: () => void;
  toggleMute: () => void;
  playNext: () => void;
  playPrevious: () => void;
  handleGateChoice: (muted: boolean) => void;
  triggerRestart: () => void;
  setDimmed: (dimmed: boolean) => void;
  setPlayerVisible: (visible: boolean) => void;
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
  const [gateOpen, setGateOpen] = useState(true);
  const [restartKey, setRestartKey] = useState(0);
  const [dimmed, setDimmed] = useState(false);
  const [playerVisible, setPlayerVisible] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Hydration-safe: read sessionStorage after mount
  useEffect(() => {
    try {
      if (sessionStorage.getItem('audio-gate-dismissed') === 'true') setGateOpen(false);
      if (sessionStorage.getItem('audio-muted') === 'false') setIsMuted(false);
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

  // Auto-start playback when gate was already dismissed (returning in same session)
  useEffect(() => {
    if (gateOpen || !currentTrack?.preview_url || !audioRef.current) return;
    if (audioRef.current.src) return; // already playing
    audioRef.current.muted = isMuted;
    audioRef.current.src = currentTrack.preview_url;
    audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gateOpen, currentTrack]);

  // Extract colors from album art
  useEffect(() => {
    const imageUrl = currentTrack?.album?.images[0]?.url;
    if (!imageUrl) return;
    extractDominantColor(imageUrl).then(setTheme);
  }, [currentTrack]);

  // Persist theme to localStorage
  useEffect(() => {
    try { localStorage.setItem('folio-theme', JSON.stringify(theme)); } catch {}
  }, [theme]);

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

  const handleGateChoice = useCallback((muted: boolean) => {
    setIsMuted(muted);
    try { sessionStorage.setItem('audio-muted', String(!muted)); } catch {}
    if (audioRef.current) {
      audioRef.current.muted = muted;
    }
    const ct = currentTrackRef.current;
    if (ct?.preview_url && audioRef.current) {
      audioRef.current.src = ct.preview_url;
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
    setTimeout(() => {
      setGateOpen(false);
      try { sessionStorage.setItem('audio-gate-dismissed', 'true'); } catch {}
    }, 600);
  }, []);

  const togglePlayPause = useCallback(() => {
    const ct = currentTrackRef.current;
    if (!audioRef.current || !ct?.preview_url) return;
    if (isPlaying) { audioRef.current.pause(); setIsPlaying(false); }
    else {
      audioRef.current.src = ct.preview_url;
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  }, [isPlaying]);

  const toggleMute = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
      try { sessionStorage.setItem('audio-muted', String(isMuted)); } catch {}
    }
  }, [isMuted]);

  const triggerRestart = useCallback(() => { setRestartKey((k) => k + 1); }, []);

  const value: AudioContextValue = {
    tracks, currentTrack, loading, error,
    isPlaying, isMuted, currentTime, audioDuration,
    theme, gateOpen, restartKey, dimmed, playerVisible,
    playTrack, togglePlayPause, toggleMute, playNext, playPrevious,
    handleGateChoice, triggerRestart,
    setDimmed, setPlayerVisible,
  };

  return (
    <AudioCtx.Provider value={value}>
      <audio ref={audioRef} crossOrigin="anonymous" muted={isMuted} />
      {children}
    </AudioCtx.Provider>
  );
}

export function AudioUI() {
  const {
    gateOpen, handleGateChoice,
    currentTrack, tracks, loading, error,
    isPlaying, currentTime, isMuted,
    playTrack, togglePlayPause, playNext, playPrevious, toggleMute,
    triggerRestart, dimmed, setDimmed,
    theme, playerVisible,
  } = useAudio();

  // Avoid SSR mismatch — render nothing on the server
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <>
      {gateOpen && <AudioGate onChoice={handleGateChoice} />}
      {!gateOpen && playerVisible && (
        <FloatingPill
          currentTrack={currentTrack}
          tracks={tracks}
          loading={loading}
          error={error}
          isPlaying={isPlaying}
          currentTime={currentTime}
          onPlayTrack={playTrack}
          onTogglePlayPause={togglePlayPause}
          onPlayNext={playNext}
          onPlayPrevious={playPrevious}
          isMuted={isMuted}
          onToggleMute={toggleMute}
          onRestart={triggerRestart}
          dimmed={dimmed}
          onToggleDimmed={() => setDimmed(!dimmed)}
          toolbarColor={theme.toolbar}
        />
      )}
    </>
  );
}
