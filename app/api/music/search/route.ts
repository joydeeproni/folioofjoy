import { NextResponse } from 'next/server';

interface ITunesResult {
  trackId: number;
  trackName: string;
  artistName: string;
  collectionName: string;
  artworkUrl100: string;
  trackViewUrl: string;
  previewUrl?: string;
  trackTimeMillis: number;
  kind?: string;
}

function toTrack(r: ITunesResult) {
  return {
    id: String(r.trackId),
    name: r.trackName,
    artists: [{ name: r.artistName }],
    album: {
      name: r.collectionName || '',
      images: [{ url: (r.artworkUrl100 || '').replace('100x100', '600x600') }],
    },
    duration_ms: r.trackTimeMillis || 0,
    external_urls: { apple_music: r.trackViewUrl || '' },
    preview_url: r.previewUrl || null,
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') || '').trim();
  const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 50);

  if (!q) return NextResponse.json({ tracks: [] });

  try {
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(q)}&entity=song&limit=${limit}`;
    const res = await fetch(url, { next: { revalidate: 600 } });
    if (!res.ok) return NextResponse.json({ tracks: [] });
    const data = await res.json();
    const results: ITunesResult[] = (data.results || []).filter((r: ITunesResult) => r.kind === 'song');
    const tracks = results.map(toTrack).filter((t) => t.preview_url);
    return NextResponse.json({ tracks });
  } catch (error) {
    console.error('[music/search] API error:', error);
    return NextResponse.json({ tracks: [] });
  }
}
