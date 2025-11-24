export async function searchSongs(query: string): Promise<Song[]> {
  if (!query) return [];
  
  try {
    const response = await fetch(
      `https://saavnapi-nine.vercel.app/result/?query=${encodeURIComponent(query)}`
    );
    const data = await response.json();
    
    // Transform API response to match Song interface
    return data.map((item: any) => ({
      id: item.id,
      title: item.song || item.title,
      image: item.image,
      album: item.album,
      url: item.media_url || item.url,
      previewUrl: item.media_preview_url,
      duration: item.duration,
      year: item.year,
      artist: item.primary_artists || item.singers || item.artist,
    }));
  } catch (error) {
    console.error('Error fetching songs:', error);
    return [];
  }
}