import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { searchSongs } from '@/lib/api';
import { addSongToPlaylist, createPlaylist } from '@/lib/playlists';
import type { Song } from '@/lib/types';

async function getSpotifyAccessToken(request: NextRequest): Promise<string | null> {
  return request.cookies.get('spotify_access_token')?.value || null;
}

export async function POST(request: NextRequest) {
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
      { error: 'Not connected to Spotify' },
      { status: 401 }
    );
  }

  try {
    const { playlistId, playlistName, createNewPlaylist, targetPlaylistId } = await request.json();

    if (!playlistId) {
      return NextResponse.json(
        { error: 'Playlist ID is required' },
        { status: 400 }
      );
    }

    // Fetch playlist tracks from Spotify
    const tracks: any[] = [];
    let nextUrl: string | null = `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=50`;

    while (nextUrl) {
      const response = await fetch(nextUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch playlist tracks: ${response.status}`);
      }

      const data = await response.json();
      tracks.push(...data.items.filter((item: any) => item.track && !item.track.is_local));
      nextUrl = data.next;
    }

    // Determine target playlist
    let finalPlaylistId: string;

    if (createNewPlaylist) {
      // Create new playlist
      const newPlaylist = await createPlaylist(
        user.id,
        playlistName || 'Imported from Spotify',
        `Imported from Spotify on ${new Date().toLocaleDateString()}`
      );

      if (!newPlaylist) {
        return NextResponse.json(
          { error: 'Failed to create playlist' },
          { status: 500 }
        );
      }

      finalPlaylistId = newPlaylist.id;
    } else {
      if (!targetPlaylistId) {
        return NextResponse.json(
          { error: 'Target playlist ID is required' },
          { status: 400 }
        );
      }
      finalPlaylistId = targetPlaylistId;
    }

    // Import tracks
    const results = {
      total: tracks.length,
      imported: 0,
      failed: 0,
      skipped: 0,
      errors: [] as string[],
    };

    for (const item of tracks) {
      const track = item.track;
      if (!track) continue;

      try {
        // Search for track in your music API
        const searchQuery = `${track.artists[0]?.name || ''} ${track.name}`.trim();
        const songs = await searchSongs(searchQuery);

        if (songs.length > 0) {
          // Use the first matching song
          const song = songs[0];
          const added = await addSongToPlaylist(finalPlaylistId, song);

          if (added) {
            results.imported++;
          } else {
            results.skipped++;
            results.errors.push(`Skipped: ${track.name} (already in playlist)`);
          }
        } else {
          results.failed++;
          results.errors.push(`Not found: ${track.name} by ${track.artists[0]?.name || 'Unknown'}`);
        }
      } catch (error) {
        results.failed++;
        results.errors.push(`Error importing: ${track.name}`);
        console.error(`Error importing track ${track.name}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      playlistId: finalPlaylistId,
      results,
    });
  } catch (error) {
    console.error('Error importing Spotify playlist:', error);
    return NextResponse.json(
      { error: 'Failed to import playlist' },
      { status: 500 }
    );
  }
}

