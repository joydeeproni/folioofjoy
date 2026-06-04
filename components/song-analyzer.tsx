'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { HelpCircle, X } from 'lucide-react';
import { MatrixVisualization, type ExploreSettings } from './matrix-visualization';
import { HeroOverlay } from './hero-overlay';
import { PatternGuide } from './pattern-guide';
import { ExploreToolbar } from './explore-toolbar';
import { MobileMenu } from './mobile-menu';
import { ScrollReveal } from './scroll-reveal';
import { WorkLink } from './work-preview';
import { ExperimentsLink } from './experiments-preview';
import { useAudio } from '@/lib/audio-context';
import { DEFAULT_THEME } from '@/lib/color';

export function SongAnalyzer() {
  const {
    tracks, currentTrack, loading, error,
    isPlaying, isMuted, currentTime, audioDuration,
    theme, gateOpen, restartKey, dimmed,
    playTrack, togglePlayPause, toggleMute, playNext, playPrevious,
    triggerRestart, setDimmed, setPlayerVisible,
  } = useAudio();

  const [lyrics, setLyrics] = useState('');
  const [showSingleMatches, setShowSingleMatches] = useState(true);
  const [exploreMode, setExploreMode] = useState(false);
  const [hoveredCell, setHoveredCell] = useState<{ i: number; j: number } | null>(null);
  const [exploreSettings, setExploreSettings] = useState<ExploreSettings>({
    wave: 'center',
    colorMode: 'white',
    shapeMode: 'circles-ripple',
    shades: DEFAULT_THEME.shades,
    hue: DEFAULT_THEME.hue,
    saturation: DEFAULT_THEME.saturation,
  });

  // Sync explore settings when theme changes
  useEffect(() => {
    setExploreSettings((s) => ({
      ...s, shades: theme.shades, hue: theme.hue, saturation: theme.saturation,
    }));
  }, [theme]);

  // Update lyrics when track changes
  useEffect(() => {
    if (!currentTrack) { setLyrics(''); return; }
    setLyrics(currentTrack.lyrics || '');
  }, [currentTrack]);

  // Hide FloatingPill during explore mode; restore on unmount
  useEffect(() => {
    setPlayerVisible(!exploreMode);
    return () => setPlayerVisible(true);
  }, [exploreMode, setPlayerVisible]);

  const enterExplore = useCallback(() => {
    setExploreMode(true); setHoveredCell(null); triggerRestart();
  }, [triggerRestart]);

  const exitExplore = useCallback(() => {
    setExploreMode(false); setHoveredCell(null);
    setExploreSettings((s) => ({ ...s, wave: 'center', colorMode: 'white', shapeMode: 'circles-ripple' }));
    triggerRestart();
  }, [triggerRestart]);

  const { words, wordMap } = useMemo(() => {
    if (!lyrics) return { words: [], wordMap: new Map() };
    const normalized = lyrics.toLowerCase().split(/[\s\n]+/).map((w) => w.replace(/[^\w]/g, '')).filter((w) => w.length > 0);
    const map = new Map<string, number[]>();
    normalized.forEach((word, index) => { if (!map.has(word)) map.set(word, []); map.get(word)!.push(index); });
    return { words: normalized, wordMap: map };
  }, [lyrics]);

  const hoveredWord = useMemo(() => {
    if (!exploreMode || !hoveredCell) return null;
    const word = words[hoveredCell.i];
    if (word && (showSingleMatches || (wordMap.get(word)?.length || 0) > 1)) return word;
    return null;
  }, [exploreMode, hoveredCell, words, wordMap, showSingleMatches]);

  // Don't render page content until the audio gate is dismissed (preserves mount animations)
  if (gateOpen) return null;

  return (
    <div className={`relative w-full transition-colors duration-1000 ease-in-out${exploreMode ? ' h-screen overflow-hidden' : ''}`} style={{ backgroundColor: theme.background }}>

      {/* ===== FIRST FOLD — full screen ===== */}
      <div className="relative h-screen w-full overflow-hidden">
        {/* Matrix */}
        {words.length > 0 && (
          <MatrixVisualization
            words={words} wordMap={wordMap} showSingleMatches={showSingleMatches}
            opacity={exploreMode ? 1 : dimmed ? 0.08 : 0.35}
            restartKey={restartKey} backgroundColor={theme.backgroundRgb}
            onCellHover={exploreMode ? setHoveredCell : undefined}
            exploreSettings={exploreSettings}
            audioProgress={audioDuration > 0 ? currentTime / audioDuration : undefined}
          />
        )}

        {/* Hero Text Overlay */}
        <div className={`transition-opacity duration-500 ${exploreMode ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <HeroOverlay accentColor={theme.accent} toolbarColor={theme.toolbar} />
        </div>

        {/* Desktop: Social links — top left */}
        <div className={`hidden md:flex fixed top-7 left-8 z-50 items-center gap-5 transition-opacity duration-500 ${exploreMode ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <Link href="/work" className="text-sm font-sans text-white/40 hover:text-white transition-colors">Work</Link>
          <a href="https://www.instagram.com/joyingntravelling/" target="_blank" rel="noopener noreferrer" className="text-sm font-sans text-white/40 hover:text-white transition-colors">Photography</a>
          <a href="https://www.threads.com/@joydeep.roni" target="_blank" rel="noopener noreferrer" className="text-sm font-sans text-white/40 hover:text-white transition-colors">Threads</a>
          <a href="https://www.linkedin.com/in/joydeeproni/" target="_blank" rel="noopener noreferrer" className="text-sm font-sans text-white/40 hover:text-white transition-colors">LinkedIn</a>
        </div>

        {/* Mobile: Menu button + overlay */}
        <div className={`transition-opacity duration-500 ${exploreMode ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <MobileMenu onExplore={enterExplore} toolbarColor={theme.toolbar} />
        </div>

        {/* Hovered word tooltip */}
        {hoveredWord && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-40 px-4 py-2">
            <span className="text-white font-mono font-semibold">{hoveredWord}</span>
            <span className="text-white/40 text-sm ml-2">{wordMap.get(hoveredWord)?.length || 0} matches</span>
          </div>
        )}

        {/* Pattern guide */}
        <PatternGuide active={exploreMode} restartKey={restartKey} />

        {/* Desktop: "What's this pattern?" — top right */}
        <button
          onClick={() => { if (exploreMode) exitExplore(); else enterExplore(); }}
          className={`hidden md:flex fixed top-6 right-6 z-50 items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${exploreMode ? 'text-white hover:bg-white/10' : 'text-white/50 hover:text-white hover:bg-white/10'}`}
        >
          {exploreMode ? (<><X className="w-4 h-4" /><span className="text-sm font-sans">Back</span></>) : (<><HelpCircle className="w-4 h-4" /><span className="text-sm font-sans">What&apos;s this pattern?</span></>)}
        </button>

        {/* Mobile: Back button in explore mode */}
        {exploreMode && (
          <button onClick={exitExplore} className="fixed top-6 right-6 z-50 md:hidden text-white text-xs font-mono uppercase tracking-widest">
            BACK
          </button>
        )}

        {/* Explore toolbar */}
        <ExploreToolbar
          active={exploreMode} settings={exploreSettings} onChange={setExploreSettings}
          onRestart={triggerRestart} toolbarColor={theme.toolbar} accentColor={theme.accent}
          currentTrack={currentTrack} isPlaying={isPlaying} isMuted={isMuted} currentTime={currentTime}
          onTogglePlayPause={togglePlayPause} onPlayNext={playNext} onPlayPrevious={playPrevious} onToggleMute={toggleMute}
          lyrics={lyrics} wordMap={wordMap}
        />
      </div>

      {/* ===== BELOW FOLD — mobile only, scrollable, hidden in explore ===== */}
      <div className={`md:hidden relative z-20 px-6 py-16 flex flex-col gap-10 ${exploreMode ? 'hidden' : ''}`} style={{ backgroundColor: theme.background }}>
        <ScrollReveal>
          <p className="text-base font-sans text-white/60 leading-relaxed">
            A dry, observant, tool-pilled in a practical way, and just self-aware enough to admit he&apos;s become the sort of product designer who can tell you exactly why your app feels slightly off, why your onboarding leaks users, why your AI feature is mostly a nervous mood board and might just look like a GPT wrapper.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={150}>
          <span className="text-base font-sans text-white/60 leading-relaxed block">
            This site is perpetually half-built — no case studies, no past-work gallery, mostly because things are moving faster than any of us can keep up with, and he&apos;s made peace with being the sort of designer who&apos;s always a quarter behind her own work. Some of it lives <WorkLink /> and some experiments are <ExperimentsLink />.
          </span>
        </ScrollReveal>

        {/* Footer */}
        <ScrollReveal delay={300}>
          <footer className="pt-10 pb-6 text-center" style={{ textWrap: 'balance' } as React.CSSProperties}>
            <p className="text-sm font-sans text-white/30 leading-relaxed">
              Folio of Joy is always work in progress because learning and building never stops
              <span className="inline-block mx-3 w-1 h-1 rounded-full bg-current align-middle" />
              Joydeep Sengupta &copy; 2077
              <span className="inline-block mx-3 w-1 h-1 rounded-full bg-current align-middle" />
              K&oslash;benhavn, Danmark
            </p>
          </footer>
        </ScrollReveal>
      </div>

      {/* ===== DESKTOP FOOTER — at bottom of viewport ===== */}
      <div className="hidden md:block fixed bottom-0 left-0 right-0 z-10 pointer-events-none pb-3">
        {/* intentionally empty on desktop — text is in the hero overlay */}
      </div>
    </div>
  );
}
