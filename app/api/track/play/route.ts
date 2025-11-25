import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { song, durationSeconds, completed } = await request.json();

    if (!song || !song.id) {
      return NextResponse.json(
        { error: 'Invalid song data' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('song_plays')
      .insert({
        user_id: user.id,
        song_id: song.id,
        song_title: song.title || 'Unknown',
        song_artist: song.artist || 'Unknown',
        song_album: song.album || 'Unknown',
        duration_seconds: durationSeconds || 0,
        completed: completed || false,
      });

    if (error) {
      console.error('Error tracking song play:', error);
      return NextResponse.json(
        { error: 'Failed to track song play' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in track/play route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

