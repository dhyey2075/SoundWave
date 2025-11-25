// Spotify API utilities
// Using OAuth 2.0 with PKCE (Proof Key for Code Exchange) - latest and most secure method

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  album: {
    name: string;
    images: Array<{ url: string }>;
  };
  duration_ms: number;
  external_urls: {
    spotify: string;
  };
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string | null;
  images: Array<{ url: string }>;
  tracks: {
    total: number;
    items: Array<{
      track: SpotifyTrack | null;
    }>;
  };
  owner: {
    display_name: string;
  };
}

// Generate code verifier for PKCE
export function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  // Convert Uint8Array to string without spread operator
  const base64 = btoa(String.fromCharCode.apply(null, Array.from(array)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
  return base64;
}

// Generate code challenge from verifier
export async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  const bytes = new Uint8Array(digest);
  return btoa(String.fromCharCode.apply(null, Array.from(bytes)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

// Convert Spotify track to search query
export function spotifyTrackToSearchQuery(track: SpotifyTrack): string {
  const artist = track.artists[0]?.name || '';
  const title = track.name;
  return `${artist} ${title}`.trim();
}

// Convert milliseconds to duration string (MM:SS)
export function msToDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

