'use client';

import { useState, useEffect } from 'react';
import { Plus, X, Trash2, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { createPlaylist, getUserPlaylists, deletePlaylist } from '@/lib/playlists';
import type { Playlist, Song } from '@/lib/types';
import { chipSounds } from '@/lib/sounds';
import { SpotifyImport } from '@/components/SpotifyImport';

interface PlaylistManagerProps {
  userId: string;
  onPlayFromPlaylist?: (songs: Song[]) => void;
}

export function PlaylistManager({ userId, onPlayFromPlaylist }: PlaylistManagerProps) {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDescription, setNewPlaylistDescription] = useState('');

  useEffect(() => {
    if (userId) {
      loadPlaylists();
    }
  }, [userId]);

  const loadPlaylists = async () => {
    setIsLoading(true);
    const data = await getUserPlaylists(userId);
    setPlaylists(data);
    setIsLoading(false);
  };

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) return;

    chipSounds.click();
      const playlist = await createPlaylist(userId, newPlaylistName.trim(), newPlaylistDescription.trim() || undefined);
      if (playlist) {
        setPlaylists([playlist, ...playlists]);
        setNewPlaylistName('');
        setNewPlaylistDescription('');
        setIsCreateDialogOpen(false);
        await loadPlaylists();
      }
  };


  const handleDeletePlaylist = async (playlistId: string) => {
    chipSounds.click();
    const success = await deletePlaylist(playlistId);
    if (success) {
      setPlaylists(playlists.filter(p => p.id !== playlistId));
    }
  };

  if (!userId) return null;

  return (
    <div className="flex items-center gap-2">
      <SpotifyImport userId={userId} onImportComplete={loadPlaylists} />
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogTrigger asChild>
          <Button
            size="sm"
            variant="ghost"
            className="glass hover:bg-white/10"
            onClick={() => chipSounds.click()}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Playlist
          </Button>
        </DialogTrigger>
        <DialogContent className="glass-strong border-white/10">
          <DialogHeader>
            <DialogTitle>Create New Playlist</DialogTitle>
            <DialogDescription>
              Create a new playlist to organize your favorite songs.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Playlist Name</Label>
              <Input
                id="name"
                placeholder="My Awesome Playlist"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                className="glass"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Describe your playlist..."
                value={newPlaylistDescription}
                onChange={(e) => setNewPlaylistDescription(e.target.value)}
                className="glass min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setIsCreateDialogOpen(false)}
              className="glass hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreatePlaylist}
              className="glass-strong bg-primary/20 hover:bg-primary/30"
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}

interface PlaylistViewProps {
  playlist: Playlist;
  userId: string;
  onPlay: (songs: Song[]) => void;
  onDelete: (playlistId: string) => void;
  onView?: (playlist: Playlist) => void;
}

export function PlaylistView({ playlist, userId, onPlay, onDelete, onView }: PlaylistViewProps) {
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadSongs();
  }, [playlist.id]);

  const loadSongs = async () => {
    setIsLoading(true);
    try {
      const { getPlaylistSongs } = await import('@/lib/playlists');
      const data = await getPlaylistSongs(playlist.id);
      setSongs(data);
    } catch (error) {
      console.error('Error loading playlist songs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlay = () => {
    if (songs.length > 0) {
      chipSounds.click();
      onPlay(songs);
    }
  };

  const handleDelete = () => {
    chipSounds.click();
    onDelete(playlist.id);
  };

  const handleView = () => {
    if (onView) {
      onView(playlist);
    }
  };

  return (
    <div 
      className="glass-strong rounded-2xl p-6 hover:bg-white/5 transition-colors cursor-pointer"
      onClick={handleView}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-bold text-foreground truncate mb-1">{playlist.name}</h3>
          {playlist.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">{playlist.description}</p>
          )}
          <p className="text-xs text-muted-foreground mt-2">
            {songs.length} song{songs.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2 ml-4" onClick={(e) => e.stopPropagation()}>
          <Button
            size="icon"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              handlePlay();
            }}
            disabled={songs.length === 0}
            className="glass hover:bg-white/10 rounded-full"
            title="Play playlist"
          >
            <Play className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
            className="glass hover:bg-red-500/20 rounded-full"
            title="Delete playlist"
          >
            <Trash2 className="h-4 w-4 text-red-400" />
          </Button>
        </div>
      </div>
    </div>
  );
}

