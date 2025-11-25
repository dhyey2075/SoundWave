import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

async function getSpotifyAccessToken(request: NextRequest): Promise<string | null> {
  let accessToken = request.cookies.get('spotify_access_token')?.value;
  const refreshToken = request.cookies.get('spotify_refresh_token')?.value;

  if (!accessToken && !refreshToken) {
    return null;
  }

  // If no access token but we have refresh token, refresh it
  if (!accessToken && refreshToken) {
    const newToken = await refreshSpotifyToken(refreshToken);
    return newToken;
  }

  return accessToken || null;
}

async function refreshSpotifyToken(refreshToken: string): Promise<string | null> {
  const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
  const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
    return null;
  }

  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('Error refreshing Spotify token:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  // Verify user is authenticated
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const accessToken = await getSpotifyAccessToken(request);

  if (!accessToken) {
    return NextResponse.json(
      { error: 'Not connected to Spotify. Please authorize first.' },
      { status: 401 }
    );
  }

  try {
    // Fetch user's playlists
    const playlists: any[] = [];
    let nextUrl: string | null = 'https://api.spotify.com/v1/me/playlists?limit=50';

    while (nextUrl) {
      const response = await fetch(nextUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          return NextResponse.json(
            { error: 'Spotify token expired. Please reconnect.' },
            { status: 401 }
          );
        }
        throw new Error(`Spotify API error: ${response.status}`);
      }

      const data = await response.json();
      playlists.push(...data.items);
      nextUrl = data.next;
    }

    // Format playlists for frontend
    const formattedPlaylists = playlists.map((playlist) => ({
      id: playlist.id,
      name: playlist.name,
      description: playlist.description || null,
      image: playlist.images?.[0]?.url || null,
      trackCount: playlist.tracks?.total || 0,
      owner: playlist.owner?.display_name || 'Unknown',
    }));

    return NextResponse.json({ playlists: formattedPlaylists });
  } catch (error) {
    console.error('Error fetching Spotify playlists:', error);
    return NextResponse.json(
      { error: 'Failed to fetch playlists from Spotify' },
      { status: 500 }
    );
  }
}

