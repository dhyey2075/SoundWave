'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  Music,
  Users,
  Clock,
  LogOut,
  RefreshCw,
  BarChart3,
  Activity,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BackgroundDots } from '@/components/BackgroundDots';
import { CursorFollower } from '@/components/CursorFollower';
import { MusicLoader } from '@/components/MusicLoader';

interface AdminStats {
  totalUsers: number;
  totalSongsPlayed: number;
  totalListeningTime: number;
  mostPlayedSongs: Array<{
    song_id: string;
    song_title: string;
    song_artist: string;
    play_count: number;
    total_duration: number;
  }>;
  topUsers: Array<{
    user_id: string;
    total_duration_seconds: number;
    total_songs_played: number;
    total_sessions: number;
  }>;
  dailyStats: Array<{
    date: string;
    plays: number;
    listeningTime: number;
  }>;
  hourlyStats: Array<{
    hour: number;
    plays: number;
  }>;
}

const COLORS = ['#ff6ec7', '#ffeb6e', '#6effc7', '#9f6eff', '#ff9f6e', '#6ec7ff'];

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check authentication
    fetch('/api/admin/login')
      .then((res) => res.json())
      .then((data) => {
        setIsChecking(false);
        if (!data.authenticated) {
          router.push('/admin/login');
        } else {
          fetchStats();
        }
      })
      .catch(() => {
        setIsChecking(false);
        router.push('/admin/login');
      });
  }, [router]);

  const fetchStats = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch('/api/admin/stats');
      if (response.status === 401) {
        router.push('/admin/login');
        return;
      }
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleLogout = async () => {
    try {
      // Call logout API to clear the httpOnly cookie
      await fetch('/api/admin/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // Redirect to login page
      router.push('/admin/login');
    }
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (isChecking || isLoading) {
    return (
      <main className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <BackgroundDots />
        <CursorFollower />
        <div className="relative z-10">
          <MusicLoader />
        </div>
      </main>
    );
  }

  if (!stats) {
    return (
      <main className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <BackgroundDots />
        <CursorFollower />
        <div className="relative z-10 text-center">
          <p className="text-muted-foreground">No data available</p>
          <Button onClick={fetchStats} className="mt-4">
            Refresh
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      <BackgroundDots />
      <CursorFollower />
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2 bg-gradient-to-r from-primary via-pink-500 to-cyan-500 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground">Music App Analytics & Statistics</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={fetchStats}
              disabled={isRefreshing}
              variant="ghost"
              className="glass hover:bg-white/10"
            >
              <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="glass hover:bg-white/10"
            >
              <LogOut className="h-5 w-5 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="glass-strong rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500">
                <Users className="h-6 w-6 text-white" />
              </div>
              <TrendingUp className="h-5 w-5 text-green-400" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-1">{stats.totalUsers}</h3>
            <p className="text-sm text-muted-foreground">Total Users</p>
          </div>

          <div className="glass-strong rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-full bg-gradient-to-br from-pink-500 to-rose-500">
                <Music className="h-6 w-6 text-white" />
              </div>
              <TrendingUp className="h-5 w-5 text-green-400" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-1">
              {stats.totalSongsPlayed.toLocaleString()}
            </h3>
            <p className="text-sm text-muted-foreground">Total Songs Played</p>
          </div>

          <div className="glass-strong rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <TrendingUp className="h-5 w-5 text-green-400" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-1">
              {formatDuration(stats.totalListeningTime)}
            </h3>
            <p className="text-sm text-muted-foreground">Total Listening Time</p>
          </div>

          <div className="glass-strong rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <TrendingUp className="h-5 w-5 text-green-400" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-1">
              {stats.topUsers.length}
            </h3>
            <p className="text-sm text-muted-foreground">Active Users</p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Most Played Songs */}
          <div className="glass-strong rounded-2xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Most Played Songs
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.mostPlayedSongs.slice(0, 5)}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis
                  dataKey="song_title"
                  stroke="rgba(255,255,255,0.5)"
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="play_count" fill="#ff6ec7" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Daily Listening Activity */}
          <div className="glass-strong rounded-2xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Daily Listening Activity
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.dailyStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis
                  dataKey="date"
                  stroke="rgba(255,255,255,0.5)"
                  fontSize={12}
                  tickFormatter={formatDate}
                />
                <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="plays"
                  stroke="#ff6ec7"
                  strokeWidth={2}
                  name="Plays"
                />
                <Line
                  type="monotone"
                  dataKey="listeningTime"
                  stroke="#6effc7"
                  strokeWidth={2}
                  name="Listening Time (s)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Hourly Activity */}
          <div className="glass-strong rounded-2xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Hourly Activity Distribution
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.hourlyStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis
                  dataKey="hour"
                  stroke="rgba(255,255,255,0.5)"
                  fontSize={12}
                  label={{ value: 'Hour of Day', position: 'insideBottom', offset: -5 }}
                />
                <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="plays" fill="#ffeb6e" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top Users */}
          <div className="glass-strong rounded-2xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Top Users by Listening Time
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={stats.topUsers.slice(0, 5).map((user, idx) => ({
                  ...user,
                  name: `User ${idx + 1}`,
                }))}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis type="number" stroke="rgba(255,255,255,0.5)" fontSize={12} />
                <YAxis
                  dataKey="name"
                  type="category"
                  stroke="rgba(255,255,255,0.5)"
                  fontSize={12}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => formatDuration(value)}
                />
                <Bar dataKey="total_duration_seconds" fill="#9f6eff" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Most Played Songs Table */}
        <div className="glass-strong rounded-2xl p-6 border border-white/10">
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <Music className="h-5 w-5 text-primary" />
            Most Played Songs (Top 10)
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Rank</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Song</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Artist</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-foreground">Plays</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-foreground">
                    Total Duration
                  </th>
                </tr>
              </thead>
              <tbody>
                {stats.mostPlayedSongs.slice(0, 10).map((song, index) => (
                  <tr
                    key={song.song_id}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="py-3 px-4 text-sm text-muted-foreground">#{index + 1}</td>
                    <td className="py-3 px-4 text-sm text-foreground font-medium">
                      {song.song_title}
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{song.song_artist}</td>
                    <td className="py-3 px-4 text-sm text-foreground text-right">
                      {song.play_count.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-sm text-foreground text-right">
                      {formatDuration(song.total_duration)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}

