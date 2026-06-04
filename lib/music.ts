import { LOCAL_TRACKS } from './tracks';

export interface Track {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  album: {
    name: string;
    images: Array<{ url: string }>;
  };
  duration_ms: number;
  external_urls: { apple_music: string };
  preview_url: string | null;
  lyrics?: string;
}

export function getTracks(): Track[] {
  return LOCAL_TRACKS;
}
