import { createClient } from '@/lib/supabase/client';
import type { Playlist, PlaylistSong, Song } from '@/lib/types';

export async function getUserPlaylists(userId: string): Promise<Playlist[]> {
  const supabase = createClient();
  try {
    const { data, error } = await supabase
      .from('playlists')
      .select(`
        *,
        playlist_songs(id)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map((playlist: any) => ({
      ...playlist,
      song_count: Array.isArray(playlist.playlist_songs) ? playlist.playlist_songs.length : 0,
    }));
  } catch (error) {
    console.error('Error fetching playlists:', error);
    return [];
  }
}

export async function createPlaylist(userId: string, name: string, description?: string): Promise<Playlist | null> {
  const supabase = createClient();
  try {
    const { data, error } = await supabase
      .from('playlists')
      .insert({
        user_id: userId,
        name,
        description,
      })
      .select()
      .single();

    if (error) throw error;
    return { ...data, song_count: 0 };
  } catch (error) {
    console.error('Error creating playlist:', error);
    return null;
  }
}

export async function deletePlaylist(playlistId: string): Promise<boolean> {
  const supabase = createClient();
  try {
    const { error } = await supabase
      .from('playlists')
      .delete()
      .eq('id', playlistId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting playlist:', error);
    return false;
  }
}

export async function addSongToPlaylist(playlistId: string, song: Song): Promise<boolean> {
  const supabase = createClient();
  try {
    // Check if song already exists in playlist
    const { data: existing } = await supabase
      .from('playlist_songs')
      .select('id')
      .eq('playlist_id', playlistId)
      .eq('song_id', song.id)
      .single();

    if (existing) {
      return false; // Song already in playlist
    }

    // Get current max position
    const { data: maxPos } = await supabase
      .from('playlist_songs')
      .select('position')
      .eq('playlist_id', playlistId)
      .order('position', { ascending: false })
      .limit(1)
      .single();

    const nextPosition = maxPos ? maxPos.position + 1 : 0;

    const { error } = await supabase
      .from('playlist_songs')
      .insert({
        playlist_id: playlistId,
        song_id: song.id,
        song_data: song,
        position: nextPosition,
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error adding song to playlist:', error);
    return false;
  }
}

export async function removeSongFromPlaylist(playlistId: string, songId: string): Promise<boolean> {
  const supabase = createClient();
  try {
    const { error } = await supabase
      .from('playlist_songs')
      .delete()
      .eq('playlist_id', playlistId)
      .eq('song_id', songId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error removing song from playlist:', error);
    return false;
  }
}

export async function getPlaylistSongs(playlistId: string): Promise<Song[]> {
  const supabase = createClient();
  try {
    const { data, error } = await supabase
      .from('playlist_songs')
      .select('song_data')
      .eq('playlist_id', playlistId)
      .order('position', { ascending: true });

    if (error) throw error;

    return data.map((item: any) => item.song_data as Song);
  } catch (error) {
    console.error('Error fetching playlist songs:', error);
    return [];
  }
}

