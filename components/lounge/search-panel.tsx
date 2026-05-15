'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2, Play } from 'lucide-react';
import type { Track } from '@/lib/music';

interface SearchPanelProps {
  onSelect: (track: Track) => void;
  toolbarColor: string;
  accentColor: string;
}

export function SearchPanel({ onSelect, toolbarColor, accentColor }: SearchPanelProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/music/search?q=${encodeURIComponent(query)}&limit=12`);
        const data = await res.json();
        setResults(data.tracks || []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 280);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  // Open search with `/` key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        setOpen(true);
        setTimeout(() => inputRef.current?.focus(), 50);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="relative">
      <button
        onClick={() => {
          setOpen((o) => !o);
          setTimeout(() => inputRef.current?.focus(), 50);
        }}
        className="flex items-center gap-2 px-4 py-2 backdrop-blur-xl border border-white/10 rounded-full text-white/70 hover:text-white transition-colors"
        style={{ backgroundColor: toolbarColor }}
      >
        <Search className="w-4 h-4" />
        <span className="text-sm font-sans">Search any song</span>
        <span className="hidden md:inline text-[10px] font-mono text-white/30 ml-2 px-1.5 py-0.5 rounded border border-white/10">
          /
        </span>
      </button>

      {/* Dropdown panel */}
      <div
        className={`absolute top-full right-0 mt-2 w-[min(420px,90vw)] transition-all duration-300 ${
          open ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'
        }`}
      >
        <div
          className="backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
          style={{ backgroundColor: toolbarColor }}
        >
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
            <Search className="w-4 h-4 text-white/40" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search songs, artists, albums…"
              className="flex-1 bg-transparent text-sm font-sans text-white placeholder:text-white/30 outline-none"
            />
            {loading ? (
              <Loader2 className="w-4 h-4 text-white/40 animate-spin" />
            ) : query ? (
              <button onClick={() => setQuery('')} className="text-white/40 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            ) : null}
          </div>

          <div className="max-h-[60vh] overflow-y-auto">
            {!query && !results.length && (
              <div className="px-4 py-8 text-center">
                <p className="text-xs font-mono text-white/30 uppercase tracking-widest">Try a song or artist</p>
                <p className="text-[10px] font-sans text-white/20 mt-2">30s previews — adjust EQ, watch the visuals breathe</p>
              </div>
            )}
            {query && !loading && results.length === 0 && (
              <div className="px-4 py-8 text-center text-xs text-white/40 font-sans">
                No tracks with previewable audio.
              </div>
            )}
            <div className="py-1">
              {results.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    onSelect(t);
                    setOpen(false);
                    setQuery('');
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-white/5 transition-colors group"
                >
                  {t.album?.images[0]?.url ? (
                    <img src={t.album.images[0].url} alt="" className="w-10 h-10 rounded-md object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-md bg-white/5 flex-shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="text-sm text-white truncate">{t.name}</div>
                    <div className="text-xs text-white/40 truncate">{t.artists.map((a) => a.name).join(', ')}</div>
                  </div>
                  <Play
                    className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                    style={{ color: accentColor }}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
