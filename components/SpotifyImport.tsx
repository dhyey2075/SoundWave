'use client';

import { useState, useEffect } from 'react';
import { Music, Loader2, CheckCircle2, XCircle, AlertCircle, Import } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { chipSounds } from '@/lib/sounds';
import { getUserPlaylists } from '@/lib/playlists';
import type { Playlist } from '@/lib/types';

interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  trackCount: number;
  owner: string;
}

interface SpotifyImportProps {
  userId: string;
  onImportComplete?: () => void;
}

export function SpotifyImport({ userId, onImportComplete }: SpotifyImportProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoadingPlaylists, setIsLoadingPlaylists] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [spotifyPlaylists, setSpotifyPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string>('');
  const [userPlaylists, setUserPlaylists] = useState<Playlist[]>([]);
  const [createNewPlaylist, setCreateNewPlaylist] = useState(true);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [targetPlaylistId, setTargetPlaylistId] = useState<string>('');
  const [importProgress, setImportProgress] = useState<{
    total: number;
    imported: number;
    failed: number;
    skipped: number;
  } | null>(null);
  const [importErrors, setImportErrors] = useState<string[]>([]);

  useEffect(() => {
    // Check if user is connected to Spotify
    checkConnection();
    // Load user playlists
    if (userId) {
      loadUserPlaylists();
    }
  }, [userId]);

  useEffect(() => {
    // Check URL params for Spotify connection status
    const params = new URLSearchParams(window.location.search);
    if (params.get('spotify_connected') === 'true') {
      setIsConnected(true);
      setIsDialogOpen(true);
      loadSpotifyPlaylists();
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
    }
    if (params.get('spotify_error')) {
      const error = params.get('spotify_error');
      alert(`Spotify connection error: ${error}`);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  // Update playlist name when selection changes
  useEffect(() => {
    if (selectedPlaylistId && createNewPlaylist) {
      const playlist = spotifyPlaylists.find((p) => p.id === selectedPlaylistId);
      if (playlist && !newPlaylistName) {
        setNewPlaylistName(playlist.name);
      }
    }
  }, [selectedPlaylistId, spotifyPlaylists]);

  const checkConnection = async () => {
    try {
      const response = await fetch('/api/spotify/playlists');
      if (response.ok) {
        setIsConnected(true);
      }
    } catch (error) {
      setIsConnected(false);
    }
  };

  const loadUserPlaylists = async () => {
    try {
      const playlists = await getUserPlaylists(userId);
      setUserPlaylists(playlists);
    } catch (error) {
      console.error('Error loading user playlists:', error);
    }
  };

  const loadSpotifyPlaylists = async () => {
    setIsLoadingPlaylists(true);
    try {
      const response = await fetch('/api/spotify/playlists');
      if (response.status === 401) {
        setIsConnected(false);
        return;
      }
      if (!response.ok) {
        throw new Error('Failed to load playlists');
      }
      const data = await response.json();
      setSpotifyPlaylists(data.playlists || []);
    } catch (error) {
      console.error('Error loading Spotify playlists:', error);
      alert('Failed to load Spotify playlists. Please try again.');
    } finally {
      setIsLoadingPlaylists(false);
    }
  };

  const handleConnectSpotify = () => {
    chipSounds.click();
    window.location.href = '/api/spotify/authorize';
  };

  const handleOpenDialog = () => {
    chipSounds.click();
    if (!isConnected) {
      handleConnectSpotify();
      return;
    }
    setIsDialogOpen(true);
    loadSpotifyPlaylists();
  };

  const handleImport = async () => {
    if (!selectedPlaylistId) {
      alert('Please select a playlist to import');
      return;
    }

    if (createNewPlaylist && !newPlaylistName.trim()) {
      alert('Please enter a playlist name');
      return;
    }

    if (!createNewPlaylist && !targetPlaylistId) {
      alert('Please select a target playlist');
      return;
    }

    setIsImporting(true);
    setImportProgress(null);
    setImportErrors([]);

    try {
      const selectedPlaylist = spotifyPlaylists.find((p) => p.id === selectedPlaylistId);
      const playlistName = createNewPlaylist
        ? newPlaylistName.trim()
        : selectedPlaylist?.name || 'Imported from Spotify';

      const response = await fetch('/api/spotify/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playlistId: selectedPlaylistId,
          playlistName,
          createNewPlaylist,
          targetPlaylistId: createNewPlaylist ? null : targetPlaylistId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to import playlist');
      }

      const data = await response.json();
      setImportProgress(data.results);
      setImportErrors(data.results.errors || []);

      if (data.results.imported > 0) {
        // Reload user playlists
        await loadUserPlaylists();
        if (onImportComplete) {
          onImportComplete();
        }
      }
    } catch (error: any) {
      console.error('Error importing playlist:', error);
      alert(error.message || 'Failed to import playlist. Please try again.');
    } finally {
      setIsImporting(false);
    }
  };

  const selectedPlaylist = spotifyPlaylists.find((p) => p.id === selectedPlaylistId);

  return (
    <>
      <Button
        size="sm"
        variant="ghost"
        className="glass hover:bg-white/10"
        onClick={handleOpenDialog}
      >
        <Import className="h-4 w-4 mr-2" />
        {isConnected ? 'Import from Spotify' : 'Connect Spotify'}
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="glass-strong border-white/10 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Music className="h-5 w-5 text-green-500" />
              Import from Spotify
            </DialogTitle>
            <DialogDescription>
              Select a Spotify playlist to import into your music library.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {!isConnected ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  Connect your Spotify account to import playlists
                </p>
                <Button onClick={handleConnectSpotify} className="glass-strong bg-green-500/20 hover:bg-green-500/30">
                  Connect to Spotify
                </Button>
              </div>
            ) : (
              <>
                {/* Select Spotify Playlist */}
                <div className="space-y-2">
                  <Label>Select Spotify Playlist</Label>
                  {isLoadingPlaylists ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : (
                    <Select value={selectedPlaylistId} onValueChange={setSelectedPlaylistId}>
                      <SelectTrigger className="glass">
                        <SelectValue placeholder="Choose a playlist..." />
                      </SelectTrigger>
                      <SelectContent className="glass-strong border-white/10">
                        {spotifyPlaylists.map((playlist) => (
                          <SelectItem key={playlist.id} value={playlist.id}>
                            <div className="flex items-center gap-3">
                              {playlist.image && (
                                <img
                                  src={playlist.image}
                                  alt={playlist.name}
                                  className="w-10 h-10 rounded object-cover"
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="font-medium truncate">{playlist.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {playlist.trackCount} tracks • {playlist.owner}
                                </div>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {selectedPlaylist && (
                  <>
                    {/* Import Options */}
                    <div className="space-y-4">
                      <Label>Import Options</Label>
                      <div className="space-y-3">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="radio"
                            checked={createNewPlaylist}
                            onChange={() => setCreateNewPlaylist(true)}
                            className="w-4 h-4 text-primary"
                          />
                          <span className="text-sm">Create new playlist</span>
                        </label>
                        {createNewPlaylist && (
                          <div className="ml-7">
                            <Input
                              placeholder="Enter playlist name"
                              value={newPlaylistName || selectedPlaylist.name}
                              onChange={(e) => setNewPlaylistName(e.target.value)}
                              className="glass"
                            />
                          </div>
                        )}

                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="radio"
                            checked={!createNewPlaylist}
                            onChange={() => setCreateNewPlaylist(false)}
                            className="w-4 h-4 text-primary"
                          />
                          <span className="text-sm">Add to existing playlist</span>
                        </label>
                        {!createNewPlaylist && (
                          <div className="ml-7">
                            <Select value={targetPlaylistId} onValueChange={setTargetPlaylistId}>
                              <SelectTrigger className="glass">
                                <SelectValue placeholder="Select playlist..." />
                              </SelectTrigger>
                              <SelectContent className="glass-strong border-white/10">
                                {userPlaylists.map((playlist) => (
                                  <SelectItem key={playlist.id} value={playlist.id}>
                                    {playlist.name} ({playlist.song_count || 0} songs)
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Import Progress */}
                    {importProgress && (
                      <div className="space-y-2 p-4 rounded-lg bg-white/5 border border-white/10">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Import Progress</span>
                          <span className="font-medium">
                            {importProgress.imported} / {importProgress.total}
                          </span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-primary to-cyan-500 h-2 rounded-full transition-all"
                            style={{
                              width: `${(importProgress.imported / importProgress.total) * 100}%`,
                            }}
                          />
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3 text-green-400" />
                            {importProgress.imported} imported
                          </span>
                          <span className="flex items-center gap-1">
                            <XCircle className="h-3 w-3 text-red-400" />
                            {importProgress.failed} not found
                          </span>
                          <span className="flex items-center gap-1">
                            <AlertCircle className="h-3 w-3 text-yellow-400" />
                            {importProgress.skipped} skipped
                          </span>
                        </div>
                        {importErrors.length > 0 && (
                          <details className="mt-2">
                            <summary className="text-xs text-muted-foreground cursor-pointer">
                              View errors ({importErrors.length})
                            </summary>
                            <ul className="mt-2 space-y-1 text-xs text-muted-foreground max-h-32 overflow-y-auto">
                              {importErrors.slice(0, 10).map((error, idx) => (
                                <li key={idx}>• {error}</li>
                              ))}
                            </ul>
                          </details>
                        )}
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setIsDialogOpen(false);
                setImportProgress(null);
                setImportErrors([]);
              }}
              className="glass hover:bg-white/10"
            >
              Cancel
            </Button>
            {isConnected && selectedPlaylistId && (
              <Button
                onClick={handleImport}
                disabled={isImporting || isLoadingPlaylists}
                className="glass-strong bg-green-500/20 hover:bg-green-500/30"
              >
                {isImporting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Import className="h-4 w-4 mr-2" />
                    Import Playlist
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

