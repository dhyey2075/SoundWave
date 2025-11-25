import type { Song } from './types';

export async function searchSongs(query: string): Promise<Song[]> {
  if (!query) return [];
  
  try {
    const response = await fetch(
      `https://saavnapi-nine.vercel.app/result/?query=${encodeURIComponent(query)}`
    );
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error(`Music API error (${response.status}):`, errorText);
      return [];
    }
    
    // Get response text first to handle JSON parsing errors gracefully
    const responseText = await response.text();
    
    if (!responseText || responseText.trim() === '') {
      console.error('Music API returned empty response');
      return [];
    }
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError);
      console.error('Response text:', responseText.substring(0, 200));
      return [];
    }
    
    // Check if data is an array
    if (!Array.isArray(data)) {
      console.error('Music API returned non-array response:', typeof data, data);
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
  } catch (error: any) {
    console.error('Error fetching songs:', error);
    // Return empty array instead of throwing to allow import to continue
    return [];
  }
}