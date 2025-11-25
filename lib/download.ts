import type { Song } from '@/lib/types';

const sanitizeFileName = (name: string) =>
  name
    .trim()
    .replace(/[^a-z0-9]+/gi, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase() || 'soundwave_track';

const getExtensionFromUrl = (url: string) => {
  try {
    const cleanPath = url.split('?')[0];
    const parts = cleanPath.split('.');
    const ext = parts.pop();
    if (ext && ext.length <= 4) {
      return ext;
    }
  } catch {
    // ignore
  }
  return 'mp3';
};

export async function downloadSongFile(song: Song) {
  if (!song.url) {
    throw new Error('Song URL is missing.');
  }

  const response = await fetch(song.url);
  if (!response.ok) {
    throw new Error('Unable to download this track right now.');
  }

  const blob = await response.blob();
  const blobUrl = URL.createObjectURL(blob);

  const fileSafeTitle = sanitizeFileName(song.title || 'track');
  const extension = getExtensionFromUrl(song.url);
  const downloadName = `${fileSafeTitle}_soundwave_by_dhyey.${extension}`;

  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = downloadName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(blobUrl);
}

