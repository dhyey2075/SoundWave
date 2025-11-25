import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { searchSongs } from '@/lib/api';
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
        const errorText = await response.text();
        console.error(`Spotify API error (${response.status}):`, errorText);
        throw new Error(`Failed to fetch playlist tracks: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      if (!data || !data.items) {
        console.error('Invalid Spotify API response:', data);
        break;
      }
      
      const validTracks = data.items.filter((item: any) => item.track && !item.track.is_local);
      tracks.push(...validTracks);
      nextUrl = data.next;
    }

    // Determine target playlist
    let finalPlaylistId: string;

    if (createNewPlaylist) {
      // Create new playlist using server-side client
      const { data: newPlaylist, error: createError } = await supabase
        .from('playlists')
        .insert({
          user_id: user.id,
          name: playlistName || 'Imported from Spotify',
          description: `Imported from Spotify on ${new Date().toLocaleDateString()}`,
        })
        .select()
        .single();

      if (createError || !newPlaylist) {
        console.error('Error creating playlist:', createError);
        return NextResponse.json(
          { error: 'Failed to create playlist', details: createError?.message },
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
        
        if (!searchQuery) {
          results.failed++;
          results.errors.push(`Invalid search query for: ${track.name}`);
          continue;
        }

        const songs = await searchSongs(searchQuery);

        if (songs && songs.length > 0) {
          // Use the first matching song
          const song = songs[0];
          
          if (!song || !song.id) {
            results.failed++;
            results.errors.push(`Invalid song data for: ${track.name}`);
            continue;
          }

          // Add song to playlist using server-side client
          // Check if song already exists in playlist
          const { data: existing } = await supabase
            .from('playlist_songs')
            .select('id')
            .eq('playlist_id', finalPlaylistId)
            .eq('song_id', song.id)
            .single();

          if (existing) {
            results.skipped++;
            results.errors.push(`Skipped: ${track.name} (already in playlist)`);
            continue;
          }

          // Get current max position
          const { data: maxPos } = await supabase
            .from('playlist_songs')
            .select('position')
            .eq('playlist_id', finalPlaylistId)
            .order('position', { ascending: false })
            .limit(1)
            .single();

          const nextPosition = maxPos ? maxPos.position + 1 : 0;

          // Insert song into playlist
          const { error: insertError } = await supabase
            .from('playlist_songs')
            .insert({
              playlist_id: finalPlaylistId,
              song_id: song.id,
              song_data: song,
              position: nextPosition,
            });

          if (insertError) {
            results.failed++;
            results.errors.push(`Error adding ${track.name}: ${insertError.message}`);
            console.error('Error adding song to playlist:', insertError);
          } else {
            results.imported++;
          }
        } else {
          results.failed++;
          results.errors.push(`Not found: ${track.name} by ${track.artists[0]?.name || 'Unknown'}`);
        }
      } catch (error: any) {
        results.failed++;
        const errorMsg = error?.message || 'Unknown error';
        results.errors.push(`Error importing: ${track.name} - ${errorMsg}`);
        console.error(`Error importing track ${track.name}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      playlistId: finalPlaylistId,
      results,
    });
  } catch (error: any) {
    console.error('Error importing Spotify playlist:', error);
    return NextResponse.json(
      { 
        error: 'Failed to import playlist',
        details: error?.message || 'Unknown error',
        stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined
      },
      { status: 500 }
    );
  }
}

