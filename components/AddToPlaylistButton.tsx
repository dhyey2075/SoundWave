'use client';

import { useState, useEffect } from 'react';
import { ListMusic, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { getUserPlaylists, addSongToPlaylist, createPlaylist } from '@/lib/playlists';
import type { Playlist, Song } from '@/lib/types';
import { chipSounds } from '@/lib/sounds';

interface AddToPlaylistButtonProps {
  song: Song;
  userId: string;
  onAdd?: () => void;
}

export function AddToPlaylistButton({ song, userId, onAdd }: AddToPlaylistButtonProps) {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDescription, setNewPlaylistDescription] = useState('');

  useEffect(() => {
    if (isOpen && userId) {
      loadPlaylists();
    }
  }, [isOpen, userId]);

  const loadPlaylists = async () => {
    setIsLoading(true);
    const data = await getUserPlaylists(userId);
    setPlaylists(data);
    setIsLoading(false);
  };

  const handleAddToPlaylist = async (playlistId: string) => {
    chipSounds.click();
    const success = await addSongToPlaylist(playlistId, song);
    if (success) {
      setIsOpen(false);
      if (onAdd) {
        onAdd();
      }
    }
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
      
      // Add song to the new playlist
      await addSongToPlaylist(playlist.id, song);
      setIsOpen(false);
      if (onAdd) {
        onAdd();
      }
    }
  };

  return (
    <>
      <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => {
                chipSounds.click();
                setIsOpen(true);
              }}
              className="glass-strong bg-black/60 hover:bg-black/80 rounded-full h-8 w-8"
              title="Add to playlist"
            >
              <ListMusic className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="glass-strong border-white/10 w-80 p-4" align="end">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm mb-3">Add to Playlist</h4>
              {isLoading ? (
                <p className="text-sm text-muted-foreground">Loading playlists...</p>
              ) : playlists.length === 0 ? (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">No playlists yet</p>
                  <Button
                    size="sm"
                    onClick={() => {
                      setIsCreateDialogOpen(true);
                      setIsOpen(false);
                    }}
                    className="w-full glass-strong bg-primary/20 hover:bg-primary/30"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Playlist
                  </Button>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto queue-scrollbar">
                  {playlists.map((playlist) => (
                    <button
                      key={playlist.id}
                      onClick={() => handleAddToPlaylist(playlist.id)}
                      className="w-full text-left glass rounded-lg p-3 hover:bg-white/10 transition-colors"
                    >
                      <p className="font-medium text-sm">{playlist.name}</p>
                      {playlist.song_count !== undefined && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {playlist.song_count} song{playlist.song_count !== 1 ? 's' : ''}
                        </p>
                      )}
                    </button>
                  ))}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setIsCreateDialogOpen(true);
                      setIsOpen(false);
                    }}
                    className="w-full glass hover:bg-white/10 mt-2"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Playlist
                  </Button>
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="glass-strong border-white/10">
          <DialogHeader>
            <DialogTitle>Create New Playlist</DialogTitle>
            <DialogDescription>
              Create a new playlist and add this song to it.
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
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCreatePlaylist();
                  }
                }}
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
              Create & Add Song
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

