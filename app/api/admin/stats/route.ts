import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Verify admin session
function verifyAdminSession(request: NextRequest): boolean {
  const sessionToken = request.cookies.get('admin_session')?.value;
  return !!sessionToken;
}

export async function GET(request: NextRequest) {
  // Verify admin authentication
  if (!verifyAdminSession(request)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const supabase = await createClient();
    
    // Get total users
    const { count: totalUsers } = await supabase
      .from('song_plays')
      .select('user_id', { count: 'exact', head: true });

    // Get total songs played
    const { count: totalSongsPlayed } = await supabase
      .from('song_plays')
      .select('*', { count: 'exact', head: true });

    // Get total listening time (sum of all session durations)
    const { data: sessions } = await supabase
      .from('listening_sessions')
      .select('total_duration_seconds');

    const totalListeningTime = sessions?.reduce(
      (sum, session) => sum + (session.total_duration_seconds || 0),
      0
    ) || 0;

    // Get most played songs
    const { data: songPlays } = await supabase
      .from('song_plays')
      .select('song_id, song_title, song_artist, duration_seconds');

    const songStats = new Map<string, {
      song_id: string;
      song_title: string;
      song_artist: string;
      play_count: number;
      total_duration: number;
    }>();

    songPlays?.forEach((play) => {
      const key = play.song_id;
      if (!songStats.has(key)) {
        songStats.set(key, {
          song_id: play.song_id,
          song_title: play.song_title || 'Unknown',
          song_artist: play.song_artist || 'Unknown',
          play_count: 0,
          total_duration: 0,
        });
      }
      const stat = songStats.get(key)!;
      stat.play_count++;
      stat.total_duration += play.duration_seconds || 0;
    });

    const mostPlayedSongs = Array.from(songStats.values())
      .sort((a, b) => b.play_count - a.play_count)
      .slice(0, 10);

    // Get user listening stats
    const { data: allSessions } = await supabase
      .from('listening_sessions')
      .select('user_id, total_duration_seconds, songs_played');

    const userStats = new Map<string, {
      user_id: string;
      total_duration_seconds: number;
      total_songs_played: number;
      total_sessions: number;
    }>();

    allSessions?.forEach((session) => {
      const userId = session.user_id;
      if (!userStats.has(userId)) {
        userStats.set(userId, {
          user_id: userId,
          total_duration_seconds: 0,
          total_songs_played: 0,
          total_sessions: 0,
        });
      }
      const stat = userStats.get(userId)!;
      stat.total_duration_seconds += session.total_duration_seconds || 0;
      stat.total_songs_played += session.songs_played || 0;
      stat.total_sessions++;
    });

    const topUsers = Array.from(userStats.values())
      .sort((a, b) => b.total_duration_seconds - a.total_duration_seconds)
      .slice(0, 10);

    // Get daily stats (last 30 days)
    const { data: dailyPlays } = await supabase
      .from('song_plays')
      .select('played_at, duration_seconds')
      .gte('played_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    const dailyStatsMap = new Map<string, { plays: number; listeningTime: number }>();
    
    dailyPlays?.forEach((play) => {
      const date = new Date(play.played_at).toISOString().split('T')[0];
      if (!dailyStatsMap.has(date)) {
        dailyStatsMap.set(date, { plays: 0, listeningTime: 0 });
      }
      const stat = dailyStatsMap.get(date)!;
      stat.plays++;
      stat.listeningTime += play.duration_seconds || 0;
    });

    const dailyStats = Array.from(dailyStatsMap.entries())
      .map(([date, stats]) => ({ date, ...stats }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Get hourly stats
    const { data: hourlyPlays } = await supabase
      .from('song_plays')
      .select('played_at');

    const hourlyStatsMap = new Map<number, number>();
    
    hourlyPlays?.forEach((play) => {
      const hour = new Date(play.played_at).getHours();
      hourlyStatsMap.set(hour, (hourlyStatsMap.get(hour) || 0) + 1);
    });

    const hourlyStats = Array.from(hourlyStatsMap.entries())
      .map(([hour, plays]) => ({ hour, plays }))
      .sort((a, b) => a.hour - b.hour);

    return NextResponse.json({
      totalUsers: totalUsers || 0,
      totalSongsPlayed: totalSongsPlayed || 0,
      totalListeningTime,
      mostPlayedSongs,
      topUsers,
      dailyStats,
      hourlyStats,
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

