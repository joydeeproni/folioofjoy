'use client';

import { useState, useEffect, useMemo } from 'react';
import { X } from 'lucide-react';
import { MatrixVisualization, type ExploreSettings } from './matrix-visualization';
import { PatternGuide } from './pattern-guide';
import { ExploreToolbar } from './explore-toolbar';
import { useAudio } from '@/lib/audio-context';

// Full-screen Lounge Mode overlay. Opened by clicking the music circle; shows
// the lyric co-occurrence pattern with playback + explore controls. Reuses the
// same pieces the old homepage's explore mode used.
export function LoungeMode() {
  const {
    loungeOpen, closeLounge,
    currentTrack, theme, restartKey, triggerRestart,
    isPlaying, isMuted, currentTime, audioDuration,
    togglePlayPause, toggleMute, playNext, playPrevious,
  } = useAudio();

  const [hoveredCell, setHoveredCell] = useState<{ i: number; j: number } | null>(null);
  const [settings, setSettings] = useState<ExploreSettings>({
    wave: 'corners', colorMode: 'white', shapeMode: 'circles-ripple',
    shades: theme.shades, hue: theme.hue, saturation: theme.saturation,
  });

  useEffect(() => {
    setSettings((s) => ({ ...s, shades: theme.shades, hue: theme.hue, saturation: theme.saturation }));
  }, [theme]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeLounge(); };
    if (loungeOpen) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [loungeOpen, closeLounge]);

  const lyrics = currentTrack?.lyrics || '';
  const { words, wordMap } = useMemo(() => {
    if (!lyrics) return { words: [] as string[], wordMap: new Map<string, number[]>() };
    const normalized = lyrics.toLowerCase().split(/[\s\n]+/).map((w) => w.replace(/[^\w]/g, '')).filter((w) => w.length > 0);
    const map = new Map<string, number[]>();
    normalized.forEach((word, index) => { if (!map.has(word)) map.set(word, []); map.get(word)!.push(index); });
    return { words: normalized, wordMap: map };
  }, [lyrics]);

  const hoveredWord = hoveredCell ? words[hoveredCell.i] : null;

  if (!loungeOpen) return null;

  return (
    <div className="fixed inset-0 z-[90] overflow-hidden" style={{ backgroundColor: theme.background }}>
      {words.length > 0 && (
        <MatrixVisualization
          words={words} wordMap={wordMap} showSingleMatches
          opacity={1} restartKey={restartKey}
          backgroundColor={theme.backgroundRgb} cellColor={theme.accent}
          onCellHover={setHoveredCell}
          exploreSettings={settings}
          audioProgress={audioDuration > 0 ? currentTime / audioDuration : undefined}
        />
      )}

      <PatternGuide active restartKey={restartKey} />

      {hoveredWord && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[95] px-4 py-2" style={{ color: theme.foreground }}>
          <span className="font-mono font-semibold">{hoveredWord}</span>
          <span className="text-sm ml-2 opacity-50">{wordMap.get(hoveredWord)?.length || 0} matches</span>
        </div>
      )}

      <button
        onClick={closeLounge}
        className="fixed top-6 right-6 z-[95] flex items-center gap-2 px-4 py-2 rounded-full text-white transition-colors duration-200 hover:bg-white/10"
        aria-label="Close Lounge Mode"
      >
        <X className="w-4 h-4" /><span className="text-sm font-sans">Back</span>
      </button>

      <ExploreToolbar
        active settings={settings} onChange={setSettings}
        onRestart={triggerRestart} toolbarColor={theme.toolbar} accentColor={theme.accent}
        currentTrack={currentTrack} isPlaying={isPlaying} isMuted={isMuted} currentTime={currentTime}
        onTogglePlayPause={togglePlayPause} onPlayNext={playNext} onPlayPrevious={playPrevious} onToggleMute={toggleMute}
        lyrics={lyrics} wordMap={wordMap}
      />
    </div>
  );
}
