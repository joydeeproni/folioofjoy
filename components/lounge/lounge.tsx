'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Play, Pause, ArrowLeft, Volume2, VolumeX, Music, Sparkles, Waves, Disc3, Stars, Mountain } from 'lucide-react';
import { useAudioEngine } from '@/lib/audio-engine';
import { extractDominantColor, DEFAULT_THEME, type ThemeColors } from '@/lib/color';
import type { Track } from '@/lib/music';
import { Visualizer, type VisualizerMode } from './visualizer';
import { SearchPanel } from './search-panel';
import { EQPanel } from './eq-panel';

const VIS_MODES: { value: VisualizerMode; label: string; icon: typeof Sparkles }[] = [
  { value: 'terrain', label: 'Terrain', icon: Mountain },
  { value: 'dither', label: 'Dither', icon: Sparkles },
  { value: 'waveform', label: 'Waveform', icon: Waves },
  { value: 'rings', label: 'Rings', icon: Disc3 },
  { value: 'bloom', label: 'Bloom', icon: Stars },
];

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function Lounge() {
  const engine = useAudioEngine();
  const [theme, setTheme] = useState<ThemeColors>(DEFAULT_THEME);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [mode, setMode] = useState<VisualizerMode>('terrain');
  const [muted, setMuted] = useState(false);
  const [eqExpanded, setEqExpanded] = useState(false);

  // Update theme from album art
  useEffect(() => {
    const img = currentTrack?.album?.images[0]?.url;
    if (!img) return;
    extractDominantColor(img).then(setTheme);
  }, [currentTrack]);

  const handleSelect = async (track: Track) => {
    if (!track.preview_url) return;
    setCurrentTrack(track);
    await engine.loadAndPlay(track.preview_url);
  };

  const toggleMute = () => {
    if (muted) {
      engine.setVolume(engine.volume > 0 ? engine.volume : 0.85);
      setMuted(false);
    } else {
      engine.setVolume(0);
      setMuted(true);
    }
  };

  const progressPct = engine.duration > 0 ? (engine.currentTime / engine.duration) * 100 : 0;

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden transition-colors duration-1000"
      style={{ backgroundColor: theme.background }}
    >
      <audio ref={engine.audioRef} crossOrigin="anonymous" />

      {/* Visualizer canvas */}
      <Visualizer
        analyserRef={engine.analyserRef}
        mode={mode}
        hue={theme.hue}
        saturation={theme.saturation}
        isPlaying={engine.isPlaying}
      />

      {/* === TOP BAR === */}
      <div className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between p-4 md:p-6">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 rounded-full backdrop-blur-xl border border-white/10 text-white/70 hover:text-white transition-colors"
            style={{ backgroundColor: theme.toolbar }}
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs font-mono uppercase tracking-widest hidden md:inline">Back</span>
          </Link>
          <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-full">
            <Music className="w-3.5 h-3.5" style={{ color: theme.accent }} />
            <span className="text-xs font-mono uppercase tracking-widest text-white/50">Lounge Mode</span>
          </div>
        </div>

        <SearchPanel onSelect={handleSelect} toolbarColor={theme.toolbar} accentColor={theme.accent} />
      </div>

      {/* === HERO / EMPTY STATE === */}
      {!currentTrack && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none px-6">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mb-6 backdrop-blur-xl border border-white/10"
            style={{ backgroundColor: theme.toolbar }}
          >
            <Music className="w-9 h-9" style={{ color: theme.accent }} />
          </div>
          <h1 className="text-4xl md:text-6xl font-heading font-light text-white text-center tracking-wide">
            l0unge
          </h1>
          <p className="mt-4 text-sm md:text-base text-white/50 font-sans text-center max-w-md">
            Search any song, push play, breathe. Tweak EQ, switch visuals, settle in.
          </p>
          <p className="mt-8 text-[10px] font-mono text-white/30 uppercase tracking-widest pointer-events-auto">
            Press <span className="px-1.5 py-0.5 rounded border border-white/15 mx-1">/</span> to search
          </p>
        </div>
      )}

      {/* === NOW PLAYING — center top once a track is loaded === */}
      {currentTrack && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
          <div className="flex items-center gap-3 px-4 py-2 rounded-full backdrop-blur-xl border border-white/10 pointer-events-auto"
               style={{ backgroundColor: theme.toolbar }}>
            {currentTrack.album?.images[0]?.url && (
              <img src={currentTrack.album.images[0].url} alt="" className="w-7 h-7 rounded-md object-cover" />
            )}
            <div className="flex flex-col leading-tight max-w-[40vw] md:max-w-xs">
              <span className="text-xs text-white truncate">{currentTrack.name}</span>
              <span className="text-[10px] text-white/40 truncate">{currentTrack.artists[0]?.name}</span>
            </div>
          </div>
        </div>
      )}

      {/* === BOTTOM TRANSPORT + VIS MODE SWITCHER === */}
      <div className="fixed bottom-0 left-0 right-0 z-30 p-4 md:p-6 flex flex-col items-center gap-3">
        {/* Vis mode switcher */}
        <div
          className="flex items-center gap-1 px-1.5 py-1.5 rounded-full backdrop-blur-xl border border-white/10"
          style={{ backgroundColor: theme.toolbar }}
        >
          {VIS_MODES.map((m) => {
            const Icon = m.icon;
            const active = mode === m.value;
            return (
              <button
                key={m.value}
                onClick={() => setMode(m.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-sans transition-all ${
                  active ? 'text-white' : 'text-white/40 hover:text-white/70'
                }`}
                style={active ? { backgroundColor: theme.accent + '33' } : undefined}
              >
                <Icon className="w-3.5 h-3.5" style={active ? { color: theme.accent } : undefined} />
                <span className="hidden sm:inline">{m.label}</span>
              </button>
            );
          })}
        </div>

        {/* Transport pill */}
        <div className="flex items-center gap-3 w-full max-w-2xl">
          <button
            onClick={() => setEqExpanded((o) => !o)}
            className={`px-4 py-3 rounded-full backdrop-blur-xl border border-white/10 text-xs font-mono uppercase tracking-widest transition-all flex-shrink-0 ${
              eqExpanded ? 'text-white' : 'text-white/50 hover:text-white'
            }`}
            style={{ backgroundColor: theme.toolbar }}
          >
            EQ
          </button>

          <div
            className="flex-1 flex items-center gap-3 px-4 py-3 rounded-full backdrop-blur-xl border border-white/10"
            style={{ backgroundColor: theme.toolbar }}
          >
            <button
              onClick={engine.togglePlayPause}
              disabled={!currentTrack}
              className="p-2 rounded-full bg-white/15 hover:bg-white/25 text-white transition-all disabled:opacity-40"
            >
              {engine.isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>

            <span className="text-[10px] font-mono text-white/40 w-8 flex-shrink-0">
              {formatTime(engine.currentTime)}
            </span>

            <div className="flex-1 relative h-1 rounded-full bg-white/10 overflow-hidden cursor-pointer group"
                 onClick={(e) => {
                   const rect = e.currentTarget.getBoundingClientRect();
                   const pct = (e.clientX - rect.left) / rect.width;
                   engine.seek(pct * (engine.duration || 30));
                 }}
            >
              <div
                className="absolute top-0 left-0 bottom-0 transition-all"
                style={{ width: `${progressPct}%`, backgroundColor: theme.accent }}
              />
              <div
                className="absolute top-1/2 w-2.5 h-2.5 -translate-y-1/2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ left: `calc(${progressPct}% - 5px)`, backgroundColor: theme.accent }}
              />
            </div>

            <span className="text-[10px] font-mono text-white/40 w-8 flex-shrink-0 text-right">
              {formatTime(engine.duration || 30)}
            </span>

            <button
              onClick={toggleMute}
              className="p-1.5 rounded-full hover:bg-white/10 text-white/70 transition-all flex-shrink-0"
            >
              {muted || engine.volume === 0 ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* EQ panel — slides in from right */}
      <div
        className={`fixed top-1/2 right-4 md:right-6 -translate-y-1/2 z-30 transition-all duration-500 ${
          eqExpanded ? 'opacity-100 translate-x-0 pointer-events-auto' : 'opacity-0 translate-x-8 pointer-events-none'
        }`}
      >
        <EQPanel
          eq={engine.eq}
          volume={engine.volume}
          onEQ={engine.setEQ}
          onVolume={(v) => { engine.setVolume(v); setMuted(v === 0); }}
          toolbarColor={theme.toolbar}
          accentColor={theme.accent}
        />
      </div>
    </div>
  );
}
