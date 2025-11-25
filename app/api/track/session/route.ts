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

    const { action, sessionId, totalDurationSeconds, songsPlayed } = await request.json();

    if (action === 'start') {
      const { data, error } = await supabase
        .from('listening_sessions')
        .insert({
          user_id: user.id,
          started_at: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error starting session:', error);
        return NextResponse.json(
          { error: 'Failed to start session' },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, sessionId: data.id });
    } else if (action === 'update' && sessionId) {
      const { error } = await supabase
        .from('listening_sessions')
        .update({
          ended_at: new Date().toISOString(),
          total_duration_seconds: totalDurationSeconds || 0,
          songs_played: songsPlayed || 0,
        })
        .eq('id', sessionId);

      if (error) {
        console.error('Error updating session:', error);
        return NextResponse.json(
          { error: 'Failed to update session' },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error in track/session route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

