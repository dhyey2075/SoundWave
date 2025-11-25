import type { Song } from './types';

export async function searchSongs(query: string): Promise<Song[]> {
  if (!query) return [];
  
  try {
    const response = await fetch(
      `https://saavnapi-nine.vercel.app/result/?query=${encodeURIComponent(query)}`
    );
    
    if (!response.ok) {
      console.error(`Music API error (${response.status}):`, await response.text());
      return [];
    }
    
    const data = await response.json();
    
    // Check if data is an array
    if (!Array.isArray(data)) {
      console.error('Music API returned non-array response:', data);
      return [];
    }
    
    // Transform API response to match Song interface
    return data
      .filter((item: any) => item && (item.id || item.song || item.title)) // Filter out invalid items
      .map((item: any) => ({
        id: item.id || `temp_${Date.now()}_${Math.random()}`,
        title: item.song || item.title || 'Unknown',
        image: item.image || '',
        album: item.album || 'Unknown',
        url: item.media_url || item.url || '',
        previewUrl: item.media_preview_url,
        duration: item.duration || '0:00',
        year: item.year || '',
        artist: item.primary_artists || item.singers || item.artist || 'Unknown',
      }));
  } catch (error) {
    console.error('Error fetching songs:', error);
    return [];
  }
}