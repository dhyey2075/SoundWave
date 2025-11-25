import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { searchSongs } from '@/lib/api';
import type { Song } from '@/lib/types';

// Shared progress store (in production, use Redis or database)
declare global {
  var spotifyImportProgress: Map<string, {
    current: number;
    total: number;
    imported: number;
    failed: number;
    skipped: number;
    currentTrack: string;
    errors: string[];
  }>;
}

if (!global.spotifyImportProgress) {
  global.spotifyImportProgress = new Map();
}

const progressStore = global.spotifyImportProgress;

function setImportProgress(sessionId: string, progress: any) {
  progressStore.set(sessionId, progress);
}

function clearImportProgress(sessionId: string) {
  progressStore.delete(sessionId);
}

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
    const { playlistId, playlistName, createNewPlaylist, targetPlaylistId, sessionId } = await request.json();
    
    // Generate session ID if not provided
    const importSessionId = sessionId || `import_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

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
      current: 0,
      total: tracks.length,
      imported: 0,
      failed: 0,
      skipped: 0,
      errors: [] as Array<{ track: string; reason: string }>,
    };

    // Process tracks with progress updates
    for (let i = 0; i < tracks.length; i++) {
      const item = tracks[i];
      const track = item.track;
      if (!track) {
        results.current = i + 1;
        continue;
      }

      const trackName = `${track.name}${track.artists[0]?.name ? ` by ${track.artists[0].name}` : ''}`;

      // Update progress
      setImportProgress(importSessionId, {
        current: i + 1,
        total: tracks.length,
        imported: results.imported,
        failed: results.failed,
        skipped: results.skipped,
        currentTrack: trackName,
        errors: results.errors.map(e => `${e.track}: ${e.reason}`),
      });

      try {
        // Search for track in your music API
        const searchQuery = `${track.artists[0]?.name || ''} ${track.name}`.trim();
        
        if (!searchQuery) {
          results.failed++;
          results.errors.push({ track: trackName, reason: 'Invalid search query' });
          continue;
        }

        let songs: Song[] = [];
        try {
          songs = await searchSongs(searchQuery);
        } catch (searchError: any) {
          // Handle search API errors gracefully
          const errorMsg = searchError?.message || 'Search API error';
          console.error(`Search error for "${trackName}":`, errorMsg);
          results.failed++;
          results.errors.push({ track: trackName, reason: `Search failed: ${errorMsg}` });
          continue;
        }

        if (songs && songs.length > 0) {
          // Use the first matching song
          const song = songs[0];
          
          if (!song || !song.id) {
            results.failed++;
            results.errors.push({ track: trackName, reason: 'Invalid song data returned' });
            continue;
          }

          // Add song to playlist using server-side client
          try {
            // Check if song already exists in playlist
            const { data: existing, error: checkError } = await supabase
              .from('playlist_songs')
              .select('id')
              .eq('playlist_id', finalPlaylistId)
              .eq('song_id', song.id)
              .maybeSingle();

            if (checkError && checkError.code !== 'PGRST116') {
              // PGRST116 is "not found" which is expected
              throw checkError;
            }

            if (existing) {
              results.skipped++;
              results.errors.push({ track: trackName, reason: 'Already in playlist' });
              continue;
            }

            // Get current max position
            const { data: maxPos } = await supabase
              .from('playlist_songs')
              .select('position')
              .eq('playlist_id', finalPlaylistId)
              .order('position', { ascending: false })
              .limit(1)
              .maybeSingle();

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
              results.errors.push({ track: trackName, reason: `Database error: ${insertError.message}` });
              console.error('Error adding song to playlist:', insertError);
            } else {
              results.imported++;
            }
          } catch (dbError: any) {
            results.failed++;
            results.errors.push({ track: trackName, reason: `Database error: ${dbError?.message || 'Unknown'}` });
            console.error(`Database error for "${trackName}":`, dbError);
          }
        } else {
          results.failed++;
          results.errors.push({ track: trackName, reason: 'Not found in music library' });
        }
      } catch (error: any) {
        // Catch any unexpected errors
        const errorMsg = error?.message || 'Unknown error';
        results.failed++;
        results.errors.push({ track: trackName, reason: errorMsg });
        console.error(`Unexpected error importing track "${trackName}":`, error);
      }
    }

    // Clear progress after completion
    clearImportProgress(importSessionId);

    return NextResponse.json({
      success: true,
      playlistId: finalPlaylistId,
      sessionId: importSessionId,
      results: {
        ...results,
        errors: results.errors.slice(0, 100), // Limit errors to first 100 to avoid huge responses
      },
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

